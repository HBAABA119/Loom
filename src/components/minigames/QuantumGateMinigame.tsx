"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, HelpCircle, RotateCcw, ArrowRight, Star,
  Lock, Unlock, Target, Zap, CheckCircle, XCircle,
  Rotate3D, Box, Triangle, Circle
} from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  initialState: string;
  targetState: string;
  availableGates: string[];
  maxGates: number;
  hint: string;
  educationalNote: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const levels: Level[] = [
  {
    id: 1,
    title: "Bit Flip Basics",
    description: "Learn how the X gate flips between |0⟩ and |1⟩",
    objective: "Transform |0⟩ into |1⟩ using the X gate",
    initialState: "|0⟩",
    targetState: "|1⟩",
    availableGates: ["X"],
    maxGates: 1,
    hint: "The X gate is the quantum NOT gate. It flips |0⟩ to |1⟩ and |1⟩ to |0⟩.",
    educationalNote: "The X gate corresponds to a 180° rotation around the X-axis of the Bloch sphere. It's the quantum analog of the classical NOT gate.",
    difficulty: "Easy"
  },
  {
    id: 2,
    title: "Hadamard Magic",
    description: "Create superposition with the Hadamard gate",
    objective: "Transform |0⟩ into |+⟩ (equal superposition)",
    initialState: "|0⟩",
    targetState: "|+⟩",
    availableGates: ["X", "H"],
    maxGates: 1,
    hint: "The H gate creates superposition. Try applying H to |0⟩.",
    educationalNote: "H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩. The Hadamard gate is essential for quantum parallelism—it's used at the start of most quantum algorithms.",
    difficulty: "Easy"
  },
  {
    id: 3,
    title: "Phase Introduction",
    description: "Learn how phase gates affect quantum states",
    objective: "Transform |+⟩ into |i+⟩ (add 90° phase)",
    initialState: "|+⟩",
    targetState: "|i+⟩",
    availableGates: ["H", "S", "Z"],
    maxGates: 2,
    hint: "Apply H first to get to |+⟩, then use the S gate to add phase.",
    educationalNote: "The S gate adds a π/2 (90°) phase rotation. |i+⟩ = (|0⟩ + i|1⟩)/√2. Phase is crucial for quantum interference—algorithms manipulate phases to amplify correct answers.",
    difficulty: "Medium"
  },
  {
    id: 4,
    title: "State Preparation",
    description: "Combine multiple gates to reach a specific state",
    objective: "Transform |0⟩ into |-⟩ (equal superposition with negative phase)",
    initialState: "|0⟩",
    targetState: "|-⟩",
    availableGates: ["H", "X", "Z", "S"],
    maxGates: 2,
    hint: "Start with X to flip to |1⟩, then apply H. Or use H then Z!",
    educationalNote: "There are multiple solutions! H|1⟩ = |-⟩ and ZH|0⟩ = |-⟩. The |-⟩ state has interesting properties—it gives definite 1 when measured in the X basis.",
    difficulty: "Medium"
  },
  {
    id: 5,
    title: "Bloch Sphere Navigation",
    description: "Navigate through multiple states to reach your target",
    objective: "Transform |0⟩ → |+⟩ → |i+⟩",
    initialState: "|0⟩",
    targetState: "|i+⟩",
    availableGates: ["H", "S", "T", "Z"],
    maxGates: 2,
    hint: "Use H to reach the equator (|+⟩), then S to rotate toward +Y axis.",
    educationalNote: "The Bloch sphere is a sphere where every point represents a unique quantum state. The poles are |0⟩ and |1⟩, the equator contains equal superpositions with different phases.",
    difficulty: "Medium"
  },
  {
    id: 6,
    title: "T-Gate Precision",
    description: "Use the T gate for fine-grained phase control",
    objective: "Transform |+⟩ into a state with π/4 phase",
    initialState: "|+⟩",
    targetState: "|π/4⟩",
    availableGates: ["H", "S", "T", "Z"],
    maxGates: 2,
    hint: "The T gate adds a π/4 (45°) phase. Apply H then T to get the desired phase.",
    educationalNote: "The T gate (π/8 gate) adds a π/4 phase. It's part of the Clifford+T universal gate set—any quantum computation can be approximated using just Clifford gates and T gates.",
    difficulty: "Hard"
  },
  {
    id: 7,
    title: "The Reversible Challenge",
    description: "Quantum gates are reversible - undo operations",
    objective: "Start with |0⟩, apply gates, return to |0⟩",
    initialState: "|0⟩",
    targetState: "|0⟩",
    availableGates: ["H", "X", "Z"],
    maxGates: 4,
    hint: "Apply H to create superposition, then H again to undo it! Try: H → X → H → X",
    educationalNote: "All quantum gates (except measurement) are reversible and unitary: U†U = I. Applying a gate twice often returns to the original state: H² = X² = Z² = I.",
    difficulty: "Hard"
  },
  {
    id: 8,
    title: "Pauli Rotation",
    description: "Understand how Pauli gates rotate the Bloch sphere",
    objective: "Transform |0⟩ to |1⟩ using only Y and Z gates",
    initialState: "|0⟩",
    targetState: "|1⟩",
    availableGates: ["Y", "Z"],
    maxGates: 2,
    hint: "Y is like X with an extra phase. Z alone won't flip the bit. Try combining them!",
    educationalNote: "The Pauli Y gate = iXZ. It performs both a bit flip and a phase flip. Y|0⟩ = i|1⟩, Y|1⟩ = -i|0⟩. The phase factors i and -i are global phases and don't affect measurement.",
    difficulty: "Hard"
  }
];

// Gate definitions with their matrix representations
const gateDefinitions: Record<string, { name: string; matrix: string; color: string }> = {
  "X": { name: "Pauli-X (NOT)", matrix: "[[0, 1], [1, 0]]", color: "#f85149" },
  "Y": { name: "Pauli-Y", matrix: "[[0, -i], [i, 0]]", color: "#a371f7" },
  "Z": { name: "Pauli-Z", matrix: "[[1, 0], [0, -1]]", color: "#3fb950" },
  "H": { name: "Hadamard", matrix: "1/√2 [[1, 1], [1, -1]]", color: "#58a6ff" },
  "S": { name: "Phase (S)", matrix: "[[1, 0], [0, i]]", color: "#f0883e" },
  "T": { name: "T Gate", matrix: "[[1, 0], [0, e^(iπ/4)]]", color: "#d2a8ff" },
};

// State definitions
const stateDefinitions: Record<string, { latex: string; description: string; amplitudes: { alpha: number; beta: number } }> = {
  "|0⟩": { latex: "|0\\rangle", description: "North pole of Bloch sphere", amplitudes: { alpha: 1, beta: 0 } },
  "|1⟩": { latex: "|1\\rangle", description: "South pole of Bloch sphere", amplitudes: { alpha: 0, beta: 1 } },
  "|+⟩": { latex: "|+\\rangle = \\frac{|0\\rangle + |1\\rangle}{\\sqrt{2}}", description: "+X axis (equal superposition)", amplitudes: { alpha: 0.707, beta: 0.707 } },
  "|-⟩": { latex: "|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}", description: "-X axis (equal superposition with phase)", amplitudes: { alpha: 0.707, beta: -0.707 } },
  "|i+⟩": { latex: "|i+\\rangle = \\frac{|0\\rangle + i|1\\rangle}{\\sqrt{2}}", description: "+Y axis (superposition with i phase)", amplitudes: { alpha: 0.707, beta: 0.707 } },
  "|i-⟩": { latex: "|i-\\rangle = \\frac{|0\\rangle - i|1\\rangle}{\\sqrt{2}}", description: "-Y axis (superposition with -i phase)", amplitudes: { alpha: 0.707, beta: -0.707 } },
  "|π/4⟩": { latex: "\\frac{|0\\rangle + e^{i\\pi/4}|1\\rangle}{\\sqrt{2}}", description: "45° phase state", amplitudes: { alpha: 0.707, beta: 0.5 + 0.5i } },
};

// Simulate gate application
const applyGate = (state: string, gate: string): string => {
  const transitions: Record<string, Record<string, string>> = {
    "|0⟩": { "X": "|1⟩", "Y": "|1⟩", "Z": "|0⟩", "H": "|+⟩", "S": "|0⟩", "T": "|0⟩" },
    "|1⟩": { "X": "|0⟩", "Y": "|0⟩", "Z": "|1⟩", "H": "|-⟩", "S": "|1⟩", "T": "|1⟩" },
    "|+⟩": { "X": "|+⟩", "Y": "|-⟩", "Z": "|-⟩", "H": "|0⟩", "S": "|i+⟩", "T": "|π/4⟩" },
    "|-⟩": { "X": "|-⟩", "Y": "|+⟩", "Z": "|+⟩", "H": "|1⟩", "S": "|i-⟩", "T": "|-π/4⟩" },
    "|i+⟩": { "X": "|i-⟩", "Y": "|i+⟩", "Z": "|i-⟩", "H": "|0⟩", "S": "|-⟩", "T": "|i+⟩" },
    "|i-⟩": { "X": "|i+⟩", "Y": "|i-⟩", "Z": "|i+⟩", "H": "|1⟩", "S": "|+⟩", "T": "|i-⟩" },
  };

  // Handle |π/4⟩ and other states that may not have all transitions defined
  if (state in transitions && gate in transitions[state]) {
    return transitions[state][gate];
  }

  // Default: state unchanged
  return state;
};

export default function QuantumGateMinigame() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentState, setCurrentState] = useState("|0⟩");
  const [appliedGates, setAppliedGates] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setCurrentState(level.initialState);
    setAppliedGates([]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setSelectedGate(null);
  };

  const handleGateClick = (gate: string) => {
    if (gameState !== "playing") return;
    if (appliedGates.length >= level.maxGates) {
      setFeedback("Maximum number of gates reached! Check your solution or reset.");
      return;
    }

    setSelectedGate(gate);
    const newState = applyGate(currentState, gate);
    setCurrentState(newState);
    setAppliedGates([...appliedGates, gate]);
    setAttempts(a => a + 1);

    // Check if target reached
    if (newState === level.targetState) {
      completeLevel();
    } else if (appliedGates.length + 1 >= level.maxGates) {
      setFeedback("Maximum gates used without reaching target. Try again!");
    }
  };

  const completeLevel = () => {
    const baseScore = 100;
    const attemptPenalty = attempts * 5;
    const finalScore = Math.max(20, baseScore - attemptPenalty);

    setScore(finalScore);
    setTotalScore(s => s + finalScore);
    setGameState("won");
    setFeedback(`🎉 Level Complete! You reached ${level.targetState} in ${appliedGates.length + 1} gates!`);

    if (currentLevel < levels.length - 1 && !unlockedLevels.includes(currentLevel + 1)) {
      setUnlockedLevels([...unlockedLevels, currentLevel + 1]);
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel(currentLevel + 1);
    }
  };

  const initialStateInfo = stateDefinitions[level.initialState];
  const currentStateInfo = stateDefinitions[currentState] || { latex: currentState, description: "Unknown", amplitudes: { alpha: 0, beta: 0 } };
  const targetStateInfo = stateDefinitions[level.targetState];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Quantum Gate Challenge</h3>
          <span className="text-[#8b949e] text-sm">Level {currentLevel + 1}/{levels.length}</span>
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
            level.difficulty === "Easy" ? "bg-[#238636]/20 text-[#3fb950]" :
            level.difficulty === "Medium" ? "bg-[#f0883e]/20 text-[#f0883e]" :
            "bg-[#f85149]/20 text-[#f85149]"
          }`}>
            {level.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
          <Trophy size={16} className="text-[#f0883e]" />
          <span className="text-white font-medium">{totalScore}</span>
        </div>
      </div>

      {/* Level Selector */}
      <div className="flex gap-2 p-3 border-b border-[#30363d] bg-[#0d1117] overflow-x-auto">
        {levels.map((l, i) => (
          <button
            key={l.id}
            onClick={() => unlockedLevels.includes(i) && setCurrentLevel(i)}
            disabled={!unlockedLevels.includes(i)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              i === currentLevel
                ? "bg-[#58a6ff] text-white"
                : unlockedLevels.includes(i)
                ? "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
                : "bg-[#161b22] text-[#6e7681] cursor-not-allowed"
            }`}
          >
            {unlockedLevels.includes(i) ? (i < currentLevel ? <CheckCircle size={14} className="text-[#3fb950]" /> : <Unlock size={14} />) : <Lock size={14} />}
            {l.id}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Game Area */}
        <div className="flex-1 flex flex-col p-6">
          {/* Objective */}
          <div className="mb-6 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="flex items-start gap-3">
              <Target size={20} className="text-[#f0883e] mt-0.5" />
              <div>
                <h4 className="text-white font-medium">{level.title}</h4>
                <p className="text-[#8b949e] text-sm mt-1">{level.objective}</p>
                <p className="text-[#6e7681] text-xs mt-1">Max gates: {level.maxGates}</p>
              </div>
            </div>
          </div>

          {/* State Visualization */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-6 mb-4">
            <div className="flex flex-col items-center justify-center h-full">
              {/* State Flow */}
              <div className="flex items-center gap-4 mb-8">
                {/* Initial State */}
                <div className="text-center">
                  <div className="text-[#8b949e] text-xs mb-2">Initial</div>
                  <div className="w-20 h-20 border-2 border-[#30363d] rounded-lg flex items-center justify-center bg-[#161b22]">
                    <span className="text-[#c9d1d9] font-mono text-lg">{level.initialState}</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center">
                  <ArrowRight size={24} className="text-[#58a6ff]" />
                  <div className="text-[#6e7681] text-xs mt-1">Gates</div>
                </div>

                {/* Applied Gates */}
                <div className="flex items-center gap-1 min-w-[120px] flex-wrap justify-center">
                  {appliedGates.length === 0 ? (
                    <span className="text-[#6e7681] text-sm">No gates yet</span>
                  ) : (
                    appliedGates.map((gate, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: gateDefinitions[gate].color }}
                      >
                        {gate}
                      </motion.div>
                    ))
                  )}
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, level.maxGates - appliedGates.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-8 h-8 rounded border-2 border-dashed border-[#30363d]" />
                  ))}
                </div>

                {/* Arrow */}
                <ArrowRight size={24} className="text-[#58a6ff]" />

                {/* Current State */}
                <div className="text-center">
                  <div className="text-[#8b949e] text-xs mb-2">Current</div>
                  <motion.div
                    animate={gameState === "won" ? { scale: [1, 1.1, 1] } : {}}
                    className={`w-20 h-20 border-2 rounded-lg flex items-center justify-center ${
                      currentState === level.targetState
                        ? "border-[#3fb950] bg-[#3fb950]/20"
                        : "border-[#58a6ff] bg-[#58a6ff]/20"
                    }`}
                  >
                    <span className={`font-mono text-lg ${
                      currentState === level.targetState ? "text-[#3fb950]" : "text-[#58a6ff]"
                    }`}>
                      {currentState}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Target State */}
              <div className="flex items-center gap-3 p-4 bg-[#161b22] border border-[#f0883e]/30 rounded-lg">
                <Star size={16} className="text-[#f0883e]" />
                <span className="text-[#8b949e] text-sm">Target:</span>
                <span className="text-[#f0883e] font-mono font-bold">{level.targetState}</span>
                <span className="text-[#6e7681] text-xs">{targetStateInfo?.description}</span>
              </div>
            </div>
          </div>

          {/* Available Gates */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <h4 className="text-[#8b949e] text-sm mb-3">Available Gates:</h4>
            <div className="flex gap-2 flex-wrap">
              {level.availableGates.map((gate) => (
                <motion.button
                  key={gate}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGateClick(gate)}
                  disabled={gameState !== "playing" || appliedGates.length >= level.maxGates}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg transition-all disabled:opacity-50 hover:shadow-lg"
                    style={{ backgroundColor: gateDefinitions[gate].color }}
                  >
                    {gate}
                  </div>
                  <span className="text-[#6e7681] text-xs">{gateDefinitions[gate].name.split(" ")[0]}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`mt-4 p-4 rounded-lg ${
                  gameState === "won" ? "bg-[#238636]/20 border border-[#238636]" : "bg-[#f85149]/20 border border-[#f85149]"
                }`}
              >
                <p className={gameState === "won" ? "text-[#3fb950]" : "text-[#f85149]"}>{feedback}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-4 border-b border-[#30363d]">
            <h4 className="text-white font-medium mb-2">About This Level</h4>
            <p className="text-[#c9d1d9] text-sm">{level.description}</p>
          </div>

          <div className="p-4 border-b border-[#30363d]">
            <button onClick={() => setShowHint(!showHint)} className="flex items-center gap-2 text-[#8b949e] hover:text-white">
              <HelpCircle size={16} />
              <span className="text-sm">{showHint ? "Hide Hint" : "Show Hint"}</span>
            </button>
            <AnimatePresence>
              {showHint && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-3 p-3 bg-[#f0883e]/10 border border-[#f0883e]/30 rounded-lg">
                  <p className="text-[#f0883e] text-sm">{level.hint}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 border-b border-[#30363d] flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-[#3fb950]" />
              <h4 className="text-[#3fb950] font-medium text-sm">Why This Matters</h4>
            </div>
            <p className="text-[#c9d1d9] text-sm leading-relaxed">{level.educationalNote}</p>
          </div>

          {selectedGate && (
            <div className="p-4 border-b border-[#30363d]">
              <div className="text-[#58a6ff] font-medium text-sm mb-1">{gateDefinitions[selectedGate].name}</div>
              <code className="text-[#8b949e] text-xs font-mono">{gateDefinitions[selectedGate].matrix}</code>
            </div>
          )}

          <div className="p-4 border-b border-[#30363d]">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Gates Used</span>
                <p className="text-white font-bold text-lg">{appliedGates.length}/{level.maxGates}</p>
              </div>
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Attempts</span>
                <p className="text-white font-bold text-lg">{attempts}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex gap-2">
              <button onClick={resetLevel} className="flex-1 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium flex items-center justify-center gap-2">
                <RotateCcw size={16} /> Reset
              </button>
              {gameState === "won" && currentLevel < levels.length - 1 && (
                <button onClick={nextLevel} className="flex-1 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center justify-center gap-2">
                  Next <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
