'use client'
import { FC, useRef, useState, useEffect } from "react";
import Player, { VimeoUrl } from '@vimeo/player';
import { useVideoLoading } from './PageWithLoading';

interface VideoPlayerProps {
  vimeoUrl: VimeoUrl;
  className?: string;
  onReady?: () => void;
}

const VideoPlayer: FC<VideoPlayerProps> = ({ vimeoUrl, className, onReady }) => {
  const vimeoContainerRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadingContext = useVideoLoading();
  const hasRegistered = useRef(false);
  const hasNotifiedReady = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isInView, setIsInView] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Register this video when component mounts (only once)
  useEffect(() => {
    if (!hasRegistered.current && loadingContext) {
      console.log('Registering video:', vimeoUrl);
      loadingContext.registerVideo();
      hasRegistered.current = true;
    }
  }, [loadingContext, vimeoUrl]);

  // Intersection Observer to detect when video is in view
  useEffect(() => {
    if (!wrapperRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInView(entry.isIntersecting);
        });
      },
      { threshold: 0.5 } // Play when 50% visible
    );

    observer.observe(wrapperRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Initialize Vimeo player
  useEffect(() => {
    if (!vimeoContainerRef.current || !vimeoUrl) return;

    const player = new Player(vimeoContainerRef.current, {
      url: vimeoUrl,
      controls: false,
      byline: false,
      portrait: false,
      title: false,
      autoplay: true,
      muted: true,
      loop: true,
      playsinline: true,
      preload: 'auto'
    });

    vimeoPlayerRef.current = player;

    // Set up event listeners
    player.on('play', () => setIsPlaying(true));
    player.on('pause', () => setIsPlaying(false));
    player.on('timeupdate', (data) => {
      setCurrentTime(data.seconds);
      setDuration(data.duration);
    });
    player.on('volumechange', (data) => {
      setVolume(data.volume);
    });

    // Get initial values and notify when ready
    Promise.all([
      player.getDuration().then((dur) => setDuration(dur)),
      player.getVolume().then((vol) => setVolume(vol)),
      player.getMuted().then((muted) => setIsMuted(muted)),
      player.ready()
    ]).then(() => {
      if (!hasNotifiedReady.current) {
        console.log('Video ready:', vimeoUrl);
        setIsReady(true);
        onReady?.();
        loadingContext?.videoReady();
        hasNotifiedReady.current = true;
      }
    });

    return () => {
      player.destroy();
      hasNotifiedReady.current = false;
      setIsReady(false);
    };
  }, [vimeoUrl]);

  // Play/pause based on viewport visibility
  useEffect(() => {
    if (!vimeoPlayerRef.current) return;

    if (isInView) {
      vimeoPlayerRef.current.play().catch((error) => {
        console.log('Autoplay blocked:', error);
      });
    } else {
      vimeoPlayerRef.current.pause().catch((error) => {
        console.log('Pause error:', error);
      });
    }
  }, [isInView]);

  const togglePlay = async () => {
    if (!vimeoPlayerRef.current) return;

    try {
      const paused = await vimeoPlayerRef.current.getPaused();
      if (paused) {
        await vimeoPlayerRef.current.play();
      } else {
        await vimeoPlayerRef.current.pause();
      }
    } catch (error) {
      console.log('Playback error:', error);
    }
  };

  const handleProgressChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!vimeoPlayerRef.current) return;
    const newTime = parseFloat(e.target.value);
    await vimeoPlayerRef.current.setCurrentTime(newTime);
  };

  const handleVolumeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!vimeoPlayerRef.current) return;
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    await vimeoPlayerRef.current.setVolume(newVolume);

    // Unmute if volume > 0
    if (newVolume > 0) {
      await vimeoPlayerRef.current.setMuted(false);
      setIsMuted(false);
    } else {
      await vimeoPlayerRef.current.setMuted(true);
      setIsMuted(true);
    }
  };

  const toggleMute = async () => {
    if (!vimeoPlayerRef.current) return;
    const currentMuted = await vimeoPlayerRef.current.getMuted();
    await vimeoPlayerRef.current.setMuted(!currentMuted);
    setIsMuted(!currentMuted);

    // If unmuting, restore volume or set to 0.5
    if (currentMuted && volume === 0) {
      await vimeoPlayerRef.current.setVolume(0.5);
      setVolume(0.5);
    }
  };

  const toggleFullscreen = async () => {
    if (!vimeoPlayerRef.current) return;
    try {
      await vimeoPlayerRef.current.requestFullscreen();
    } catch (error) {
      console.log('Fullscreen error:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={wrapperRef} className={`video-player-wrapper ${className || ''}`}>
      <div
        ref={vimeoContainerRef}
        className="vimeo-player"
        onClick={togglePlay}
        style={{ display: isReady ? 'block' : 'none' }}
      />

      <div className="video-controls">
        <div className="progress-bar-container">
          <input
            type="range"
            className="progress-bar"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
          />
        </div>

        <div className="controls-bottom">
          <button className="control-button" onClick={togglePlay}>
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <span className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <div className="volume-control">
            <button className="control-button" onClick={toggleMute}>
              {isMuted || volume === 0 ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                </svg>
              )}
            </button>
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </div>

          <button className="control-button fullscreen-button" onClick={toggleFullscreen}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
