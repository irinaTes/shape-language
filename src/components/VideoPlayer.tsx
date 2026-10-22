'use client'
import { FC, useRef, useState, useEffect, useCallback } from "react";
import { cn, resolveVideoUrl } from "@/app/utils/utils";
import { useVideoLoading } from './PageWithLoading';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
  controls?: boolean;
  onReady?: () => void;
}

// Hide the controls after this long without pointer movement (ms)
const IDLE_HIDE_DELAY = 2500;

// 83.4 → "01:23"; 3725 → "01:02:05"
function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

const monoLabel = "[font-family:var(--font-space-mono)] text-[10px] md:text-[11px] uppercase tracking-[0.2em]";

const VideoPlayer: FC<VideoPlayerProps> = ({ src, poster, className, onReady, controls = true }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubberRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingContext = useVideoLoading();
  const hasRegistered = useRef(false);
  const hasNotifiedReady = useRef(false);
  // Once the viewer pauses manually, stop auto play/pause on scroll
  const userPausedRef = useRef(false);
  const lastPointerTypeRef = useRef<string>('mouse');

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isVolumeDragging, setIsVolumeDragging] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [hasError, setHasError] = useState(false);

  // Register this video with the page loader (only once)
  useEffect(() => {
    if (!hasRegistered.current && loadingContext) {
      loadingContext.registerVideo();
      hasRegistered.current = true;
    }
  }, [loadingContext]);

  const notifyReady = useCallback(() => {
    if (hasNotifiedReady.current) return;
    hasNotifiedReady.current = true;
    setIsReady(true);
    onReady?.();
    loadingContext?.videoReady();
  }, [onReady, loadingContext]);

  // Media element events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateBuffered = () => {
      if (!video.duration || video.buffered.length === 0) return;
      setBuffered(video.buffered.end(video.buffered.length - 1) / video.duration);
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      notifyReady();
    };
    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      updateBuffered();
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onVolumeChange = () => {
      setIsMuted(video.muted);
      setVolume(video.volume);
    };
    const onError = () => {
      setHasError(true);
      // Never block the page loader on a broken video
      notifyReady();
    };

    // Metadata may already be loaded before this effect runs (cached video)
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) onLoadedMetadata();

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('progress', updateBuffered);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('canplay', onPlaying);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('error', onError);
    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('progress', updateBuffered);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('canplay', onPlaying);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('error', onError);
    };
  }, [src, notifyReady]);

  // Reset state when the source changes
  useEffect(() => {
    setHasError(false);
    setCurrentTime(0);
    setBuffered(0);
    userPausedRef.current = false;
  }, [src]);

  // Autoplay (muted) while at least half visible, pause when scrolled away
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    if (!wrapper || !video) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!reducedMotion && !userPausedRef.current) {
            video.play().catch(() => { /* autoplay blocked: wait for a click */ });
          }
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [src]);

  // Track fullscreen changes (including Esc)
  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === wrapperRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  useEffect(() => () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
  }, []);

  // Show controls, then hide them again after a quiet period while playing
  const pokeControls = useCallback(() => {
    setShowControls(true);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => setShowControls(false), IDLE_HIDE_DELAY);
  }, []);

  // Start the auto-hide countdown whenever playback starts
  useEffect(() => {
    if (isPlaying) pokeControls();
  }, [isPlaying, pokeControls]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      userPausedRef.current = false;
      video.play().catch(() => {});
    } else {
      userPausedRef.current = true;
      video.pause();
    }
    pokeControls();
  }, [pokeControls]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) video.volume = 1;
    pokeControls();
  }, [pokeControls]);

  // Setting a level also unmutes; dragging to 0 mutes
  const setVolumeLevel = useCallback((level: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.min(Math.max(level, 0), 1);
    video.volume = clamped;
    video.muted = clamped === 0;
    pokeControls();
  }, [pokeControls]);

  const toggleFullscreen = useCallback(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!wrapper || !video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (wrapper.requestFullscreen) {
      wrapper.requestFullscreen().catch(() => {});
    } else if (video.webkitEnterFullscreen) {
      // iOS Safari only supports fullscreen on the <video> element itself
      video.webkitEnterFullscreen();
    }
  }, []);

  const seekBy = useCallback((delta: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = Math.min(Math.max(video.currentTime + delta, 0), video.duration);
    pokeControls();
  }, [pokeControls]);

  // ── Scrubber ────────────────────────────────────────────────────────────
  const ratioFromPointer = (clientX: number) => {
    const rect = scrubberRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  };

  const seekToRatio = (ratio: number) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    video.currentTime = ratio * video.duration;
    setCurrentTime(video.currentTime);
  };

  const onScrubStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsScrubbing(true);
    seekToRatio(ratioFromPointer(e.clientX));
  };

  const onScrubMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const ratio = ratioFromPointer(e.clientX);
    setHoverRatio(ratio);
    if (isScrubbing) seekToRatio(ratio);
    pokeControls();
  };

  const onScrubEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsScrubbing(false);
  };

  // ── Volume slider ───────────────────────────────────────────────────────
  const volumeFromPointer = (clientX: number) => {
    const rect = volumeRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return 0;
    return Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
  };

  const onVolumeStart = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsVolumeDragging(true);
    setVolumeLevel(volumeFromPointer(e.clientX));
  };

  const onVolumeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isVolumeDragging) setVolumeLevel(volumeFromPointer(e.clientX));
  };

  const onVolumeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setIsVolumeDragging(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay();
        break;
      case 'm':
        toggleMute();
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 'ArrowRight':
        e.preventDefault();
        seekBy(5);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        seekBy(-5);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setVolumeLevel((isMuted ? 0 : volume) + 0.1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setVolumeLevel((isMuted ? 0 : volume) - 0.1);
        break;
    }
  };

  const controlsVisible = controls && (showControls || !isPlaying || isScrubbing || isVolumeDragging);

  // On touch, the first tap only reveals the controls instead of pausing
  const onVideoClick = () => {
    if (lastPointerTypeRef.current === 'touch' && !controlsVisible) {
      pokeControls();
      return;
    }
    togglePlay();
  };

  const progress = duration ? currentTime / duration : 0;
  const volumeLevel = isMuted ? 0 : volume;

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      role="region"
      aria-label="Video player"
      onKeyDown={controls ? onKeyDown : undefined}
      onPointerMove={controls ? pokeControls : undefined}
      // Mouse only: a touch "leaves" on every finger lift, which would hide the controls mid-tap
      onPointerLeave={(e) => e.pointerType === 'mouse' && isPlaying && setShowControls(false)}
      className={cn(
        "group/player relative w-full overflow-hidden bg-black outline-none select-none",
        "focus-visible:ring-1 focus-visible:ring-[var(--cyber-cyan)]",
        isFullscreen ? "flex items-center" : "aspect-video",
        !controlsVisible && isPlaying && "cursor-none",
        className
      )}
    >
      <video
        ref={videoRef}
        src={resolveVideoUrl(src)}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onPointerDown={(e) => { lastPointerTypeRef.current = e.pointerType; }}
        onClick={controls ? onVideoClick : undefined}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-700",
          isFullscreen && "object-contain",
          isReady ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Bottom fade for legibility */}
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500",
          controlsVisible ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Viewfinder corner brackets */}
      {controls && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-3 md:inset-5 transition-all duration-500",
            controlsVisible ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
          )}
        >
          {[
            "top-0 left-0 border-t border-l",
            "top-0 right-0 border-t border-r",
            "bottom-0 left-0 border-b border-l",
            "bottom-0 right-0 border-b border-r",
          ].map((pos) => (
            <span key={pos} className={cn("absolute w-4 h-4 md:w-6 md:h-6 border-[var(--cyber-cyan)]/70", pos)} />
          ))}
        </div>
      )}

      {/* Status — top left */}
      {controls && (
        <div
          className={cn(
            "pointer-events-none absolute top-5 left-6 md:top-8 md:left-10 flex items-center gap-2 text-white/80 transition-opacity duration-500",
            monoLabel,
            controlsVisible ? "opacity-100" : "opacity-0"
          )}
        >
          <span
            className={cn(
              "inline-block w-1.5 h-1.5 rounded-full",
              isPlaying ? "bg-[var(--cyber-cyan)] shadow-[0_0_8px_var(--cyber-cyan-glow-strong)] animate-pulse" : "bg-white/40"
            )}
          />
          {hasError ? "Signal lost" : isBuffering ? "Buffering" : isPlaying ? "Playback" : "Paused"}
        </div>
      )}

      {/* Muted hint — top right, only while autoplaying silently */}
      {controls && isMuted && isPlaying && (
        <button
          type="button"
          onClick={toggleMute}
          className={cn(
            "absolute top-4 right-5 md:top-7 md:right-9 px-3 py-1.5 border border-white/20 bg-black/40 backdrop-blur-sm text-white/80",
            "hover:border-[var(--cyber-cyan)] hover:text-[var(--cyber-cyan)] transition-all duration-300 cursor-pointer",
            monoLabel,
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          Sound off · tap to unmute
        </button>
      )}

      {/* Center play button when paused */}
      {controls && !isPlaying && isReady && !hasError && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="Play"
          className="absolute inset-0 m-auto w-16 h-16 md:w-20 md:h-20 grid place-items-center rounded-full border border-[var(--cyber-cyan)]/60 bg-black/40 backdrop-blur-sm text-[var(--cyber-cyan)] shadow-[0_0_30px_var(--cyber-cyan-glow)] hover:scale-105 hover:shadow-[0_0_50px_var(--cyber-cyan-glow-strong)] transition-all duration-300 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 md:w-7 md:h-7 ml-1" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
        </button>
      )}

      {/* Buffering spinner */}
      {(isBuffering || !isReady) && !hasError && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="w-10 h-10 rounded-full border border-white/10 border-t-[var(--cyber-cyan)] animate-spin" />
        </div>
      )}

      {/* Control bar */}
      {controls && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 px-5 pb-4 md:px-10 md:pb-7 transition-all duration-500",
            controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
          )}
        >
          {/* Scrubber */}
          <div
            ref={scrubberRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
            aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
            onPointerDown={onScrubStart}
            onPointerMove={onScrubMove}
            onPointerUp={onScrubEnd}
            onPointerCancel={onScrubEnd}
            onPointerLeave={() => setHoverRatio(null)}
            className="group/scrub relative h-5 flex items-center cursor-pointer touch-none"
          >
            <div className="relative w-full h-px group-hover/scrub:h-[3px] transition-all duration-200 bg-white/15">
              <div className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${buffered * 100}%` }} />
              <div
                className="absolute inset-y-0 left-0 bg-[var(--cyber-cyan)] shadow-[0_0_10px_var(--cyber-cyan-glow-strong)]"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            {/* Playhead */}
            <span
              className={cn(
                "absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3 bg-[var(--cyber-cyan)] shadow-[0_0_8px_var(--cyber-cyan-glow-strong)] transition-[height] duration-200",
                (isScrubbing || hoverRatio !== null) && "h-4"
              )}
              style={{ left: `${progress * 100}%` }}
            />
            {/* Hover time readout */}
            {hoverRatio !== null && duration > 0 && (
              <span
                className={cn(
                  "absolute bottom-full mb-2 -translate-x-1/2 px-2 py-1 bg-black/70 border border-[var(--cyber-cyan)]/40 text-[var(--cyber-cyan)] whitespace-nowrap pointer-events-none",
                  monoLabel
                )}
                style={{ left: `${Math.min(Math.max(hoverRatio, 0.04), 0.96) * 100}%` }}
              >
                {formatTime(hoverRatio * duration)}
              </span>
            )}
          </div>

          {/* Buttons + timecode */}
          <div className="mt-2 flex items-center gap-4 md:gap-6 text-white/80">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="hover:text-[var(--cyber-cyan)] transition-colors cursor-pointer"
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M7 4.5v15l13-7.5z" /></svg>
              )}
            </button>

            {/* Mute + volume slider (slider expands on hover / focus; hidden on touch, where volume is hardware-only) */}
            <div className="group/volume flex items-center gap-3">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? "Unmute" : "Mute"}
                className="hover:text-[var(--cyber-cyan)] transition-colors cursor-pointer"
              >
                {isMuted ? (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" /><path d="M16 9.5l5 5M21 9.5l-5 5" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" /><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11" /></svg>
                )}
              </button>
              <div
                ref={volumeRef}
                role="slider"
                tabIndex={0}
                aria-label="Volume"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(volumeLevel * 100)}
                onPointerDown={onVolumeStart}
                onPointerMove={onVolumeMove}
                onPointerUp={onVolumeEnd}
                onPointerCancel={onVolumeEnd}
                onKeyDown={(e) => {
                  // Left/right adjust volume here instead of seeking the video
                  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                  e.preventDefault();
                  e.stopPropagation();
                  setVolumeLevel(volumeLevel + (e.key === 'ArrowRight' ? 0.1 : -0.1));
                }}
                className={cn(
                  "relative h-5 hidden md:flex items-center cursor-pointer touch-none overflow-hidden",
                  "w-0 opacity-0 transition-all duration-300",
                  "group-hover/volume:w-20 group-hover/volume:opacity-100 group-focus-within/volume:w-20 group-focus-within/volume:opacity-100",
                  isVolumeDragging && "w-20 opacity-100"
                )}
              >
                <div className="relative w-full h-[3px] bg-white/15">
                  <div
                    className="absolute inset-y-0 left-0 bg-[var(--cyber-cyan)] shadow-[0_0_10px_var(--cyber-cyan-glow-strong)]"
                    style={{ width: `${volumeLevel * 100}%` }}
                  />
                </div>
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-3 bg-[var(--cyber-cyan)] shadow-[0_0_8px_var(--cyber-cyan-glow-strong)]"
                  style={{ left: `${Math.min(Math.max(volumeLevel, 0.01), 0.99) * 100}%` }}
                />
              </div>
            </div>

            <span className={cn("tabular-nums text-white/70", monoLabel)}>
              <span className="text-[var(--cyber-cyan)]">{formatTime(currentTime)}</span>
              <span className="mx-2 text-white/30">/</span>
              {formatTime(duration)}
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              className="ml-auto hover:text-[var(--cyber-cyan)] transition-colors cursor-pointer"
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
