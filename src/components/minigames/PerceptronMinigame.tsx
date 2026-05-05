"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, RotateCcw, Target, Brain, ChevronRight, 
  CheckCircle, XCircle, Star, Zap
} from "lucide-react";

interface DataPoint {
  x: number;
  y: number;
  label: number;
}

interface Level {
  id: number;
  title: string;
  description: string;
  data: DataPoint[];
  initialWeights: [number, number];
  initialBias: number;
  learningRate: number;
  targetAccuracy: number;
  maxSteps: number;
  hint: string;
  educationalNote: string;
}

const levels: Level[] = [
  {
    id: 1,
    title: "Linear Separation",
    description: "Separate two classes with a straight line",
    data: [
      { x: 0.2, y: 0.2, label: 0 },
      { x: 0.3, y: 0.1, label: 0 },
      { x: 0.1, y: 0.3, label: 0 },
      { x: 0.7, y: 0.8, label: 1 },
      { x: 0.8, y: 0.9, label: 1 },
      { x: 0.9, y: 0.7, label: 1 },
    ],
    initialWeights: [0.5, 0.5],
    initialBias: 0,
    learningRate: 0.5,
    targetAccuracy: 1.0,
    maxSteps: 20,
    hint: "The classes are clearly separated. Start training and watch the decision boundary move!",
    educationalNote: "This is the easiest case for a perceptron—linearly separable data. The algorithm is guaranteed to converge.",
  },
  {
    id: 2,
    title: "AND Gate",
    description: "Learn the AND logic function",
    data: [
      { x: 0, y: 0, label: 0 },
      { x: 0, y: 1, label: 0 },
      { x: 1, y: 0, label: 0 },
      { x: 1, y: 1, label: 1 },
    ],
    initialWeights: [0, 0],
    initialBias: 0,
    learningRate: 0.5,
    targetAccuracy: 1.0,
    maxSteps: 30,
    hint: "Only (1,1) should be positive. The boundary needs to cut off the bottom-left corner.",
    educationalNote: "AND is linearly separable! Try weights [1, 1] with bias -1.5.",
  },
  {
    id: 3,
    title: "Tricky Boundary",
    description: "Data with some overlap—can you find the best separating line?",
    data: [
      { x: 0.4, y: 0.3, label: 0 },
      { x: 0.3, y: 0.5, label: 0 },
      { x: 0.5, y: 0.2, label: 0 },
      { x: 0.6, y: 0.7, label: 1 },
      { x: 0.7, y: 0.6, label: 1 },
      { x: 0.8, y: 0.8, label: 1 },
      { x: 0.55, y: 0.55, label: 1 },
    ],
    initialWeights: [0.5, -0.3],
    initialBias: 0,
    learningRate: 0.3,
    targetAccuracy: 0.85,
    maxSteps: 50,
    hint: "Some points are close to the boundary. Don't worry about 100%—find the best compromise.",
    educationalNote: "Real data often has overlap. Perceptrons try to minimize errors but may not achieve perfection.",
  },
];

export default function PerceptronMinigame() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [weights, setWeights] = useState<[number, number]>([0, 0]);
  const [bias, setBias] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [trainingHistory, setTrainingHistory] = useState<Array<{weights: [number, number], bias: number, accuracy: number}>>([]);
  const [showHint, setShowHint] = useState(false);
  const [unlockedLevels, setUnlockedLevels] = useState([0]);

  const level = levels[currentLevel];

  const calculateAccuracy = useCallback((w: [number, number], b: number) => {
    let correct = 0;
    for (const point of level.data) {
      const z = w[0] * point.x + w[1] * point.y + b;
      const pred = z >= 0 ? 1 : 0;
      if (pred === point.label) correct++;
    }
    return correct / level.data.length;
  }, [level.data]);

  const resetLevel = useCallback(() => {
    setWeights([...level.initialWeights]);
    setBias(level.initialBias);
    setStepCount(0);
    setIsComplete(false);
    setTrainingHistory([]);
    setShowHint(false);
  }, [level]);

  useEffect(() => {
    resetLevel();
  }, [currentLevel, resetLevel]);

  const trainStep = useCallback(() => {
    if (isComplete || stepCount >= level.maxSteps) return;

    let newWeights = [...weights] as [number, number];
    let newBias = bias;
    let hadUpdate = false;

    // Train on one misclassified point
    for (const point of level.data) {
      const z = newWeights[0] * point.x + newWeights[1] * point.y + newBias;
      const prediction = z >= 0 ? 1 : 0;
      const error = point.label - prediction;

      if (error !== 0) {
        newWeights = [
          newWeights[0] + level.learningRate * error * point.x,
          newWeights[1] + level.learningRate * error * point.y,
        ];
        newBias = newBias + level.learningRate * error;
        hadUpdate = true;
        break;
      }
    }

    if (hadUpdate || stepCount === 0) {
      const accuracy = calculateAccuracy(newWeights, newBias);
      setTrainingHistory(prev => [...prev, { weights: newWeights, bias: newBias, accuracy }]);
      setWeights(newWeights);
      setBias(newBias);
      setStepCount(prev => prev + 1);

      if (accuracy >= level.targetAccuracy) {
        setIsComplete(true);
        if (!unlockedLevels.includes(currentLevel + 1) && currentLevel + 1 < levels.length) {
          setUnlockedLevels(prev => [...prev, currentLevel + 1]);
        }
      }
    }
  }, [weights, bias, stepCount, level, isComplete, calculateAccuracy, currentLevel, unlockedLevels]);

  const autoTrain = useCallback(() => {
    const interval = setInterval(() => {
      setStepCount(prev => {
        if (prev >= level.maxSteps || calculateAccuracy(weights, bias) >= level.targetAccuracy) {
          clearInterval(interval);
          return prev;
        }
        trainStep();
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [level.maxSteps, level.targetAccuracy, trainStep, weights, bias, calculateAccuracy]);

  const accuracy = calculateAccuracy(weights, bias);

  // Calculate decision boundary
  const getBoundaryPoints = () => {
    if (Math.abs(weights[1]) < 0.001) return null;
    const x1 = 0;
    const y1 = -(weights[0] * x1 + bias) / weights[1];
    const x2 = 1;
    const y2 = -(weights[0] * x2 + bias) / weights[1];
    return { x1, y1, x2, y2 };
  };

  const boundary = getBoundaryPoints();

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-pink-400" />
          <div>
            <h2 className="text-lg font-bold">Perceptron Trainer</h2>
            <p className="text-sm text-slate-400">Level {currentLevel + 1}: {level.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {levels.map((_, idx) => (
            <button
              key={idx}
              onClick={() => unlockedLevels.includes(idx) && setCurrentLevel(idx)}
              disabled={!unlockedLevels.includes(idx)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                idx === currentLevel
                  ? "bg-pink-600 text-white"
                  : unlockedLevels.includes(idx)
                  ? "bg-slate-700 text-slate-300"
                  : "bg-slate-800 text-slate-600 cursor-not-allowed"
              }`}
            >
              {unlockedLevels.includes(idx) ? (
                idx < currentLevel ? <CheckCircle className="w-4 h-4" /> : idx + 1
              ) : (
                <Star className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Game Area */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Level Info */}
          <div className="mb-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold mb-2 text-pink-300">{level.description}</h3>
            <div className="flex items-center gap-4 text-sm">
              <span>Steps: <span className="font-mono text-pink-400">{stepCount}</span>/{level.maxSteps}</span>
              <span>Accuracy: <span className="font-mono text-green-400">{(accuracy * 100).toFixed(1)}%</span></span>
              <span>Target: <span className="font-mono text-yellow-400">{(level.targetAccuracy * 100).toFixed(0)}%</span></span>
            </div>
          </div>

          {/* Game Board */}
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
                  strokeWidth={1.5}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                />
              )}

              {/* Data Points */}
              {level.data.map((point, i) => {
                const z = weights[0] * point.x + weights[1] * point.y + bias;
                const predicted = z >= 0 ? 1 : 0;
                const correct = predicted === point.label;

                return (
                  <motion.g key={i}>
                    <circle
                      cx={point.x * 100}
                      cy={(1 - point.y) * 100}
                      r={5}
                      fill={point.label === 1 ? "#60a5fa" : "#f87171"}
                      stroke={correct ? "#22c55e" : "#ef4444"}
                      strokeWidth={2}
                    />
                    {!correct && (
                      <text
                        x={point.x * 100}
                        y={(1 - point.y) * 100 - 8}
                        fill="#ef4444"
                        fontSize={4}
                        textAnchor="middle"
                      >
                        ✗
                      </text>
                    )}
                  </motion.g>
                );
              })}
            </svg>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-slate-900/90 p-3 rounded-lg text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-blue-400 border-2 border-green-500" />
                <span>Correct Class 1</span>
              </div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full bg-red-400 border-2 border-green-500" />
                <span>Correct Class 0</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-red-500" />
                <span>Wrong (red border)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-72 p-4 border-l border-slate-700 flex flex-col gap-4 bg-slate-800/50">
          {/* Action Buttons */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={trainStep}
                disabled={isComplete || stepCount >= level.maxSteps}
                className="py-3 px-4 bg-pink-600 hover:bg-pink-500 disabled:bg-slate-600 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Train Step
              </button>
              <button
                onClick={autoTrain}
                disabled={isComplete || stepCount >= level.maxSteps}
                className="py-3 px-4 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 rounded-lg font-semibold transition-colors"
              >
                Auto Train
              </button>
            </div>
            <button
              onClick={resetLevel}
              className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          {/* Parameters */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Parameters
            </h4>
            <div className="space-y-3 text-sm">
              <div className="p-2 bg-slate-700 rounded">
                <span className="text-slate-400">w₁ = </span>
                <span className="font-mono text-pink-400">{weights[0].toFixed(3)}</span>
              </div>
              <div className="p-2 bg-slate-700 rounded">
                <span className="text-slate-400">w₂ = </span>
                <span className="font-mono text-pink-400">{weights[1].toFixed(3)}</span>
              </div>
              <div className="p-2 bg-slate-700 rounded">
                <span className="text-slate-400">b = </span>
                <span className="font-mono text-pink-400">{bias.toFixed(3)}</span>
              </div>
              <div className="p-2 bg-slate-700 rounded">
                <span className="text-slate-400">η = </span>
                <span className="font-mono text-yellow-400">{level.learningRate}</span>
              </div>
            </div>
          </div>

          {/* Hint */}
          <button
            onClick={() => setShowHint(!showHint)}
            className="p-4 bg-slate-800 rounded-xl border border-slate-700 text-left hover:bg-slate-700 transition-colors"
          >
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              Hint
            </h4>
            <AnimatePresence>
              {showHint && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-slate-300"
                >
                  {level.hint}
                </motion.p>
              )}
            </AnimatePresence>
          </button>

          {/* Success Message */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-900/50 border border-green-500 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-green-400">Level Complete!</h4>
                </div>
                <p className="text-sm text-slate-300 mb-3">{level.educationalNote}</p>
                {currentLevel < levels.length - 1 && (
                  <button
                    onClick={() => setCurrentLevel(currentLevel + 1)}
                    className="w-full py-2 bg-green-600 hover:bg-green-500 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    Next Level
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
