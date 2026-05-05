"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Info, Brain, Target, Zap
} from "lucide-react";

interface DataPoint {
  x: number;
  y: number;
  label: number;
}

interface Step {
  step: number;
  title: string;
  description: string;
  weights: [number, number];
  bias: number;
  learningRate: number;
  decisionBoundary: { w1: number; w2: number; b: number };
  accuracy: number;
  explanation: string;
}

const generateLinearData = (): DataPoint[] => [
  { x: 0.2, y: 0.1, label: 0 },
  { x: 0.1, y: 0.3, label: 0 },
  { x: 0.3, y: 0.2, label: 0 },
  { x: 0.7, y: 0.8, label: 1 },
  { x: 0.8, y: 0.9, label: 1 },
  { x: 0.9, y: 0.7, label: 1 },
];

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

export default function PerceptronVisualizer() {
  const [data] = useState<DataPoint[]>(generateLinearData());
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [weights, setWeights] = useState<[number, number]>([0.5, -0.3]);
  const [bias, setBias] = useState(0.1);
  const [learningRate, setLearningRate] = useState(0.1);
  const [showHelp, setShowHelp] = useState(false);
  const [isAutoTraining, setIsAutoTraining] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Generate training steps
  const generateSteps = useCallback((): Step[] => {
    const steps: Step[] = [];
    let w: [number, number] = [0.5, -0.3];
    let b = 0.1;
    const lr = learningRate;

    // Initial state
    steps.push({
      step: 0,
      title: "Initial State",
      description: "Perceptron starts with random weights and bias",
      weights: [...w] as [number, number],
      bias: b,
      learningRate: lr,
      decisionBoundary: { w1: w[0], w2: w[1], b },
      accuracy: calculateAccuracy(data, w, b),
      explanation: "Random initialization: weights determine the decision boundary",
    });

    // Training epochs
    for (let epoch = 0; epoch < 10; epoch++) {
      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        const z = w[0] * point.x + w[1] * point.y + b;
        const prediction = z >= 0 ? 1 : 0;
        const error = point.label - prediction;

        if (error !== 0) {
          // Update weights
          w = [
            w[0] + lr * error * point.x,
            w[1] + lr * error * point.y,
          ];
          b = b + lr * error;

          steps.push({
            step: steps.length,
            title: `Training Step ${steps.length}`,
            description: `Processing point (${point.x.toFixed(1)}, ${point.y.toFixed(1)}) with label ${point.label}`,
            weights: [...w] as [number, number],
            bias: b,
            learningRate: lr,
            decisionBoundary: { w1: w[0], w2: w[1], b },
            accuracy: calculateAccuracy(data, w, b),
            explanation: error !== 0 
              ? `Prediction wrong! Updating weights: w₁ += ${lr}×${error}×${point.x} = ${w[0].toFixed(3)}`
              : `Prediction correct. No update needed.`,
          });
        }
      }
    }

    return steps;
  }, [data, learningRate]);

  const [steps, setSteps] = useState<Step[]>([]);

  useEffect(() => {
    setSteps(generateSteps());
  }, [generateSteps]);

  function calculateAccuracy(data: DataPoint[], w: [number, number], b: number): number {
    let correct = 0;
    for (const point of data) {
      const z = w[0] * point.x + w[1] * point.y + b;
      const pred = z >= 0 ? 1 : 0;
      if (pred === point.label) correct++;
    }
    return correct / data.length;
  }

  // Auto-play animation
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      animationRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1000 / speed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  const currentState = steps[currentStep] || steps[0];

  // Calculate decision boundary line points
  const getBoundaryPoints = (w1: number, w2: number, b: number) => {
    if (Math.abs(w2) < 0.001) return null;
    // w1*x + w2*y + b = 0  =>  y = -(w1*x + b) / w2
    const x1 = 0;
    const y1 = -(w1 * x1 + b) / w2;
    const x2 = 1;
    const y2 = -(w1 * x2 + b) / w2;
    return { x1, y1, x2, y2 };
  };

  const boundary = currentState ? getBoundaryPoints(
    currentState.decisionBoundary.w1,
    currentState.decisionBoundary.w2,
    currentState.decisionBoundary.b
  ) : null;

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-pink-400" />
          <div>
            <h2 className="text-lg font-bold">The Perceptron</h2>
            <p className="text-sm text-slate-400">Interactive Neural Network Visualizer</p>
          </div>
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Visualization */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Info Panel */}
          <div className="mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-2 text-pink-300">
              {currentState?.title || "Loading..."}
            </h3>
            <p className="text-slate-300 mb-2">{currentState?.description}</p>
            <p className="text-sm text-slate-400 italic">{currentState?.explanation}</p>
          </div>

          {/* Scatter Plot */}
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 relative overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Grid */}
              {Array.from({ length: 11 }).map((_, i) => (
                <g key={i} opacity={0.1}>
                  <line x1={i * 10} y1={0} x2={i * 10} y2={100} stroke="white" strokeWidth={0.3} />
                  <line x1={0} y1={i * 10} x2={100} y2={i * 10} stroke="white" strokeWidth={0.3} />
                </g>
              ))}

              {/* Decision Boundary */}
              {boundary && (
                <motion.line
                  x1={boundary.x1 * 100}
                  y1={(1 - boundary.y1) * 100}
                  x2={boundary.x2 * 100}
                  y2={(1 - boundary.y2) * 100}
                  stroke="#f472b6"
                  strokeWidth={1}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Data Points */}
              {data.map((point, i) => {
                const z = currentState?.weights[0] * point.x + currentState?.weights[1] * point.y + (currentState?.bias || 0);
                const predicted = z >= 0 ? 1 : 0;
                const correct = predicted === point.label;

                return (
                  <motion.circle
                    key={i}
                    cx={point.x * 100}
                    cy={(1 - point.y) * 100}
                    r={4}
                    fill={point.label === 1 ? "#60a5fa" : "#f87171"}
                    stroke={correct ? "#22c55e" : "#ef4444"}
                    strokeWidth={2}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  />
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-slate-900/80 p-3 rounded-lg text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span>Class 1</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span>Class 0</span>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-0.5 bg-pink-400" />
                  <span>Decision Boundary</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weights Display */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Weight w₁</div>
              <div className="text-lg font-mono font-bold text-pink-400">
                {currentState?.weights[0].toFixed(3)}
              </div>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Weight w₂</div>
              <div className="text-lg font-mono font-bold text-pink-400">
                {currentState?.weights[1].toFixed(3)}
              </div>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <div className="text-xs text-slate-400 mb-1">Bias b</div>
              <div className="text-lg font-mono font-bold text-pink-400">
                {currentState?.bias.toFixed(3)}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 p-4 border-l border-slate-700 flex flex-col gap-4 bg-slate-800/50">
          {/* Playback Controls */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentStep(0)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-pink-600 hover:bg-pink-500 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>
              <button
                onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Speed Control */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-2 block">Animation Speed</label>
              <div className="flex gap-1">
                {speeds.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSpeed(s.value)}
                    className={`flex-1 py-1 px-2 text-xs rounded transition-colors ${
                      speed === s.value ? "bg-pink-600 text-white" : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step Progress */}
            <div className="text-center text-sm text-slate-400">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Manual Training
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Learning Rate: {learningRate}</label>
                <input
                  type="range"
                  min={0.01}
                  max={1}
                  step={0.01}
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Weight w₁: {weights[0].toFixed(2)}</label>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={weights[0]}
                  onChange={(e) => {
                    const newW: [number, number] = [parseFloat(e.target.value), weights[1]];
                    setWeights(newW);
                  }}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Weight w₂: {weights[1].toFixed(2)}</label>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={weights[1]}
                  onChange={(e) => {
                    const newW: [number, number] = [weights[0], parseFloat(e.target.value)];
                    setWeights(newW);
                  }}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Bias: {bias.toFixed(2)}</label>
                <input
                  type="range"
                  min={-2}
                  max={2}
                  step={0.1}
                  value={bias}
                  onChange={(e) => setBias(parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              <button
                onClick={() => {
                  setWeights([0.5, -0.3]);
                  setBias(0.1);
                  setCurrentStep(0);
                }}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Performance
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Accuracy</span>
                <span className="font-mono text-green-400">
                  {((currentState?.accuracy || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <motion.div
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentState?.accuracy || 0) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
