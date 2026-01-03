'use client'
import { FC, useRef, useState, useEffect } from "react";
import Player, { VimeoUrl } from '@vimeo/player';
import { useVideoLoading } from './PageWithLoading';

interface VideoPlayerProps {
  vimeoUrl: VimeoUrl;
  className?: string;
  controls?: boolean;
  onReady?: () => void;
}

const VideoPlayer: FC<VideoPlayerProps> = ({ vimeoUrl, className, onReady, controls = true }) => {
  const vimeoContainerRef = useRef<HTMLDivElement>(null);
  const vimeoPlayerRef = useRef<Player | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const loadingContext = useVideoLoading();
  const hasRegistered = useRef(false);
  const hasNotifiedReady = useRef(false);

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
      controls,
      byline: false,
      portrait: false,
      title: false,
      autoplay: true,
      muted: true,
      loop: true,
      playsinline: true,
      preload: 'auto',
    });

    vimeoPlayerRef.current = player;

    // Notify when ready
    player.ready().then(() => {
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

  return (
    <div ref={wrapperRef} className={`video-player-wrapper ${className || ''}`}>
      <div
        ref={vimeoContainerRef}
        className="vimeo-player"
        style={{ display: isReady ? 'block' : 'none' }}
      />
    </div>
  );
};

export default VideoPlayer;
