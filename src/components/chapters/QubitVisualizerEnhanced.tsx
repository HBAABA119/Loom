"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, RotateCcw, ChevronRight, ChevronLeft,
  Target, Info, Zap, Settings, Rotate3D, Eye
} from "lucide-react";

interface BlochState {
  theta: number; // 0 to π
  phi: number;   // 0 to 2π
  name: string;
  description: string;
}

interface Gate {
  name: string;
  matrix: string;
  action: string;
  description: string;
  apply: (state: BlochState) => BlochState;
}

const states: BlochState[] = [
  { theta: 0, phi: 0, name: "|0⟩", description: "North pole - definite 0" },
  { theta: Math.PI, phi: 0, name: "|1⟩", description: "South pole - definite 1" },
  { theta: Math.PI / 2, phi: 0, name: "|+⟩", description: "+X axis - equal superposition" },
  { theta: Math.PI / 2, phi: Math.PI, name: "|-⟩", description: "-X axis - equal superposition with phase" },
  { theta: Math.PI / 2, phi: Math.PI / 2, name: "|i+⟩", description: "+Y axis - equal superposition with i phase" },
  { theta: Math.PI / 2, phi: -Math.PI / 2, name: "|i-⟩", description: "-Y axis - equal superposition with -i phase" },
];

const gates: Gate[] = [
  {
    name: "X (NOT)",
    matrix: "[[0, 1], [1, 0]]",
    action: "180° rotation around X-axis",
    description: "Flips |0⟩ ↔ |1⟩",
    apply: (s) => ({ ...s, theta: Math.PI - s.theta, phi: -s.phi })
  },
  {
    name: "Y",
    matrix: "[[0, -i], [i, 0]]",
    action: "180° rotation around Y-axis",
    description: "Maps |0⟩ → i|1⟩, |1⟩ → -i|0⟩",
    apply: (s) => ({ ...s, theta: Math.PI - s.theta, phi: Math.PI - s.phi })
  },
  {
    name: "Z (Phase)",
    matrix: "[[1, 0], [0, -1]]",
    action: "180° rotation around Z-axis",
    description: "Flips phase of |1⟩",
    apply: (s) => ({ ...s, phi: s.phi + Math.PI })
  },
  {
    name: "H (Hadamard)",
    matrix: "1/√2 [[1, 1], [1, -1]]",
    action: "Rotation to equator",
    description: "Creates superposition |0⟩ → |+⟩",
    apply: (s) => s.theta === 0
      ? { theta: Math.PI / 2, phi: 0, name: "|+⟩", description: "From |0⟩ via H" }
      : s.theta === Math.PI
        ? { theta: Math.PI / 2, phi: Math.PI, name: "|-⟩", description: "From |1⟩ via H" }
        : s
  },
  {
    name: "S (Phase)",
    matrix: "[[1, 0], [0, i]]",
    action: "90° rotation around Z-axis",
    description: "Adds π/2 phase",
    apply: (s) => ({ ...s, phi: s.phi + Math.PI / 2 })
  },
  {
    name: "T",
    matrix: "[[1, 0], [0, e^(iπ/4)]]",
    action: "45° rotation around Z-axis",
    description: "Adds π/4 phase",
    apply: (s) => ({ ...s, phi: s.phi + Math.PI / 4 })
  },
];

export default function QubitVisualizerEnhanced() {
  const [currentState, setCurrentState] = useState<BlochState>(states[0]);
  const [animatingState, setAnimatingState] = useState<BlochState | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [selectedGate, setSelectedGate] = useState<Gate | null>(null);
  const [measurementBasis, setMeasurementBasis] = useState<"Z" | "X" | "Y">("Z");
  const [showProbabilities, setShowProbabilities] = useState(true);
  const [showVector, setShowVector] = useState(true);
  const [showSphere, setShowSphere] = useState(true);
  const [history, setHistory] = useState<BlochState[]>([states[0]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeTab, setActiveTab] = useState<"visualize" | "gates" | "measure">("visualize");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate amplitudes from Bloch angles
  const calculateAmplitudes = (theta: number, phi: number) => {
    const alpha = Math.cos(theta / 2);
    const beta = Math.sin(theta / 2) * Math.exp(phi * 1);
    return { alpha: alpha.toFixed(3), beta: beta.toFixed(3) };
  };

  // Calculate measurement probabilities
  const calculateProbabilities = (theta: number, phi: number, basis: "Z" | "X" | "Y") => {
    if (basis === "Z") {
      const p0 = Math.cos(theta / 2) ** 2;
      const p1 = Math.sin(theta / 2) ** 2;
      return { p0: p0.toFixed(3), p1: p1.toFixed(3) };
    } else if (basis === "X") {
      // Convert to X basis probabilities
      const pPlus = (1 + Math.sin(theta) * Math.cos(phi)) / 2;
      const pMinus = (1 - Math.sin(theta) * Math.cos(phi)) / 2;
      return { p0: pPlus.toFixed(3), p1: pMinus.toFixed(3), label0: "|+⟩", label1: "|-⟩" };
    } else {
      // Y basis
      const piPlus = (1 + Math.sin(theta) * Math.sin(phi)) / 2;
      const piMinus = (1 - Math.sin(theta) * Math.sin(phi)) / 2;
      return { p0: piPlus.toFixed(3), p1: piMinus.toFixed(3), label0: "|i+⟩", label1: "|i-⟩" };
    }
  };

  // Apply gate with animation
  const applyGate = (gate: Gate) => {
    if (isAnimating) return;

    const newState = gate.apply(currentState);
    setSelectedGate(gate);
    setAnimatingState(newState);
    setAnimationProgress(0);
    setIsAnimating(true);

    // Simple animation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      setAnimationProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        setCurrentState(newState);
        setAnimatingState(null);
        setAnimationProgress(0);
        setIsAnimating(false);

        // Add to history
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newState);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      }
    }, 50);
  };

  // Navigate history
  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentState(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentState(history[historyIndex + 1]);
    }
  };

  const reset = () => {
    setCurrentState(states[0]);
    setHistory([states[0]]);
    setHistoryIndex(0);
    setSelectedGate(null);
  };

  // Draw Bloch sphere
  const drawBlochSphere = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;

    ctx.clearRect(0, 0, width, height);

    // Draw sphere outline
    ctx.strokeStyle = "#58a6ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();

    if (showSphere) {
      // Draw equator
      ctx.strokeStyle = "#30363d";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius, radius * 0.4, 0, 0, 2 * Math.PI);
      ctx.stroke();

      // Draw Z-axis line
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.stroke();

      // Draw X-axis line (horizontal through center)
      ctx.beginPath();
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.stroke();

      // Labels
      ctx.fillStyle = "#8b949e";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("|0⟩", centerX, centerY - radius - 10);
      ctx.fillText("|1⟩", centerX, centerY + radius + 20);
      ctx.fillText("|+⟩", centerX + radius + 20, centerY + 5);
      ctx.fillText("|-⟩", centerX - radius - 20, centerY + 5);
    }

    // Calculate qubit vector position
    let displayTheta = currentState.theta;
    let displayPhi = currentState.phi;

    if (animatingState && animationProgress > 0) {
      displayTheta = currentState.theta + (animatingState.theta - currentState.theta) * animationProgress;
      displayPhi = currentState.phi + (animatingState.phi - currentState.phi) * animationProgress;
    }

    // Convert spherical to Cartesian (with Y-axis rotation for 3D effect)
    const rotation = Math.PI / 6; // 30 degree tilt for better 3D view
    const x = Math.sin(displayTheta) * Math.cos(displayPhi);
    const y = Math.cos(displayTheta);
    const z = Math.sin(displayTheta) * Math.sin(displayPhi);

    // Rotate for 3D view
    const xRot = x * Math.cos(rotation) + z * Math.sin(rotation);
    const yRot = y;
    const zRot = -x * Math.sin(rotation) + z * Math.cos(rotation);

    // Project to 2D
    const pointX = centerX + xRot * radius;
    const pointY = centerY - yRot * radius;

    if (showVector) {
      // Draw state vector line from center to point
      ctx.strokeStyle = isAnimating ? "#f0883e" : "#3fb950";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(pointX, pointY);
      ctx.stroke();

      // Draw point at end of vector
      ctx.fillStyle = isAnimating ? "#f0883e" : "#3fb950";
      ctx.beginPath();
      ctx.arc(pointX, pointY, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Draw vector projection on equator (dashed)
      ctx.strokeStyle = "#8b949e";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(pointX, centerY + (centerY - pointY) * 0.1); // Simplified projection
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [currentState, animatingState, animationProgress, showVector, showSphere, isAnimating]);

  useEffect(() => {
    drawBlochSphere();
  }, [drawBlochSphere]);

  const amplitudes = calculateAmplitudes(currentState.theta, currentState.phi);
  const probs = calculateProbabilities(currentState.theta, currentState.phi, measurementBasis);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#58a6ff]/20 rounded-lg">
            <Rotate3D size={20} className="text-[#58a6ff]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Bloch Sphere Visualizer</h3>
            <p className="text-[#8b949e] text-xs">Interactive qubit state visualization</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goBack}
            disabled={historyIndex === 0}
            className="p-2 rounded-lg bg-[#21262d] text-[#c9d1d9] disabled:opacity-30 hover:bg-[#30363d] transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex === history.length - 1}
            className="p-2 rounded-lg bg-[#21262d] text-[#c9d1d9] disabled:opacity-30 hover:bg-[#30363d] transition-colors"
          >
            <ChevronRight size={18} />
          </button>
          <button
            onClick={reset}
            className="p-2 rounded-lg bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d] transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#30363d]">
        {(["visualize", "gates", "measure"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-[#21262d] text-[#58a6ff] border-t-2 border-[#58a6ff]"
                : "text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Visualization */}
        <div className="flex-1 flex flex-col">
          {/* Canvas */}
          <div className="flex-1 relative bg-[#0d1117] flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={400}
              height={350}
              className="max-w-full max-h-full"
            />

            {/* Overlay: State Info */}
            <div className="absolute top-4 left-4 p-3 bg-[#161b22]/90 border border-[#30363d] rounded-lg">
              <div className="text-[#58a6ff] font-mono text-lg font-bold">{currentState.name}</div>
              <div className="text-[#8b949e] text-xs mt-1">{currentState.description}</div>
              <div className="mt-2 text-[#c9d1d9] text-xs font-mono">
                θ = {(currentState.theta * 180 / Math.PI).toFixed(1)}°<br />
                φ = {(currentState.phi * 180 / Math.PI).toFixed(1)}°
              </div>
            </div>

            {/* Overlay: View Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => setShowSphere(!showSphere)}
                className={`p-2 rounded-lg transition-colors ${showSphere ? "bg-[#58a6ff]/20 text-[#58a6ff]" : "bg-[#21262d] text-[#8b949e]"}`}
                title="Toggle sphere"
              >
                <Rotate3D size={16} />
              </button>
              <button
                onClick={() => setShowVector(!showVector)}
                className={`p-2 rounded-lg transition-colors ${showVector ? "bg-[#3fb950]/20 text-[#3fb950]" : "bg-[#21262d] text-[#8b949e]"}`}
                title="Toggle vector"
              >
                <Zap size={16} />
              </button>
              <button
                onClick={() => setShowProbabilities(!showProbabilities)}
                className={`p-2 rounded-lg transition-colors ${showProbabilities ? "bg-[#f0883e]/20 text-[#f0883e]" : "bg-[#21262d] text-[#8b949e]"}`}
                title="Toggle probabilities"
              >
                <Eye size={16} />
              </button>
            </div>
          </div>

          {/* State Amplitudes */}
          <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium text-sm">State Amplitudes</h4>
              <span className="text-[#8b949e] text-xs">|ψ⟩ = α|0⟩ + β|1⟩</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#21262d] rounded-lg">
                <div className="text-[#8b949e] text-xs mb-1">α (|0⟩ amplitude)</div>
                <div className="text-[#58a6ff] font-mono">{amplitudes.alpha}</div>
                <div className="text-[#6e7681] text-xs">|α|² = {probs.p0}</div>
              </div>
              <div className="p-3 bg-[#21262d] rounded-lg">
                <div className="text-[#8b949e] text-xs mb-1">β (|1⟩ amplitude)</div>
                <div className="text-[#58a6ff] font-mono">{amplitudes.beta}</div>
                <div className="text-[#6e7681] text-xs">|β|² = {probs.p1}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="w-80 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === "visualize" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 flex flex-col gap-4"
              >
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Target size={16} className="text-[#58a6ff]" />
                    Preset States
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {states.map((state) => (
                      <button
                        key={state.name}
                        onClick={() => {
                          setCurrentState(state);
                          const newHistory = history.slice(0, historyIndex + 1);
                          newHistory.push(state);
                          setHistory(newHistory);
                          setHistoryIndex(newHistory.length - 1);
                        }}
                        className={`p-2 rounded-lg text-sm font-mono transition-colors ${
                          currentState.name === state.name
                            ? "bg-[#58a6ff] text-white"
                            : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                        }`}
                      >
                        {state.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info size={14} className="text-[#f0883e]" />
                    <span className="text-[#f0883e] text-xs font-medium">About This State</span>
                  </div>
                  <p className="text-[#c9d1d9] text-sm leading-relaxed">{currentState.description}</p>
                </div>
              </motion.div>
            )}

            {activeTab === "gates" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 flex flex-col gap-3"
              >
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Zap size={16} className="text-[#3fb950]" />
                  Quantum Gates
                </h4>
                <p className="text-[#8b949e] text-xs">Click a gate to apply it to the current state</p>

                <div className="flex flex-col gap-2">
                  {gates.map((gate) => (
                    <button
                      key={gate.name}
                      onClick={() => applyGate(gate)}
                      disabled={isAnimating}
                      className={`p-3 rounded-lg text-left transition-all ${
                        selectedGate?.name === gate.name
                          ? "bg-[#3fb950]/20 border border-[#3fb950]"
                          : "bg-[#21262d] hover:bg-[#30363d] border border-transparent"
                      } ${isAnimating ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="text-white font-medium text-sm">{gate.name}</div>
                      <div className="text-[#8b949e] text-xs mt-1">{gate.action}</div>
                    </button>
                  ))}
                </div>

                {selectedGate && (
                  <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
                    <div className="text-[#f0883e] text-xs font-medium mb-1">{selectedGate.name}</div>
                    <div className="text-[#c9d1d9] text-xs mb-2">{selectedGate.description}</div>
                    <code className="text-[#58a6ff] text-xs font-mono">{selectedGate.matrix}</code>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "measure" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 flex flex-col gap-4"
              >
                <div>
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Eye size={16} className="text-[#f0883e]" />
                    Measurement Basis
                  </h4>
                  <div className="flex gap-2">
                    {(["Z", "X", "Y"] as const).map((basis) => (
                      <button
                        key={basis}
                        onClick={() => setMeasurementBasis(basis)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          measurementBasis === basis
                            ? "bg-[#f0883e] text-white"
                            : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                        }`}
                      >
                        {basis} Basis
                      </button>
                    ))}
                  </div>
                </div>

                {showProbabilities && (
                  <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-lg">
                    <h5 className="text-[#c9d1d9] text-sm font-medium mb-3">
                      Measurement Probabilities ({measurementBasis} basis)
                    </h5>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#8b949e]">{"label0" in probs ? probs.label0 : "|0⟩"}</span>
                          <span className="text-[#3fb950] font-mono">{(parseFloat(probs.p0) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#3fb950] transition-all"
                            style={{ width: `${parseFloat(probs.p0) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#8b949e]">{"label1" in probs ? probs.label1 : "|1⟩"}</span>
                          <span className="text-[#f0883e] font-mono">{(parseFloat(probs.p1) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-[#21262d] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#f0883e] transition-all"
                            style={{ width: `${parseFloat(probs.p1) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-[#21262d] rounded-lg">
                  <div className="text-[#8b949e] text-xs mb-2">Key Insight</div>
                  <p className="text-[#c9d1d9] text-xs leading-relaxed">
                    The measurement basis determines which states are distinguishable.
                    In the Z basis, |0⟩ and |1⟩ are definite. In the X basis, |+⟩ and |-⟩ are definite.
                    Measuring in the "wrong" basis gives random results and destroys superposition.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
