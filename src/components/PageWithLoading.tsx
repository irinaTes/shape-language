'use client'
import { FC, useState, useEffect, createContext, useContext, useCallback } from "react";
import LoadingScreen from "./LoadingScreen";

interface VideoLoadingContextType {
  registerVideo: () => void;
  videoReady: () => void;
}

const VideoLoadingContext = createContext<VideoLoadingContextType | null>(null);

export const useVideoLoading = () => {
  const context = useContext(VideoLoadingContext);
  return context;
};

interface PageWithLoadingProps {
  children: React.ReactNode;
}

const PageWithLoading: FC<PageWithLoadingProps> = ({ children }) => {
  const [totalVideos, setTotalVideos] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Register a video (memoized to prevent infinite loops)
  const registerVideo = useCallback(() => {
    setTotalVideos((prev) => {
      console.log('Registering video, total will be:', prev + 1);
      return prev + 1;
    });
  }, []);

  // Mark a video as ready (memoized to prevent infinite loops)
  const videoReady = useCallback(() => {
    setLoadedVideos((prev) => {
      console.log('Video ready, loaded will be:', prev + 1);
      return prev + 1;
    });
  }, []);

  // Give components time to register
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 1000); // Give videos time to register
    return () => clearTimeout(timer);
  }, []); // Run only once

  // Log when initialization completes
  useEffect(() => {
    if (isInitialized) {
      console.log('Initialized - Total videos:', totalVideos);
    }
  }, [isInitialized, totalVideos]);

  // Check if all videos are loaded
  useEffect(() => {
    console.log('Check:', { isInitialized, totalVideos, loadedVideos });

    if (isInitialized) {
      if (totalVideos === 0) {
        // No videos on the page, hide loading immediately
        console.log('No videos found, hiding loading screen');
        setIsLoading(false);
      } else if (loadedVideos >= totalVideos) {
        // All videos loaded
        console.log('All videos loaded!');
        setTimeout(() => setIsLoading(false), 300);
      }
    }
  }, [isInitialized, totalVideos, loadedVideos]);

  const progress = totalVideos > 0 ? (loadedVideos / totalVideos) * 100 : 0;

  return (
    <VideoLoadingContext.Provider value={{ registerVideo, videoReady }}>
      <LoadingScreen isLoading={isLoading} progress={progress} />
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s' }}>
        {children}
      </div>
    </VideoLoadingContext.Provider>
  );
};

export default PageWithLoading;
