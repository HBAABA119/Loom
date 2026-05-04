"use client";

import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from "lucide-react";
import { useTimeline } from "@/lib/engine/store";

interface TimelineProps {
  className?: string;
}

export default function Timeline({ className = "" }: TimelineProps) {
  const {
    currentStep,
    totalSteps,
    isPlaying,
    playbackSpeed,
    setStep,
    nextStep,
    prevStep,
    togglePlay,
    setPlaybackSpeed,
  } = useTimeline();

  const progress = totalSteps > 0 ? (currentStep / (totalSteps - 1)) * 100 : 0;

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const step = parseInt(e.target.value, 10);
    setStep(step);
  };

  const speedOptions = [0.5, 1, 2];

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm ${className}`}
      style={{ height: "80px" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center gap-4 px-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(0)}
            className="rounded p-2 hover:bg-accent"
          >
            <SkipBack size={18} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={prevStep}
            className="rounded p-2 hover:bg-accent"
          >
            <ChevronLeft size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="rounded-full bg-foreground p-3 text-background hover:bg-foreground/90"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={nextStep}
            className="rounded p-2 hover:bg-accent"
          >
            <ChevronRight size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStep(totalSteps - 1)}
            className="rounded p-2 hover:bg-accent"
          >
            <SkipForward size={18} />
          </motion.button>
        </div>

        {/* Scrubber */}
        <div className="flex flex-1 flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Step {currentStep + 1}</span>
            <span>{totalSteps > 0 ? totalSteps : 0} total</span>
          </div>

          <div className="relative h-6">
            {/* Progress bar background */}
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-accent" />

            {/* Progress bar fill */}
            <motion.div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            />

            {/* Scrubber input */}
            <input
              type="range"
              min={0}
              max={Math.max(0, totalSteps - 1)}
              value={currentStep}
              onChange={handleScrub}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              disabled={totalSteps === 0}
            />

            {/* Step markers */}
            {totalSteps > 0 && (
              <div className="pointer-events-none absolute inset-0 flex justify-between">
                {Array.from({ length: Math.min(totalSteps, 20) }).map((_, i) => {
                  const stepIndex = Math.floor((i / (Math.min(totalSteps, 20) - 1)) * (totalSteps - 1));
                  const isActive = stepIndex === currentStep;

                  return (
                    <motion.div
                      key={i}
                      className="h-full w-0.5"
                      initial={false}
                      animate={{
                        backgroundColor: isActive ? "#fff" : "#444",
                        scaleY: isActive ? 1.5 : 1,
                      }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    />
                  );
                })}
              </div>
            )}

            {/* Thumb indicator */}
            <motion.div
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-foreground"
              initial={{ left: 0 }}
              animate={{ left: `calc(${progress}% - 8px)` }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.2,
              }}
            />
          </div>
        </div>

        {/* Speed Control */}
        <div className="flex items-center gap-1">
          {speedOptions.map((speed) => (
            <motion.button
              key={speed}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPlaybackSpeed(speed)}
              className={`rounded px-3 py-1 text-xs ${
                playbackSpeed === speed
                  ? "bg-foreground text-background"
                  : "hover:bg-accent"
              }`}
            >
              {speed}x
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
