"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Activity, Info, RefreshCw } from "lucide-react";

type ActivationType = "sigmoid" | "tanh" | "relu" | "leaky_relu" | "elu" | "softmax";

interface ActivationFunction {
  name: string;
  formula: string;
  description: string;
  fn: (x: number) => number;
  derivative: (x: number, y: number) => number;
  range: [number, number];
  pros: string[];
  cons: string[];
}

const activationFunctions: Record<ActivationType, ActivationFunction> = {
  sigmoid: {
    name: "Sigmoid",
    formula: "σ(x) = 1 / (1 + e^(-x))",
    description: "Classic S-curve that squashes any input to (0, 1). Good for probability outputs but suffers from vanishing gradients.",
    fn: (x) => 1 / (1 + Math.exp(-x)),
    derivative: (x, y) => y * (1 - y),
    range: [0, 1],
    pros: ["Output bounded (0,1)", "Smooth gradient", "Probabilistic interpretation"],
    cons: ["Vanishing gradients", "Not zero-centered", "Expensive computation"],
  },
  tanh: {
    name: "Tanh",
    formula: "tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))",
    description: "Zero-centered version of sigmoid, outputting (-1, 1). Stronger gradients than sigmoid.",
    fn: (x) => Math.tanh(x),
    derivative: (x, y) => 1 - y * y,
    range: [-1, 1],
    pros: ["Zero-centered output", "Stronger gradients", "Smooth"],
    cons: ["Still vanishing gradients", "Computationally expensive"],
  },
  relu: {
    name: "ReLU",
    formula: "ReLU(x) = max(0, x)",
    description: "The modern default. Simple, fast, avoids vanishing gradients for positive inputs. Can suffer from 'dying ReLU'.",
    fn: (x) => Math.max(0, x),
    derivative: (x, y) => x > 0 ? 1 : 0,
    range: [0, Infinity],
    pros: ["Computationally cheap", "No vanishing gradient for x > 0", "Biological plausibility"],
    cons: ["Dying ReLU problem", "Not zero-centered", "Gradient = 0 for x < 0"],
  },
  leaky_relu: {
    name: "Leaky ReLU",
    formula: "LeakyReLU(x) = max(αx, x), α = 0.01",
    description: "Solves dying ReLU by allowing small negative slope. All neurons stay active.",
    fn: (x) => Math.max(0.01 * x, x),
    derivative: (x, y) => x > 0 ? 1 : 0.01,
    range: [-Infinity, Infinity],
    pros: ["No dying neurons", "Cheap computation", "Better than ReLU"],
    cons: ["Small negative slope is arbitrary", "Not zero-centered"],
  },
  elu: {
    name: "ELU",
    formula: "ELU(x) = x if x > 0 else α(e^x - 1)",
    description: "Exponential Linear Unit. Smooth negative region, zero-centered outputs, no dying ReLU.",
    fn: (x) => x > 0 ? x : Math.exp(x) - 1,
    derivative: (x, y) => x > 0 ? 1 : Math.exp(x),
    range: [-1, Infinity],
    pros: ["Smooth everywhere", "Zero-centered mean", "No dying ReLU"],
    cons: ["Computationally expensive", "Hyperparameter α"],
  },
  softmax: {
    name: "Softmax",
    formula: "softmax(xᵢ) = e^xᵢ / Σe^xⱼ",
    description: "Converts logits to probability distribution. Used for multi-class classification outputs.",
    fn: (x) => Math.exp(x) / (Math.exp(x) + Math.exp(-x) + 1), // Simplified for single value visualization
    derivative: (x, y) => y * (1 - y),
    range: [0, 1],
    pros: ["Outputs sum to 1", "Probability interpretation", "Emphasizes max value"],
    cons: ["Only for output layer", "Sensitive to outliers", "Numerical stability issues"],
  },
};

export default function ActivationVisualizer() {
  const [selectedFn, setSelectedFn] = useState<ActivationType>("relu");
  const [inputValue, setInputValue] = useState(0);
  const [showDerivative, setShowDerivative] = useState(true);

  const fn = activationFunctions[selectedFn];

  // Generate curve points
  const curvePoints = useMemo(() => {
    const points = [];
    for (let x = -5; x <= 5; x += 0.1) {
      const y = fn.fn(x);
      const dy = fn.derivative(x, y);
      points.push({ x, y, dy });
    }
    return points;
  }, [fn]);

  // Map coordinate to SVG
  const mapX = (x: number) => ((x + 5) / 10) * 100;
  const mapY = (y: number) => {
    const clampedY = Math.max(-2, Math.min(2, y));
    return ((2 - clampedY) / 4) * 100;
  };

  // Current value
  const currentY = fn.fn(inputValue);
  const currentDY = fn.derivative(inputValue, currentY);

  // Build path
  const functionPath = curvePoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${mapX(p.x)},${mapY(p.y)}`)
    .join(" ");

  const derivativePath = showDerivative
    ? curvePoints
        .map((p, i) => `${i === 0 ? "M" : "L"} ${mapX(p.x)},${mapY(p.dy)}`)
        .join(" ")
    : "";

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-pink-400" />
          <div>
            <h2 className="text-lg font-bold">Activation Functions</h2>
            <p className="text-sm text-slate-400">Explore non-linear transformations</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Visualization */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Function Selector */}
          <div className="mb-4 flex flex-wrap gap-2">
            {(Object.keys(activationFunctions) as ActivationType[]).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedFn(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedFn === key
                    ? "bg-pink-600 text-white"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                }`}
              >
                {activationFunctions[key].name}
              </button>
            ))}
          </div>

          {/* Graph */}
          <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 relative overflow-hidden">
            <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
              {/* Grid */}
              <g opacity={0.2}>
                <line x1={50} y1={0} x2={50} y2={100} stroke="white" strokeWidth={0.5} />
                <line x1={0} y1={50} x2={100} y2={50} stroke="white" strokeWidth={0.5} />
                {/* X-axis labels */}
                {[-4, -2, 0, 2, 4].map((x) => (
                  <text
                    key={x}
                    x={mapX(x)}
                    y={55}
                    fill="white"
                    fontSize={3}
                    textAnchor="middle"
                  >
                    {x}
                  </text>
                ))}
                {/* Y-axis labels */}
                {[-1, 0, 1].map((y) => (
                  <text
                    key={y}
                    x={48}
                    y={mapY(y) + 1}
                    fill="white"
                    fontSize={3}
                    textAnchor="end"
                  >
                    {y}
                  </text>
                ))}
              </g>

              {/* Function curve */}
              <motion.path
                d={functionPath}
                fill="none"
                stroke="#f472b6"
                strokeWidth={1}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                key={selectedFn}
              />

              {/* Derivative curve */}
              {showDerivative && (
                <motion.path
                  d={derivativePath}
                  fill="none"
                  stroke="#60a5fa"
                  strokeWidth={0.8}
                  strokeDasharray="2,1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  key={`${selectedFn}-derivative`}
                />
              )}

              {/* Current point indicator */}
              <circle
                cx={mapX(inputValue)}
                cy={mapY(currentY)}
                r={2}
                fill="#f472b6"
                stroke="white"
                strokeWidth={0.5}
              />

              {/* Tangent line (showing derivative) */}
              {showDerivative && (
                <line
                  x1={mapX(inputValue - 1)}
                  y1={mapY(currentY - currentDY)}
                  x2={mapX(inputValue + 1)}
                  y2={mapY(currentY + currentDY)}
                  stroke="#60a5fa"
                  strokeWidth={0.5}
                  opacity={0.7}
                />
              )}
            </svg>

            {/* Legend */}
            <div className="absolute top-4 right-4 bg-slate-900/80 p-3 rounded-lg text-xs">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-1 bg-pink-400" />
                <span>{fn.name}</span>
              </div>
              {showDerivative && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-1 bg-blue-400 border-dashed" />
                  <span>Derivative</span>
                </div>
              )}
            </div>
          </div>

          {/* Formula Display */}
          <div className="mt-4 p-4 bg-slate-800 rounded-xl border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-pink-300">{fn.name}</h3>
              <code className="text-sm bg-slate-900 px-3 py-1 rounded font-mono">
                {fn.formula}
              </code>
            </div>
            <p className="text-slate-300">{fn.description}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 p-4 border-l border-slate-700 flex flex-col gap-4 bg-slate-800/50">
          {/* Interactive Input */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-semibold mb-4">Interactive Explorer</h4>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Input Value: {inputValue.toFixed(2)}
                </label>
                <input
                  type="range"
                  min={-5}
                  max={5}
                  step={0.1}
                  value={inputValue}
                  onChange={(e) => setInputValue(parseFloat(e.target.value))}
                  className="w-full accent-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400">Output</div>
                  <div className="text-xl font-mono font-bold text-pink-400">
                    {currentY.toFixed(3)}
                  </div>
                </div>
                <div className="p-3 bg-slate-700 rounded-lg">
                  <div className="text-xs text-slate-400">Gradient</div>
                  <div className="text-xl font-mono font-bold text-blue-400">
                    {currentDY.toFixed(3)}
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showDerivative}
                  onChange={(e) => setShowDerivative(e.target.checked)}
                  className="accent-pink-500"
                />
                <span className="text-sm">Show Derivative</span>
              </label>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Characteristics
            </h4>

            <div className="mb-4">
              <h5 className="text-xs text-green-400 font-medium mb-2">PROS</h5>
              <ul className="space-y-1">
                {fn.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-green-500 mt-1">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-xs text-red-400 font-medium mb-2">CONS</h5>
              <ul className="space-y-1">
                {fn.cons.map((con, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-red-500 mt-1">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Range Info */}
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
            <h4 className="font-semibold mb-2">Output Range</h4>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-slate-700 rounded font-mono">
                [{fn.range[0]}, {fn.range[1] === Infinity ? "∞" : fn.range[1]}]
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
