"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, ChevronRight, Terminal, 
  Hash, Type, Code, Quote, ArrowRight, Sparkles,
  FileCode, Settings, Eye
} from "lucide-react";

interface Token {
  type: string;
  value: string;
  line: number;
  col: number;
  color: string;
}

const sourceCodeExamples = [
  { name: "Variable Declaration", code: "let x = 42;" },
  { name: "Function Call", code: 'print("Hello");' },
  { name: "If Statement", code: "if (x >= 10) { return x; }" },
  { name: "Complex Expression", code: "result = (a + b) * c - d / e;" },
  { name: "Loop", code: "while (i < 100) { i = i + 1; }" },
];

const tokenTypeColors: Record<string, string> = {
  KEYWORD: "#ff7b72",
  IDENTIFIER: "#79c0ff",
  OPERATOR: "#d2a8ff",
  NUMBER: "#79c0ff",
  STRING: "#a5d6ff",
  DELIMITER: "#8b949e",
  COMMENT: "#8b949e",
};

function LexerVisualizerEnhanced() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [currentCode, setCurrentCode] = useState(sourceCodeExamples[0].code);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [currentPos, setCurrentPos] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<"idle" | "skip" | "classify" | "extract" | "emit">("idle");

  const tokenize = useCallback((code: string): Token[] => {
    const result: Token[] = [];
    let pos = 0;
    let line = 1;
    let col = 1;
    const keywords = new Set(["let", "const", "var", "if", "else", "while", "for", "return", "function", "print"]);
    
    while (pos < code.length) {
      let char = code[pos];
      
      // Skip whitespace
      if (/\s/.test(char)) {
        if (char === "\n") { line++; col = 1; }
        else { col++; }
        pos++;
        continue;
      }
      
      // Skip comments
      if (char === "/" && code[pos + 1] === "/") {
        while (pos < code.length && code[pos] !== "\n") {
          pos++;
        }
        continue;
      }
      
      // String literals
      if (char === '"' || char === "'") {
        const quote = char;
        const startCol = col;
        let value = "";
        pos++; col++;
        while (pos < code.length && code[pos] !== quote) {
          if (code[pos] === "\\") {
            pos++; col++;
            value += code[pos];
          } else {
            value += code[pos];
          }
          pos++; col++;
        }
        pos++; col++;
        result.push({ type: "STRING", value: `"${value}"`, line, col: startCol, color: tokenTypeColors.STRING });
        continue;
      }
      
      // Numbers
      if (/\d/.test(char)) {
        const startCol = col;
        let value = "";
        while (pos < code.length && (/\d/.test(code[pos]) || code[pos] === ".")) {
          value += code[pos];
          pos++; col++;
        }
        result.push({ type: "NUMBER", value, line, col: startCol, color: tokenTypeColors.NUMBER });
        continue;
      }
      
      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(char)) {
        const startCol = col;
        let value = "";
        while (pos < code.length && /[a-zA-Z0-9_]/.test(code[pos])) {
          value += code[pos];
          pos++; col++;
        }
        const type = keywords.has(value) ? "KEYWORD" : "IDENTIFIER";
        result.push({ type, value, line, col: startCol, color: tokenTypeColors[type] });
        continue;
      }
      
      // Multi-character operators
      const twoChar = code.slice(pos, pos + 2);
      if (["<=", ">=", "==", "!=", "&&", "||", "++", "--", "+=", "-="].includes(twoChar)) {
        result.push({ type: "OPERATOR", value: twoChar, line, col, color: tokenTypeColors.OPERATOR });
        pos += 2; col += 2;
        continue;
      }
      
      // Single-character operators and delimiters
      if ("+-*/=<>!&|".includes(char)) {
        result.push({ type: "OPERATOR", value: char, line, col, color: tokenTypeColors.OPERATOR });
        pos++; col++;
        continue;
      }
      
      if ("();{},[]".includes(char)) {
        result.push({ type: "DELIMITER", value: char, line, col, color: tokenTypeColors.DELIMITER });
        pos++; col++;
        continue;
      }
      
      // Unknown character
      result.push({ type: "UNKNOWN", value: char, line, col, color: "#f85149" });
      pos++; col++;
    }
    
    return result;
  }, []);

  useEffect(() => {
    if (isRunning && currentPos < currentCode.length) {
      const timer = setTimeout(() => {
        const newTokens = tokenize(currentCode.slice(0, currentPos + 1));
        setTokens(newTokens);
        setCurrentPos(prev => prev + 1);
        
        // Update phase based on what we're doing
        const char = currentCode[currentPos];
        if (/\s/.test(char)) {
          setCurrentPhase("skip");
        } else if (/[a-zA-Z_]/.test(char)) {
          setCurrentPhase("classify");
        } else if (/\d/.test(char)) {
          setCurrentPhase("extract");
        } else {
          setCurrentPhase("emit");
        }
      }, speed);
      return () => clearTimeout(timer);
    } else if (currentPos >= currentCode.length) {
      setIsRunning(false);
      setCurrentPhase("idle");
    }
  }, [isRunning, currentPos, currentCode, speed, tokenize]);

  const reset = () => {
    setCurrentPos(0);
    setTokens([]);
    setIsRunning(false);
    setSelectedToken(null);
    setCurrentPhase("idle");
  };

  const runAll = () => {
    const allTokens = tokenize(currentCode);
    setTokens(allTokens);
    setCurrentPos(currentCode.length);
    setIsRunning(false);
    setCurrentPhase("idle");
  };

  const handleExampleChange = (idx: number) => {
    setSelectedExample(idx);
    setCurrentCode(sourceCodeExamples[idx].code);
    reset();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#238636]/20 rounded-lg">
            <Code size={20} className="text-[#3fb950]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Lexer & Tokenizer</h3>
            <p className="text-[#8b949e] text-sm">Watch source code transform into tokens</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className={`p-2 rounded-lg transition-colors ${showGuide ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e] hover:text-white"}`}
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Source & Controls */}
        <div className="w-1/2 flex flex-col border-r border-[#30363d]">
          {/* Example Selector */}
          <div className="p-3 border-b border-[#30363d] bg-[#0d1117]">
            <label className="text-[#8b949e] text-xs mb-2 block">Select Example</label>
            <select
              value={selectedExample}
              onChange={(e) => handleExampleChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-white text-sm"
            >
              {sourceCodeExamples.map((ex, i) => (
                <option key={i} value={i}>{ex.name}</option>
              ))}
            </select>
          </div>

          {/* Source Code Display */}
          <div className="flex-1 p-4 bg-[#0d1117] font-mono text-sm overflow-auto">
            <div className="text-[#8b949e] mb-2 text-xs">Source Code:</div>
            <div className="relative">
              <pre className="text-[#c9d1d9] leading-7">
                {currentCode.split("").map((char, i) => (
                  <motion.span
                    key={i}
                    className={`inline ${i < currentPos ? "text-white" : "text-[#6e7681]"} ${
                      i === currentPos && isRunning ? "bg-[#58a6ff]/30" : ""
                    }`}
                    initial={i >= currentPos - 1 && i <= currentPos && isRunning ? { scale: 1.5, color: "#58a6ff" } : false}
                    animate={{ scale: 1 }}
                  >
                    {char}
                  </motion.span>
                ))}
              </pre>
              {isRunning && (
                <motion.div
                  className="absolute w-0.5 h-5 bg-[#58a6ff]"
                  style={{ left: `${Math.min(currentPos, currentCode.length) * 0.6}rem`, top: "0.2rem" }}
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                />
              )}
            </div>
          </div>

          {/* Status & Controls */}
          <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
            {showGuide && (
              <div className="mb-3 p-2 bg-[#21262d] rounded-lg">
                <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                  <span className={`px-2 py-0.5 rounded ${currentPhase === "skip" ? "bg-[#58a6ff] text-white" : "bg-[#30363d]"}`}>Skip</span>
                  <ArrowRight size={12} />
                  <span className={`px-2 py-0.5 rounded ${currentPhase === "classify" ? "bg-[#58a6ff] text-white" : "bg-[#30363d]"}`}>Classify</span>
                  <ArrowRight size={12} />
                  <span className={`px-2 py-0.5 rounded ${currentPhase === "extract" ? "bg-[#58a6ff] text-white" : "bg-[#30363d]"}`}>Extract</span>
                  <ArrowRight size={12} />
                  <span className={`px-2 py-0.5 rounded ${currentPhase === "emit" ? "bg-[#58a6ff] text-white" : "bg-[#30363d]"}`}>Emit Token</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium transition-colors"
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} />}
                  {isRunning ? "Pause" : "Step Through"}
                </button>
                <button
                  onClick={runAll}
                  className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-medium transition-colors"
                >
                  <Sparkles size={16} />
                  Tokenize All
                </button>
                <button
                  onClick={reset}
                  className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#8b949e] text-sm">Speed:</span>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
            <div className="mt-2 text-[#8b949e] text-xs">
              Position: {currentPos} / {currentCode.length} | Tokens: {tokens.length}
            </div>
          </div>
        </div>

        {/* Right Panel - Token Output */}
        <div className="w-1/2 flex flex-col bg-[#161b22]">
          {/* Token Legend */}
          <div className="p-3 border-b border-[#30363d]">
            <div className="flex flex-wrap gap-2 text-xs">
              {Object.entries(tokenTypeColors).map(([type, color]) => (
                <span key={type} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[#8b949e]">{type}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Token Stream */}
          <div className="flex-1 overflow-auto p-4">
            <div className="text-[#8b949e] text-xs mb-3 flex items-center gap-2">
              <Hash size={12} />
              Token Stream
            </div>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {tokens.map((token, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedToken(token)}
                    className={`px-3 py-2 rounded-lg font-mono text-sm border transition-all ${
                      selectedToken === token
                        ? "border-[#58a6ff] bg-[#58a6ff]/20"
                        : "border-transparent hover:border-[#30363d]"
                    }`}
                    style={{ 
                      backgroundColor: `${token.color}20`,
                      color: token.color 
                    }}
                  >
                    {token.value}
                  </motion.button>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Token Details */}
          {selectedToken && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t border-[#30363d] bg-[#0d1117]"
            >
              <div className="flex items-center gap-2 mb-3">
                <Type size={16} className="text-[#58a6ff]" />
                <span className="text-white font-medium">Token Details</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-2 bg-[#21262d] rounded">
                  <span className="text-[#8b949e]">Type:</span>
                  <span className="ml-2 font-mono" style={{ color: selectedToken.color }}>
                    {selectedToken.type}
                  </span>
                </div>
                <div className="p-2 bg-[#21262d] rounded">
                  <span className="text-[#8b949e]">Value:</span>
                  <span className="ml-2 font-mono text-white">{selectedToken.value}</span>
                </div>
                <div className="p-2 bg-[#21262d] rounded">
                  <span className="text-[#8b949e]">Line:</span>
                  <span className="ml-2 text-white">{selectedToken.line}</span>
                </div>
                <div className="p-2 bg-[#21262d] rounded">
                  <span className="text-[#8b949e]">Column:</span>
                  <span className="ml-2 text-white">{selectedToken.col}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="p-3 border-t border-[#30363d] bg-[#0d1117]">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-[#21262d] rounded">
                <div className="text-[#8b949e]">Total Tokens</div>
                <div className="text-white font-bold text-lg">{tokens.length}</div>
              </div>
              <div className="p-2 bg-[#21262d] rounded">
                <div className="text-[#8b949e]">Unique Types</div>
                <div className="text-white font-bold text-lg">
                  {new Set(tokens.map(t => t.type)).size}
                </div>
              </div>
              <div className="p-2 bg-[#21262d] rounded">
                <div className="text-[#8b949e]">Characters</div>
                <div className="text-white font-bold text-lg">{currentCode.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LexerVisualizerEnhanced;
