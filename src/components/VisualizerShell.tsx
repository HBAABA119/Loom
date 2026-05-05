"use client";

import { ReactNode, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Step {
  step: number;
  title: string;
  description: string;
  code?: string;
  highlightLines: number[];
  visualState: any;
}

interface VisualizerShellProps {
  title: string;
  steps: Step[];
  children: ReactNode;
  codeLines: string[];
}

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

export default function VisualizerShell({ title, steps, children, codeLines }: VisualizerShellProps) {
  const { 
    currentStep, 
    totalSteps, 
    isPlaying, 
    playbackSpeed,
    togglePlay, 
    pause,
    setStep, 
    nextStep, 
    prevStep,
    setTotalSteps,
    setPlaybackSpeed
  } = useTimeline();
  
  const { setActiveLines } = useCodeHighlight();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setTotalSteps(steps.length);
  }, [steps.length, setTotalSteps]);

  useEffect(() => {
    const step = steps[currentStep];
    if (step) {
      setActiveLines(step.highlightLines);
    }
  }, [currentStep, steps, setActiveLines]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (currentStep < totalSteps - 1) {
          nextStep();
        } else {
          pause();
        }
      }, 2000 / playbackSpeed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentStep, totalSteps, playbackSpeed, nextStep, pause]);

  const handleReset = useCallback(() => {
    pause();
    setStep(0);
  }, [pause, setStep]);

  const handleJump = useCallback((direction: "first" | "last") => {
    pause();
    setStep(direction === "first" ? 0 : totalSteps - 1);
  }, [pause, setStep, totalSteps]);

  const currentStepData = steps[currentStep] || steps[0];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header with Title */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-[#8b949e] text-sm">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <div className="w-32 h-2 bg-[#21262d] rounded-full ml-2">
            <div 
              className="h-full bg-[#58a6ff] rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization */}
        <div className="flex-1 relative">
          {children}
        </div>

        {/* Sidebar - Code & Explanation */}
        <div className="w-80 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          {/* Step Title */}
          <div className="p-4 border-b border-[#30363d]">
            <span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">
              Step {currentStep + 1}
            </span>
            <h4 className="text-white font-medium mt-1">{currentStepData?.title}</h4>
          </div>

          {/* Explanation */}
          <div className="p-4 border-b border-[#30363d] flex-1 overflow-y-auto">
            <p className="text-[#c9d1d9] text-sm leading-relaxed">
              {currentStepData?.description}
            </p>
          </div>

          {/* Code Panel */}
          <div className="p-4 bg-[#0d1117] max-h-48 overflow-y-auto">
            <div className="text-xs font-mono">
              {codeLines.map((line, i) => (
                <div 
                  key={i}
                  className={`px-2 py-0.5 rounded ${
                    currentStepData?.highlightLines?.includes(i + 1)
                      ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]"
                      : "text-[#8b949e]"
                  }`}
                >
                  <span className="text-[#6e7681] w-6 inline-block">{i + 1}</span>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleJump("first")}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
              title="Go to start"
            >
              <SkipBack size={18} />
            </button>
            <button
              onClick={prevStep}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
              title="Previous step"
            >
              <ChevronLeft size={20} />
            </button>
            
            <button
              onClick={togglePlay}
              className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            
            <button
              onClick={nextStep}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
              title="Next step"
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => handleJump("last")}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
              title="Go to end"
            >
              <SkipForward size={18} />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
              title="Reset"
            >
              <RotateCcw size={18} />
            </button>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-2">
            <span className="text-[#8b949e] text-sm">Speed:</span>
            <div className="flex gap-1">
              {speeds.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setPlaybackSpeed(s.value)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    playbackSpeed === s.value
                      ? "bg-[#58a6ff] text-white"
                      : "bg-[#21262d] text-[#8b949e] hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
