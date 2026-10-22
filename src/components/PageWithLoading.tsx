'use client'
import { FC, useState, useEffect, createContext, useContext, useCallback } from "react";
import { usePathname } from "next/navigation";
import LoadingScreen from "./LoadingScreen";

interface LoadingContextType {
  registerVideo: () => void;
  videoReady: () => void;
  register3DScene: () => void;
  scene3DReady: () => void;
  isLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const useLoadingContext = () => useContext(LoadingContext);

// Keep the old name for backwards compatibility with VideoPlayer
export const useVideoLoading = () => useContext(LoadingContext);

interface PageWithLoadingProps {
  children: React.ReactNode;
}

const PageWithLoading: FC<PageWithLoadingProps> = ({ children }) => {
  const pathname = usePathname();
  const [totalVideos, setTotalVideos] = useState(0);
  const [loadedVideos, setLoadedVideos] = useState(0);
  const [total3DScenes, setTotal3DScenes] = useState(0);
  const [loaded3DScenes, setLoaded3DScenes] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const registerVideo = useCallback(() => {
    setTotalVideos((prev) => prev + 1);
  }, []);

  const videoReady = useCallback(() => {
    setLoadedVideos((prev) => prev + 1);
  }, []);

  const register3DScene = useCallback(() => {
    setTotal3DScenes((prev) => prev + 1);
  }, []);

  const scene3DReady = useCallback(() => {
    setLoaded3DScenes((prev) => prev + 1);
  }, []);

  // Reset on every navigation. Done during render (not in an effect) because
  // child effects run before parent effects: a reset effect here would wipe
  // out registrations the new page's components just made in the same commit.
  const [trackedPathname, setTrackedPathname] = useState(pathname);
  if (trackedPathname !== pathname) {
    setTrackedPathname(pathname);
    setIsLoading(true);
    setIsInitialized(false);
    setTotalVideos(0);
    setLoadedVideos(0);
    setTotal3DScenes(0);
    setLoaded3DScenes(0);
  }

  // Give components one frame to register themselves, then check
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setIsInitialized(true);
    });
    // Safety timeout: never block the page forever on a slow connection
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 12000);
    return () => {
      cancelAnimationFrame(timer);
      clearTimeout(safetyTimer);
    };
  }, [pathname]);

  // Check if everything is loaded
  useEffect(() => {
    if (!isInitialized) return;

    const videosReady = totalVideos === 0 || loadedVideos >= totalVideos;
    const scenesReady = total3DScenes === 0 || loaded3DScenes >= total3DScenes;

    if (videosReady && scenesReady) {
      setTimeout(() => setIsLoading(false), 300);
    }
  }, [isInitialized, totalVideos, loadedVideos, total3DScenes, loaded3DScenes]);

  return (
    <LoadingContext.Provider value={{ registerVideo, videoReady, register3DScene, scene3DReady, isLoading }}>
      <LoadingScreen isLoading={isLoading} />
      {/* <LoadingScreen isLoading={true} /> */}
      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.5s' }}>
        {children}
      </div>
    </LoadingContext.Provider>
  );
};

export default PageWithLoading;
