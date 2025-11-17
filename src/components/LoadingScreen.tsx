'use client'
import { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LoadingScreenProps {
  isLoading: boolean;
  progress?: number;
}

const LoadingScreen: FC<LoadingScreenProps> = ({ isLoading, progress }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
        >
          <div className="text-white text-center">
            <div className="mb-8">
              <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress || 0}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
            <p className="text-sm opacity-50">Loading videos... {Math.round(progress || 0)}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingScreen;
