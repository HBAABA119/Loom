"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, HelpCircle, RotateCcw, ArrowRight, Star,
  Lock, Unlock, Target, Zap, CheckCircle, XCircle,
  Link2, Unlink, GitBranch
} from "lucide-react";

interface Level {
  id: number;
  title: string;
  description: string;
  objective: string;
  initialState: string;
  targetState: string;
  availableOperations: string[];
  maxOperations: number;
  hint: string;
  educationalNote: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

const levels: Level[] = [
  {
    id: 1,
    title: "Create Entanglement",
    description: "Learn to create a Bell state using CNOT",
    objective: "Transform |+0⟩ into |Φ⁺⟩ (Bell state)",
    initialState: "|+0⟩",
    targetState: "|Φ⁺⟩",
    availableOperations: ["CNOT", "H₁", "H₂", "X₁", "X₂"],
    maxOperations: 1,
    hint: "Apply CNOT with qubit 1 (|+⟩) as control and qubit 2 (|0⟩) as target.",
    educationalNote: "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2 is a maximally entangled state. Measuring one qubit instantly determines the other. CNOT entangles when the control is in superposition.",
    difficulty: "Easy"
  },
  {
    id: 2,
    title: "Bell State Varieties",
    description: "Create different Bell states",
    objective: "Transform |00⟩ into |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2",
    initialState: "|00⟩",
    targetState: "|Ψ⁺⟩",
    availableOperations: ["CNOT", "H₁", "H₂", "X₁", "X₂"],
    maxOperations: 3,
    hint: "First flip qubit 1 with X, then apply H to put it in superposition, then CNOT.",
    educationalNote: "|Ψ⁺⟩ is another Bell state with anti-correlation in the computational basis. There are 4 Bell states total: |Φ⁺⟩, |Φ⁻⟩, |Ψ⁺⟩, |Ψ⁻⟩.",
    difficulty: "Easy"
  },
  {
    id: 3,
    title: "GHZ State",
    description: "Create 3-qubit entanglement",
    objective: "Transform |+00⟩ into |GHZ⟩ = (|000⟩ + |111⟩)/√2",
    initialState: "|+00⟩",
    targetState: "|GHZ⟩",
    availableOperations: ["CNOT₁₂", "CNOT₁₃", "H₁", "H₂", "H₃", "X₁", "X₂", "X₃"],
    maxOperations: 2,
    hint: "Apply CNOT from qubit 1 to qubit 2, then from qubit 1 to qubit 3.",
    educationalNote: "The GHZ state is a 3-qubit entangled state. All three qubits are perfectly correlated—measuring any one determines all others. It's used in quantum error correction and quantum secret sharing.",
    difficulty: "Medium"
  },
  {
    id: 4,
    title: "Undo Entanglement",
    description: "Learn that CNOT is self-inverse",
    objective: "Transform |Φ⁺⟩ back into |+0⟩",
    initialState: "|Φ⁺⟩",
    targetState: "|+0⟩",
    availableOperations: ["CNOT", "H₁", "H₂", "X₁", "X₂"],
    maxOperations: 1,
    hint: "Apply CNOT again! CNOT is its own inverse—applying it twice returns to the original state.",
    educationalNote: "All quantum gates (except measurement) are reversible. CNOT² = I (identity). This reversibility is fundamental to quantum computing and contrasts with classical irreversible gates.",
    difficulty: "Medium"
  },
  {
    id: 5,
    title: "W State Challenge",
    description: "Create the robust W state",
    objective: "Transform |100⟩ into |W⟩ = (|100⟩ + |010⟩ + |001⟩)/√3",
    initialState: "|100⟩",
    targetState: "|W⟩",
    availableOperations: ["CNOT₁₂", "CNOT₁₃", "CNOT₂₁", "CNOT₂₃", "H₁", "H₂", "H₃", "X₁", "X₂", "X₃"],
    maxOperations: 5,
    hint: "Use Hadamards to create superposition, then carefully use CNOTs to distribute the excitation.",
    educationalNote: "The W state has the property that if you lose one qubit, the remaining two are still entangled (unlike GHZ). This robustness makes it useful for quantum memory and communication.",
    difficulty: "Hard"
  },
  {
    id: 6,
    title: "Phase and Entanglement",
    description: "Add phase to entangled states",
    objective: "Transform |Φ⁺⟩ into |Φ⁻⟩ = (|00⟩ - |11⟩)/√2",
    initialState: "|Φ⁺⟩",
    targetState: "|Φ⁻⟩",
    availableOperations: ["CNOT", "Z₁", "Z₂", "X₁", "X₂", "H₁", "H₂"],
    maxOperations: 1,
    hint: "Apply Z gate to either qubit to flip the sign of the |11⟩ component.",
    educationalNote: "|Φ⁻⟩ differs from |Φ⁺⟩ only by a relative phase. Both give the same measurement probabilities in the Z basis (50/50 for 00 or 11), but differ in the X basis.",
    difficulty: "Hard"
  }
];

// Operation definitions
const operationDefinitions: Record<string, { name: string; description: string; color: string }> = {
  "CNOT": { name: "CNOT", description: "Controlled-NOT: flips target if control is |1⟩", color: "#58a6ff" },
  "CNOT₁₂": { name: "CNOT(1→2)", description: "CNOT with qubit 1 as control, qubit 2 as target", color: "#58a6ff" },
  "CNOT₁₃": { name: "CNOT(1→3)", description: "CNOT with qubit 1 as control, qubit 3 as target", color: "#58a6ff" },
  "CNOT₂₁": { name: "CNOT(2→1)", description: "CNOT with qubit 2 as control, qubit 1 as target", color: "#58a6ff" },
  "CNOT₂₃": { name: "CNOT(2→3)", description: "CNOT with qubit 2 as control, qubit 3 as target", color: "#58a6ff" },
  "H₁": { name: "H₁", description: "Hadamard on qubit 1", color: "#f0883e" },
  "H₂": { name: "H₂", description: "Hadamard on qubit 2", color: "#f0883e" },
  "H₃": { name: "H₃", description: "Hadamard on qubit 3", color: "#f0883e" },
  "X₁": { name: "X₁", description: "Pauli-X (NOT) on qubit 1", color: "#f85149" },
  "X₂": { name: "X₂", description: "Pauli-X (NOT) on qubit 2", color: "#f85149" },
  "X₃": { name: "X₃", description: "Pauli-X (NOT) on qubit 3", color: "#f85149" },
  "Z₁": { name: "Z₁", description: "Pauli-Z (phase flip) on qubit 1", color: "#3fb950" },
  "Z₂": { name: "Z₂", description: "Pauli-Z (phase flip) on qubit 2", color: "#3fb950" },
};

// State definitions
const stateDefinitions: Record<string, { latex: string; description: string; entangled: boolean }> = {
  "|00⟩": { latex: "|00\\rangle", description: "Both qubits in |0⟩", entangled: false },
  "|01⟩": { latex: "|01\\rangle", description: "Qubit 1: |0⟩, Qubit 2: |1⟩", entangled: false },
  "|10⟩": { latex: "|10\\rangle", description: "Qubit 1: |1⟩, Qubit 2: |0⟩", entangled: false },
  "|11⟩": { latex: "|11\\rangle", description: "Both qubits in |1⟩", entangled: false },
  "|+0⟩": { latex: "|+0\\rangle", description: "Qubit 1 in superposition, qubit 2 in |0⟩", entangled: false },
  "|+1⟩": { latex: "|+1\\rangle", description: "Qubit 1 in superposition, qubit 2 in |1⟩", entangled: false },
  "|++⟩": { latex: "|++\\rangle", description: "Both qubits in superposition (product state)", entangled: false },
  "|Φ⁺⟩": { latex: "|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}", description: "Bell state - correlated", entangled: true },
  "|Φ⁻⟩": { latex: "|\\Phi^-\\rangle = \\frac{|00\\rangle - |11\\rangle}{\\sqrt{2}}", description: "Bell state - correlated with phase", entangled: true },
  "|Ψ⁺⟩": { latex: "|\\Psi^+\\rangle = \\frac{|01\\rangle + |10\\rangle}{\\sqrt{2}}", description: "Bell state - anti-correlated", entangled: true },
  "|Ψ⁻⟩": { latex: "|\\Psi^-\\rangle = \\frac{|01\\rangle - |10\\rangle}{\\sqrt{2}}", description: "Bell state - anti-correlated with phase", entangled: true },
  "|GHZ⟩": { latex: "|GHZ\\rangle = \\frac{|000\\rangle + |111\\rangle}{\\sqrt{2}}", description: "3-qubit GHZ state", entangled: true },
  "|W⟩": { latex: "|W\\rangle = \\frac{|100\\rangle + |010\\rangle + |001\\rangle}{\\sqrt{3}}", description: "W state - robust entanglement", entangled: true },
  "|100⟩": { latex: "|100\\rangle", description: "Qubit 1 in |1⟩, others in |0⟩", entangled: false },
  "|+00⟩": { latex: "|+00\\rangle", description: "Qubit 1 in superposition, others in |0⟩", entangled: false },
};

// Simulate operation application (simplified for key transitions)
const applyOperation = (state: string, op: string): string => {
  const transitions: Record<string, Record<string, string>> = {
    "|00⟩": { "X₁": "|10⟩", "X₂": "|01⟩", "H₁": "|+0⟩", "H₂": "|0+⟩" },
    "|10⟩": { "X₁": "|00⟩", "H₁": "|+0⟩", "CNOT": "|11⟩", "CNOT₁₂": "|11⟩" },
    "|01⟩": { "X₁": "|11⟩", "X₂": "|00⟩", "H₁": "|+1⟩", "H₂": "|0+⟩", "CNOT": "|01⟩", "CNOT₁₂": "|01⟩" },
    "|11⟩": { "X₁": "|01⟩", "X₂": "|10⟩", "H₁": "|-1⟩", "H₂": "|1-⟩", "CNOT": "|10⟩", "CNOT₁₂": "|10⟩" },
    "|+0⟩": { "H₁": "|00⟩", "CNOT": "|Φ⁺⟩", "CNOT₁₂": "|Φ⁺⟩", "X₁": "|-0⟩" },
    "|+1⟩": { "H₁": "|01⟩", "CNOT": "|Ψ⁺⟩", "CNOT₁₂": "|Ψ⁺⟩" },
    "|Φ⁺⟩": { "Z₁": "|Φ⁻⟩", "Z₂": "|Φ⁻⟩", "CNOT": "|+0⟩", "CNOT₁₂": "|+0⟩" },
    "|Φ⁻⟩": { "Z₁": "|Φ⁺⟩", "Z₂": "|Φ⁺⟩" },
    "|Ψ⁺⟩": { "X₁": "|Φ⁺⟩", "X₂": "|Φ⁺⟩" },
    "|100⟩": { "H₁": "|W-like⟩", "X₁": "|000⟩" },
    "|+00⟩": { "CNOT₁₂": "|GHZ-like⟩", "CNOT₁₃": "|GHZ-like⟩" },
  };

  if (state in transitions && op in transitions[state]) {
    return transitions[state][op];
  }

  // Default: state unchanged
  return state;
};

export default function EntanglementMinigame() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentState, setCurrentState] = useState("|00⟩");
  const [appliedOperations, setAppliedOperations] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [feedback, setFeedback] = useState("");
  const [unlockedLevels, setUnlockedLevels] = useState([0]);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedOp, setSelectedOp] = useState<string | null>(null);

  const level = levels[currentLevel];

  useEffect(() => {
    resetLevel();
  }, [currentLevel]);

  const resetLevel = () => {
    setCurrentState(level.initialState);
    setAppliedOperations([]);
    setGameState("playing");
    setFeedback("");
    setShowHint(false);
    setScore(0);
    setAttempts(0);
    setSelectedOp(null);
  };

  const handleOpClick = (op: string) => {
    if (gameState !== "playing") return;
    if (appliedOperations.length >= level.maxOperations) {
      setFeedback("Maximum number of operations reached! Check your solution or reset.");
      return;
    }

    setSelectedOp(op);
    const newState = applyOperation(currentState, op);
    setCurrentState(newState);
    setAppliedOperations([...appliedOperations, op]);
    setAttempts(a => a + 1);

    // Check if target reached
    if (newState === level.targetState) {
      completeLevel();
    } else if (appliedOperations.length + 1 >= level.maxOperations) {
      setFeedback("Maximum operations used without reaching target. Try again!");
    }
  };

  const completeLevel = () => {
    const baseScore = 100;
    const attemptPenalty = attempts * 5;
    const finalScore = Math.max(20, baseScore - attemptPenalty);

    setScore(finalScore);
    setTotalScore(s => s + finalScore);
    setGameState("won");
    setFeedback(`🎉 Level Complete! You created ${level.targetState}!`);

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
  const currentStateInfo = stateDefinitions[currentState] || { latex: currentState, description: "Unknown", entangled: false };
  const targetStateInfo = stateDefinitions[level.targetState];

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
          <h3 className="text-white font-semibold text-lg">Entanglement Challenge</h3>
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
                <p className="text-[#6e7681] text-xs mt-1">Max operations: {level.maxOperations}</p>
              </div>
            </div>
          </div>

          {/* State Visualization */}
          <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg p-6 mb-4">
            <div className="flex flex-col items-center justify-center h-full">
              {/* Circuit Diagram */}
              <div className="flex items-center gap-6 mb-8">
                {/* Initial State */}
                <div className="text-center">
                  <div className="text-[#8b949e] text-xs mb-2">Initial</div>
                  <div className={`w-24 h-24 border-2 ${initialStateInfo?.entangled ? "border-[#a371f7] bg-[#a371f7]/20" : "border-[#30363d] bg-[#161b22]"} rounded-lg flex flex-col items-center justify-center`}>
                    <span className="text-[#c9d1d9] font-mono text-lg">{level.initialState}</span>
                    {initialStateInfo?.entangled && <Link2 size={12} className="text-[#a371f7] mt-1" />}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight size={24} className="text-[#58a6ff]" />

                {/* Applied Operations */}
                <div className="flex items-center gap-1 min-w-[120px] flex-wrap justify-center">
                  {appliedOperations.length === 0 ? (
                    <span className="text-[#6e7681] text-sm">No operations yet</span>
                  ) : (
                    appliedOperations.map((op, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-2 py-1 rounded text-white font-bold text-xs"
                        style={{ backgroundColor: operationDefinitions[op]?.color || "#58a6ff" }}
                      >
                        {op}
                      </motion.div>
                    ))
                  )}
                  {/* Empty slots */}
                  {Array.from({ length: Math.max(0, level.maxOperations - appliedOperations.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-10 h-8 rounded border-2 border-dashed border-[#30363d]" />
                  ))}
                </div>

                {/* Arrow */}
                <ArrowRight size={24} className="text-[#58a6ff]" />

                {/* Current State */}
                <div className="text-center">
                  <div className="text-[#8b949e] text-xs mb-2">Current</div>
                  <motion.div
                    animate={gameState === "won" ? { scale: [1, 1.1, 1] } : {}}
                    className={`w-24 h-24 border-2 rounded-lg flex flex-col items-center justify-center ${
                      currentState === level.targetState
                        ? "border-[#3fb950] bg-[#3fb950]/20"
                        : currentStateInfo?.entangled
                        ? "border-[#a371f7] bg-[#a371f7]/20"
                        : "border-[#58a6ff] bg-[#58a6ff]/20"
                    }`}
                  >
                    <span className={`font-mono text-lg ${
                      currentState === level.targetState ? "text-[#3fb950]" : "text-[#c9d1d9]"
                    }`}>
                      {currentState}
                    </span>
                    {currentStateInfo?.entangled && <Link2 size={12} className="text-[#a371f7] mt-1" />}
                  </motion.div>
                </div>
              </div>

              {/* Target State */}
              <div className="flex items-center gap-3 p-4 bg-[#161b22] border border-[#f0883e]/30 rounded-lg">
                <Star size={16} className="text-[#f0883e]" />
                <span className="text-[#8b949e] text-sm">Target:</span>
                <span className="text-[#f0883e] font-mono font-bold">{level.targetState}</span>
                {targetStateInfo?.entangled && (
                  <span className="flex items-center gap-1 text-[#a371f7] text-xs">
                    <Link2 size={12} /> Entangled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Available Operations */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <h4 className="text-[#8b949e] text-sm mb-3">Available Operations:</h4>
            <div className="flex gap-2 flex-wrap">
              {level.availableOperations.map((op) => (
                <motion.button
                  key={op}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleOpClick(op)}
                  disabled={gameState !== "playing" || appliedOperations.length >= level.maxOperations}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-bold text-sm transition-all disabled:opacity-50 hover:shadow-lg"
                    style={{ backgroundColor: operationDefinitions[op]?.color || "#58a6ff" }}
                  >
                    {op}
                  </div>
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

          {selectedOp && (
            <div className="p-4 border-b border-[#30363d]">
              <div className="text-[#58a6ff] font-medium text-sm mb-1">{operationDefinitions[selectedOp]?.name}</div>
              <p className="text-[#8b949e] text-xs">{operationDefinitions[selectedOp]?.description}</p>
            </div>
          )}

          <div className="p-4 border-b border-[#30363d]">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#21262d] rounded-lg">
                <span className="text-[#8b949e] text-xs">Operations Used</span>
                <p className="text-white font-bold text-lg">{appliedOperations.length}/{level.maxOperations}</p>
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
