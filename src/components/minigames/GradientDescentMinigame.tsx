"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mountain, Play, Pause, RotateCcw, Target, Zap, 
  Trophy, ChevronRight, TrendingDown
} from "lucide-react";

type LandscapeType = "bowl" | "valley" | "saddle" | "wavy" | " Rosenbrock";
type OptimizerType = "sgd" | "momentum" | "rmsprop" | "adam";

interface Position {
  x: number;
  y: number;
}

interface Landscape {
  name: string;
  type: LandscapeType;
  formula: (x: number, y: number) => number;
  gradient: (x: number, y: number) => [number, number];
  globalMin: Position;
  bounds: [number, number];
  description: string;
}

const landscapes: Landscape[] = [
  {
    name: "Simple Bowl",
    type: "bowl",
    formula: (x, y) => x * x + y * y,
    gradient: (x, y) => [2 * x, 2 * y],
    globalMin: { x: 0, y: 0 },
    bounds: [-2, 2],
    description: "The classic quadratic bowl—easy for any optimizer.",
  },
  {
    name: "Elongated Valley",
    type: "valley",
    formula: (x, y) => 0.1 * x * x + y * y,
    gradient: (x, y) => [0.2 * x, 2 * y],
    globalMin: { x: 0, y: 0 },
    bounds: [-2, 2],
    description: "Steep in one direction, flat in another. Tests optimizer adaptivity.",
  },
  {
    name: "Saddle Point",
    type: "saddle",
    formula: (x, y) => x * x - y * y + 0.1 * x * x * x,
    gradient: (x, y) => [2 * x + 0.3 * x * x, -2 * y],
    globalMin: { x: -2, y: 0 },
    bounds: [-2, 2],
    description: "A saddle point trap. Can the optimizer escape?",
  },
  {
    name: "Wavy Terrain",
    type: "wavy",
    formula: (x, y) => x * x + y * y + Math.sin(5 * x) * 0.5 + Math.cos(5 * y) * 0.5,
    gradient: (x, y) => [2 * x + 2.5 * Math.cos(5 * x), 2 * y - 2.5 * Math.sin(5 * y)],
    globalMin: { x: 0, y: 0 },
    bounds: [-2, 2],
    description: "Many local minima. Don't get stuck in a suboptimal valley!",
  },
];

interface Optimizer {
  name: string;
  type: OptimizerType;
  description: string;
  defaultLR: number;
}

const optimizers: Optimizer[] = [
  { name: "SGD", type: "sgd", description: "Simple gradient descent", defaultLR: 0.1 },
  { name: "Momentum", type: "momentum", description: "SGD with velocity", defaultLR: 0.1 },
  { name: "RMSprop", type: "rmsprop", description: "Adaptive per-parameter", defaultLR: 0.01 },
  { name: "Adam", type: "adam", description: "Momentum + adaptivity", defaultLR: 0.1 },
];

export default function GradientDescentMinigame() {
  const [selectedLandscape, setSelectedLandscape] = useState(0);
  const [selectedOptimizer, setSelectedOptimizer] = useState(0);
  const [position, setPosition] = useState<Position>({ x: 1.5, y: 1.5 });
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [learningRate, setLearningRate] = useState(0.1);
  const [history, setHistory] = useState<Position[]>([{ x: 1.5, y: 1.5 }]);
  const [iteration, setIteration] = useState(0);
  const [foundMin, setFoundMin] = useState(false);
  const [bestScore, setBestScore] = useState(Infinity);
  
  // Optimizer state
  const [momentum, setMomentum] = useState<[number, number]>([0, 0]);
  const [rmsCache, setRmsCache] = useState<[number, number]>([0, 0]);
  const [adamM, setAdamM] = useState<[number, number]>([0, 0]);
  const [adamV, setAdamV] = useState<[number, number]>([0, 0]);

  const landscape = landscapes[selectedLandscape];
  const optimizer = optimizers[selectedOptimizer];

  const getLoss = useCallback((pos: Position) => {
    return landscape.formula(pos.x, pos.y);
  }, [landscape]);

  const reset = useCallback(() => {
    const startPos = { x: 1.5, y: 1.5 };
    setPosition(startPos);
    setHistory([startPos]);
    setIteration(0);
    setFoundMin(false);
    setBestScore(Infinity);
    setMomentum([0, 0]);
    setRmsCache([0, 0]);
    setAdamM([0, 0]);
    setAdamV([0, 0]);
  }, []);

  useEffect(() => {
    reset();
    setLearningRate(optimizer.defaultLR);
  }, [selectedLandscape, selectedOptimizer, reset, optimizer.defaultLR]);

  const step = useCallback(() => {
    setPosition(prevPos => {
      const [gx, gy] = landscape.gradient(prevPos.x, prevPos.y);
      let newPos: Position;

      switch (optimizer.type) {
        case "sgd": {
          newPos = {
            x: prevPos.x - learningRate * gx,
            y: prevPos.y - learningRate * gy,
          };
          break;
        }
        case "momentum": {
          setMomentum(prevMom => {
            const newMom: [number, number] = [
              0.9 * prevMom[0] + learningRate * gx,
              0.9 * prevMom[1] + learningRate * gy,
            ];
            newPos = {
              x: prevPos.x - newMom[0],
              y: prevPos.y - newMom[1],
            };
            return newMom;
          });
          break;
        }
        case "rmsprop": {
          setRmsCache(prevCache => {
            const newCache: [number, number] = [
              0.9 * prevCache[0] + 0.1 * gx * gx,
              0.9 * prevCache[1] + 0.1 * gy * gy,
            ];
            newPos = {
              x: prevPos.x - (learningRate * gx) / (Math.sqrt(newCache[0]) + 1e-8),
              y: prevPos.y - (learningRate * gy) / (Math.sqrt(newCache[1]) + 1e-8),
            };
            return newCache;
          });
          break;
        }
        case "adam": {
          setAdamM(prevM => {
            setAdamV(prevV => {
              const newM: [number, number] = [
                0.9 * prevM[0] + 0.1 * gx,
                0.9 * prevM[1] + 0.1 * gy,
              ];
              const newV: [number, number] = [
                0.999 * prevV[0] + 0.1 * gx * gx,
                0.999 * prevV[1] + 0.1 * gy * gy,
              ];
              const mHat: [number, number] = [newM[0] / 0.1, newM[1] / 0.1];
              const vHat: [number, number] = [newV[0] / 0.001, newV[1] / 0.001];
              newPos = {
                x: prevPos.x - (learningRate * mHat[0]) / (Math.sqrt(vHat[0]) + 1e-8),
                y: prevPos.y - (learningRate * mHat[1]) / (Math.sqrt(vHat[1]) + 1e-8),
              };
              return newV;
            });
            return prevM;
          });
          break;
        }
        default:
          newPos = prevPos;
      }

      if (useMomentum) {
        velocity.x = momentum * velocity.x + learningRate * gradient.x;
        velocity.y = momentum * velocity.y + learningRate * gradient.y;
        newPos = {
          x: currentPosition.x - velocity.x,
          y: currentPosition.y - velocity.y,
        };
      } else {
        newPos = {
          x: currentPosition.x - learningRate * gradient.x,
          y: currentPosition.y - learningRate * gradient.y,
        };
      }

      // Clamp to bounds
      newPos = {
        x: Math.max(landscape.bounds[0], Math.min(landscape.bounds[1], newPos.x)),
        y: Math.max(landscape.bounds[0], Math.min(landscape.bounds[1], newPos.y)),
      };

      setHistory(prev => [...prev.slice(-49), newPos]);
      
      const loss = landscape.formula(newPos.x, newPos.y);
      setBestScore(prev => Math.min(prev, loss));

      // Check if close to minimum
      const distToMin = Math.sqrt(
        Math.pow(newPos.x - landscape.globalMin.x, 2) +
        Math.pow(newPos.y - landscape.globalMin.y, 2)
      );
      if (distToMin < 0.1 && loss < 0.1) {
        setFoundMin(true);
        setIsRunning(false);
      }

      return newPos;
    });

    setIteration(prev => prev + 1);
  }, [landscape, optimizer.type, learningRate]);

  // Auto-run
  useEffect(() => {
    if (!isRunning || foundMin) return;

    const interval = setInterval(step, 1000 / speed);
    return () => clearInterval(interval);
  }, [isRunning, step, speed, foundMin]);

  // Generate contour data
  const generateContours = () => {
    const contours = [];
    for (let i = 0; i <= 10; i++) {
      const value = i * 0.5;
      contours.push(value);
    }
    return contours;
  };

  const currentLoss = getLoss(position);
  const distToGlobal = Math.sqrt(
    Math.pow(position.x - landscape.globalMin.x, 2) +
    Math.pow(position.y - landscape.globalMin.y, 2)
  );

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Mountain className="w-6 h-6 text-pink-400" />
          <div>
            <h2 className="text-lg font-bold">Valley Descender</h2>
            <p className="text-sm text-slate-400">Find the global minimum!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Iteration:</span>
          <span className="font-mono text-pink-400">{iteration}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Game Area */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Current Loss</div>
              <div className="text-xl font-mono font-bold text-yellow-400">
                {currentLoss.toFixed(4)}
              </div>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Best Loss</div>
              <div className="text-xl font-mono font-bold text-green-400">
                {bestScore === Infinity ? "∞" : bestScore.toFixed(4)}
              </div>
            </div>
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700">
              <div className="text-xs text-slate-400">Distance to Min</div>
              <div className="text-xl font-mono font-bold text-blue-400">
                {distToGlobal.toFixed(3)}
              </div>
            </div>
          </div>

          {/* Game Board - 2D Loss Landscape */}
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 relative overflow-hidden">
            <svg viewBox="-2.5 -2.5 5 5" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              {/* Background gradient representing loss */}
              <defs>2
                <radialGradient id="lossGradient" cx="0" cy="0" r="3">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="30%" stopColor="#eab308" />
                  <stop offset="60%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ef4444" />
                </radialGradient>
              </defs>
              <rect x="-2.5" y="-2.5" width="5" height="5" fill="url(#lossGradient)" opacity={0.3} />

              {/* Grid */}
              <g opacity={0.3}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={`v${i}`} x1={-2 + i * 0.5} y1={-2} x2={-2 + i * 0.5} y2={2} stroke="white" strokeWidth={0.02} />
                ))}
                {Array.from({ length: 9 }).map((_, i) => (
                  <line key={`h${i}`} x1={-2} y1={-2 + i * 0.5} x2={2} y1={-2 + i * 0.5} stroke="white" strokeWidth={0.02} />
                ))}
              </g>

              {/* Global minimum marker */}
              <circle
                cx={landscape.globalMin.x}
                cy={-landscape.globalMin.y}
                r={0.08}
                fill="#22c55e"
                stroke="white"
                strokeWidth={0.02}
              />
              <text x={landscape.globalMin.x + 0.1} y={-landscape.globalMin.y - 0.1} fill="#22c55e" fontSize={0.15}>
                GOAL
              </text>

              {/* Path history */}
              {history.length > 1 && (
                <polyline
                  points={history.map(p => `${p.x},${-p.y}`).join(" ")}
                  fill="none"
                  stroke="#f472b6"
                  strokeWidth={0.03}
                  opacity={0.5}
                />
              )}

              {/* Current position */}
              <motion.circle
                cx={position.x}
                cy={-position.y}
                r={0.1}
                fill="#f472b6"
                stroke="white"
                strokeWidth={0.03}
                animate={{ cx: position.x, cy: -position.y }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </svg>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-80 p-4 border-l border-slate-700 flex flex-col gap-4 bg-slate-800/50">
          {/* Landscape Selection */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Mountain className="w-4 h-4" />
              Landscape
            </h4>
            <div className="space-y-2">
              {landscapes.map((ls, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedLandscape(idx)}
                  className={`w-full p-2 rounded-lg text-left text-sm transition-colors ${
                    selectedLandscape === idx
                      ? "bg-pink-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  <div className="font-medium">{ls.name}</div>
                  <div className="text-xs opacity-70">{ls.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optimizer Selection */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Optimizer
            </h4>
            <div className="space-y-2">
              {optimizers.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOptimizer(idx)}
                  className={`w-full p-2 rounded-lg text-left text-sm transition-colors ${
                    selectedOptimizer === idx
                      ? "bg-purple-600 text-white"
                      : "bg-slate-700 hover:bg-slate-600"
                  }`}
                >
                  <div className="font-medium">{opt.name}</div>
                  <div className="text-xs opacity-70">{opt.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Controls
            </h4>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Learning Rate: {learningRate}
                </label>
                <input
                  type="range"
                  min={0.001}
                  max={0.5}
                  step={0.001}
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Speed: {speed}x
                </label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  step={1}
                  value={speed}
                  onChange={(e) => setSpeed(parseInt(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isRunning
                      ? "bg-yellow-600 hover:bg-yellow-500"
                      : "bg-green-600 hover:bg-green-500"
                  }`}
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isRunning ? "Pause" : "Run"}
                </button>
                <button
                  onClick={() => { step(); setIsRunning(false); }}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold transition-colors"
                >
                  Step
                </button>
              </div>

              <button
                onClick={reset}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {foundMin && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-green-900/50 border border-green-500 rounded-xl"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h4 className="font-bold text-green-400">Minimum Found!</h4>
                </div>
                <p className="text-sm text-slate-300">
                  You reached the global minimum in {iteration} steps.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
