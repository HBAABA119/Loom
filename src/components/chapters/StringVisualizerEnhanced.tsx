"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Search, ArrowRight
} from "lucide-react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Step {
  step: number;
  title: string;
  description: string;
  codeLines: number[];
  text: string;
  pattern: string;
  textIndex: number;
  patternIndex: number;
  matches: number[];
  comparing: boolean;
  action: "init" | "compare" | "match" | "mismatch" | "shift" | "found";
  explanation: string;
  theoryConnection: string;
  complexity: string;
}

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
  { label: "3x", value: 3 },
];

const codeLines = [
  "// Naive String Pattern Matching",
  "function findPattern(text, pattern) {",
  "  const n = text.length;       // Text length",
  "  const m = pattern.length;     // Pattern length",
  "  const positions = [];         // Match positions",
  "",
  "  // Try each possible starting position",
  "  for (let i = 0; i <= n - m; i++) {",
  "    let j = 0;",
  "",
  "    // Compare pattern with text substring",
  "    while (j < m && text[i + j] === pattern[j]) {",
  "      j++;  // Characters match, continue",
  "    }",
  "",
  "    // If all characters matched",
  "    if (j === m) {",
  "      positions.push(i);  // Found at position i",
  "    }",
  "  }",
  "",
  "  return positions;",
  "}",
  "",
  "// Time Complexity: O(n × m) worst case",
  "// Space Complexity: O(1) auxiliary",
];

const text = "ABABABCABAB";
const pattern = "ABAB";

const generateSteps = (): Step[] => [
  {
    step: 0,
    title: "String Pattern Matching",
    description: "Finding a pattern within a larger text is a fundamental string operation used in search engines, DNA sequencing, and text editors.",
    codeLines: [1, 2, 3, 4, 5],
    text,
    pattern,
    textIndex: 0,
    patternIndex: -1,
    matches: [],
    comparing: false,
    action: "init",
    explanation: `Text: "${text}" (length 11), Pattern: "${pattern}" (length 4). We'll slide the pattern across the text, comparing character by character at each position.`,
    theoryConnection: "String matching is used in: Ctrl+F in browsers, grep command, plagiarism detection, bioinformatics (DNA pattern matching), and intrusion detection systems.",
    complexity: "Worst case: O(n×m) - when pattern nearly matches at every position"
  },
  {
    step: 1,
    title: "Position 0: Compare A-B-A-B",
    description: "Start at text[0]. Compare each character of pattern with text.",
    codeLines: [7, 8, 9, 10, 11],
    text,
    pattern,
    textIndex: 0,
    patternIndex: 3,
    matches: [],
    comparing: true,
    action: "compare",
    explanation: "text[0]='A' vs pattern[0]='A' ✓, text[1]='B' vs pattern[1]='B' ✓, text[2]='A' vs pattern[2]='A' ✓, text[3]='B' vs pattern[3]='B' ✓. All 4 characters match!",
    theoryConnection: "This is the 'naive' approach - straightforward but can be slow. Advanced algorithms (KMP, Rabin-Karp, Boyer-Moore) skip unnecessary comparisons.",
    complexity: "Best case: O(n) - when first character never matches"
  },
  {
    step: 2,
    title: "Match Found at Position 0!",
    description: "Pattern 'ABAB' found starting at index 0.",
    codeLines: [15, 16, 17],
    text,
    pattern,
    textIndex: 0,
    patternIndex: -1,
    matches: [0],
    comparing: false,
    action: "found",
    explanation: "j === m (4 === 4), so pattern found at position 0! The substring text[0..3] equals 'ABAB'. This is recorded as a match.",
    theoryConnection: "Finding multiple occurrences is important. Search engines find all instances of your query. DNA researchers find all locations of a gene sequence.",
    complexity: "Recording match: O(1)"
  },
  {
    step: 3,
    title: "Position 1: Shift and Compare",
    description: "Move pattern one position right. Compare starting at text[1].",
    codeLines: [7, 8, 9, 10],
    text,
    pattern,
    textIndex: 1,
    patternIndex: 0,
    matches: [0],
    comparing: true,
    action: "shift",
    explanation: "text[1]='B' vs pattern[0]='A'. Mismatch on first character! No need to check further. We immediately shift to next position.",
    theoryConnection: "This early termination saves time. The naive algorithm is O(n×m) worst case, but often faster in practice due to early mismatches.",
    complexity: "Early mismatch: O(1) for this position"
  },
  {
    step: 4,
    title: "Position 2: Compare B-A-B-C",
    description: "Pattern at position 2. Compare with text[2..5].",
    codeLines: [7, 8, 9, 10, 11],
    text,
    pattern,
    textIndex: 2,
    patternIndex: 2,
    matches: [0],
    comparing: true,
    action: "compare",
    explanation: "text[2]='A' vs 'A' ✓, text[3]='B' vs 'B' ✓, text[4]='A' vs 'A' ✓, text[5]='B' vs 'B'... wait, text[5]='B'? No! text[5]='C'. Mismatch at pattern[3]!",
    theoryConnection: "Partial matches are common. The naive algorithm has no memory of what matched. KMP algorithm uses this info to skip ahead intelligently.",
    complexity: "Partial match: O(m) comparisons before mismatch"
  },
  {
    step: 5,
    title: "Position 2: Mismatch - Shift",
    description: "Mismatch at position 2+3=5. Pattern shifts right by 1.",
    codeLines: [7, 8],
    text,
    pattern,
    textIndex: 3,
    patternIndex: -1,
    matches: [0],
    comparing: false,
    action: "mismatch",
    explanation: "Since j < m when loop ended, it's a mismatch. Pattern shifts to position 3. Only 4 more positions to check (n-m = 11-4 = 7 total positions).",
    theoryConnection: "In the worst case (text='AAAAAA', pattern='AAAB'), we compare almost n×m characters. That's why optimized algorithms exist.",
    complexity: "Worst case: many partial matches waste time"
  },
  {
    step: 6,
    title: "Position 3: Quick Mismatch",
    description: "Pattern at position 3. Immediate mismatch.",
    codeLines: [10, 11],
    text,
    pattern,
    textIndex: 3,
    patternIndex: 0,
    matches: [0],
    comparing: true,
    action: "mismatch",
    explanation: "text[3]='B' vs pattern[0]='A'. Immediate mismatch! These are cheap - only 1 comparison before shifting.",
    theoryConnection: "Random text with diverse characters leads to many early mismatches, making naive algorithm practical for many real-world cases.",
    complexity: "Fast reject: O(1) per position"
  },
  {
    step: 7,
    title: "Position 4: Another Mismatch",
    description: "Pattern at position 4. text[4]='A' matches, but...",
    codeLines: [10, 11],
    text,
    pattern,
    textIndex: 4,
    patternIndex: 1,
    matches: [0],
    comparing: true,
    action: "mismatch",
    explanation: "text[4]='A' vs 'A' ✓, text[5]='C' vs 'B' ✗. Two comparisons then mismatch. Pattern shifts to position 5.",
    theoryConnection: "Notice the asymmetry: good algorithms handle repeated patterns specially. Boyer-Moore skips ahead based on character mismatches.",
    complexity: "Pattern-dependent performance"
  },
  {
    step: 8,
    title: "Position 5: Mismatch on First Char",
    description: "Pattern at position 5. Quick reject.",
    codeLines: [10],
    text,
    pattern,
    textIndex: 5,
    patternIndex: 0,
    matches: [0],
    comparing: true,
    action: "mismatch",
    explanation: "text[5]='C' vs 'A'. Mismatch! Move to position 6. We're almost done - only positions 6 and 7 left.",
    theoryConnection: "The alphabet size affects performance. DNA (4 letters) has more collisions than English text (26+ letters), making naive slower.",
    complexity: "Alphabet size affects collision rate"
  },
  {
    step: 9,
    title: "Position 6: Match Found!",
    description: "Pattern at position 6. Full match discovered!",
    codeLines: [10, 11, 15, 16, 17],
    text,
    pattern,
    textIndex: 6,
    patternIndex: 3,
    matches: [0, 6],
    comparing: true,
    action: "found",
    explanation: "text[6]='A', text[7]='B', text[8]='A', text[9]='B' all match! Second occurrence at position 6. Pattern 'ABAB' appears twice in the text.",
    theoryConnection: "Overlapping matches are possible! 'AAAA' contains 'AA' at positions 0, 1, and 2. Some applications need all, others need non-overlapping.",
    complexity: "Found 2 matches in this text"
  },
  {
    step: 10,
    title: "Position 7: Final Check",
    description: "Last valid starting position. Quick reject.",
    codeLines: [7, 10],
    text,
    pattern,
    textIndex: 7,
    patternIndex: 0,
    matches: [0, 6],
    comparing: true,
    action: "mismatch",
    explanation: "text[7]='B' vs 'A'. Mismatch immediately. Loop ends - no more valid positions (i <= 11-4 = 7). Algorithm complete.",
    theoryConnection: "Total comparisons: ~20 for 8 positions. Average case is much better than worst case O(n×m) = 44. Algorithm efficiency varies by input.",
    complexity: "Actual: ~0.5 × n × m comparisons"
  },
  {
    step: 11,
    title: "Results and Summary",
    description: "Pattern matching complete. Two matches found.",
    codeLines: [20, 21],
    text,
    pattern,
    textIndex: -1,
    patternIndex: -1,
    matches: [0, 6],
    comparing: false,
    action: "init",
    explanation: `Final result: Pattern "${pattern}" found at positions [0, 6]. The naive algorithm checked 8 positions with varying numbers of comparisons per position.`,
    theoryConnection: "Advanced algorithms: KMP (O(n+m)), Rabin-Karp (rolling hash), Boyer-Moore (skip ahead). Each optimizes different aspects of this fundamental problem.",
    complexity: "Optimal algorithms achieve O(n+m) - linear time!"
  },
];

export default function StringVisualizerEnhanced() {
  const { 
    currentStep: stepIndex, 
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
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setTotalSteps(generateSteps().length);
  }, [setTotalSteps]);

  useEffect(() => {
    setCurrentStep(stepIndex);
  }, [stepIndex]);

  const steps = generateSteps();
  const step = steps[currentStep] || steps[0];

  useEffect(() => {
    if (step?.codeLines) {
      setActiveLines(step.codeLines);
    }
  }, [step, setActiveLines]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        nextStep();
      }, 2000 / playbackSpeed);
    } else if (currentStep >= steps.length - 1 && isPlaying) {
      pause();
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, steps.length, playbackSpeed, nextStep, pause]);

  const handleReset = useCallback(() => {
    pause();
    setStep(0);
  }, [pause, setStep]);

  const getCharStyle = (isPattern: boolean, index: number) => {
    if (isPattern) {
      // Pattern character styling
      const offset = step.textIndex;
      const isComparing = step.comparing && index === step.patternIndex;
      const isPastComparison = step.comparing && index < step.patternIndex;
      
      if (isComparing) {
        return "bg-[#f0883e] border-[#f0883e] text-white scale-110 shadow-lg shadow-[#f0883e]/50";
      }
      if (isPastComparison) {
        return "bg-[#3fb950] border-[#3fb950] text-white";
      }
      return "bg-[#21262d] border-[#30363d] text-[#c9d1d9]";
    } else {
      // Text character styling
      const isInWindow = index >= step.textIndex && index < step.textIndex + pattern.length;
      const patternIndex = index - step.textIndex;
      const isComparing = step.comparing && patternIndex === step.patternIndex && patternIndex >= 0;
      const isMatched = step.matches.some(m => index >= m && index < m + pattern.length);
      
      if (isComparing) {
        return "bg-[#f0883e] border-[#f0883e] text-white scale-110 shadow-lg shadow-[#f0883e]/50";
      }
      if (isMatched) {
        return "bg-[#3fb950] border-[#3fb950] text-white";
      }
      if (isInWindow) {
        return "bg-[#58a6ff]/20 border-[#58a6ff] text-[#58a6ff]";
      }
      return "bg-[#161b22] border-[#30363d] text-[#8b949e]";
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div>
          <h3 className="text-white font-semibold text-lg">String Pattern Matching</h3>
          <p className="text-[#8b949e] text-sm">Naive Algorithm: Sliding window character comparison</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#21262d] rounded-lg">
            <Search size={14} className="text-[#58a6ff]" />
            <span className="text-[#8b949e] text-sm">Matches:</span>
            <span className="text-[#3fb950] font-bold">{step.matches.length}</span>
          </div>
          <div className="w-32 h-2 bg-[#21262d] rounded-full">
            <div 
              className="h-full bg-[#58a6ff] rounded-full transition-all"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Visualization */}
        <div className="flex-1 flex flex-col p-6">
          {/* Text Display */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {/* Indices */}
            <div className="flex gap-1">
              {text.split("").map((_, i) => (
                <div key={i} className="w-12 text-center text-xs text-[#6e7681] font-mono">
                  {i}
                </div>
              ))}
            </div>

            {/* Text Characters */}
            <div className="flex gap-1">
              {text.split("").map((char, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: step.comparing && i === step.textIndex + step.patternIndex ? 1.1 : 1,
                  }}
                  className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${getCharStyle(false, i)}`}
                >
                  {char}
                </motion.div>
              ))}
            </div>

            {/* Pattern (positioned relative to text) */}
            {step.textIndex >= 0 && (
              <div className="relative" style={{ marginLeft: `${step.textIndex * 52}px` }}>
                <div className="flex gap-1">
                  {pattern.split("").map((char, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: step.comparing && i === step.patternIndex ? -5 : 0,
                      }}
                      className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${getCharStyle(true, i)}`}
                    >
                      {char}
                    </motion.div>
                  ))}
                </div>
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-[#f0883e] font-mono whitespace-nowrap">
                  Pattern @ pos {step.textIndex}
                </div>
              </div>
            )}

            {/* Arrow indicator */}
            {step.textIndex >= 0 && step.comparing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-[#f0883e]"
              >
                <ArrowRight size={20} />
                <span className="text-sm font-medium">Comparing text[{step.textIndex + step.patternIndex}] vs pattern[{step.patternIndex}]</span>
              </motion.div>
            )}

            {/* Match indicators */}
            {step.matches.length > 0 && (
              <div className="flex gap-4 mt-4">
                {step.matches.map((pos) => (
                  <div key={pos} className="px-3 py-1 bg-[#3fb950]/20 border border-[#3fb950] rounded-full text-[#3fb950] text-sm">
                    Match @ position {pos}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#f0883e] rounded" />
              <span className="text-[#8b949e]">Comparing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#3fb950] rounded" />
              <span className="text-[#8b949e]">Matched</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#58a6ff]/20 border border-[#58a6ff] rounded" />
              <span className="text-[#8b949e]">Current Window</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-96 border-l border-[#30363d] bg-[#161b22] flex flex-col">
          <div className="p-5 border-b border-[#30363d]">
            <span className="text-[#58a6ff] text-xs font-mono uppercase tracking-wider">
              Step {currentStep + 1}: {step.title}
            </span>
            <p className="text-[#c9d1d9] mt-3 leading-relaxed">{step.description}</p>
          </div>

          <div className="p-5 border-b border-[#30363d] flex-1 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">What's Happening</h4>
            <p className="text-[#c9d1d9] text-sm leading-relaxed mb-4">{step.explanation}</p>
            
            <div className="mt-4 p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg">
              <h4 className="text-[#3fb950] text-xs uppercase tracking-wider mb-1">💡 Theory Connection</h4>
              <p className="text-[#c9d1d9] text-sm leading-relaxed">{step.theoryConnection}</p>
            </div>

            <div className="mt-4 p-3 bg-[#58a6ff]/10 border border-[#58a6ff]/30 rounded-lg">
              <h4 className="text-[#58a6ff] text-xs uppercase tracking-wider mb-1">⏱️ Complexity</h4>
              <p className="text-[#c9d1d9] text-sm font-mono">{step.complexity}</p>
            </div>
          </div>

          <div className="p-4 bg-[#0d1117] max-h-56 overflow-y-auto">
            <h4 className="text-[#8b949e] text-xs uppercase tracking-wider mb-2">Code Reference</h4>
            <div className="text-xs font-mono">
              {codeLines.map((line, i) => (
                <div 
                  key={i}
                  className={`px-2 py-0.5 rounded ${
                    step.codeLines?.includes(i + 1)
                      ? "bg-[#238636]/30 text-[#7ee787] border-l-2 border-[#238636]"
                      : "text-[#8b949e]"
                  }`}
                >
                  <span className="text-[#6e7681] w-6 inline-block select-none">{i + 1}</span>
                  {line || " "}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => { pause(); setStep(0); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipBack size={18} />
            </button>
            <button onClick={prevStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronLeft size={20} />
            </button>
            
            <button onClick={togglePlay} className="px-6 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium flex items-center gap-2">
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              {isPlaying ? "Pause" : "Play"}
            </button>
            
            <button onClick={nextStep} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <ChevronRight size={20} />
            </button>
            <button onClick={() => { pause(); setStep(steps.length - 1); }} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <SkipForward size={18} />
            </button>
            <button onClick={handleReset} className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="flex items-center gap-3">
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
