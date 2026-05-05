"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, SkipBack, SkipForward, RotateCcw, 
  ChevronLeft, ChevronRight, Lock, Unlock, Hash, Key, Shield
} from "lucide-react";

interface CipherState {
  plaintext: string;
  ciphertext: string;
  key: string | number;
  shift?: number;
  currentStep: number;
  processing: boolean;
}

type CipherType = "caesar" | "vigenere" | "rsa" | "hash";

interface StepInfo {
  title: string;
  description: string;
  latex?: string;
}

const speeds = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "1.5x", value: 1.5 },
  { label: "2x", value: 2 },
];

// Caesar cipher functions
const caesarEncrypt = (text: string, shift: number): string => {
  return text.split('').map(char => {
    if (!/[a-zA-Z]/.test(char)) return char;
    const base = char <= 'Z' ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  }).join('');
};

const caesarDecrypt = (text: string, shift: number): string => {
  return caesarEncrypt(text, -shift);
};

// Vigenere cipher functions
const vigenereEncrypt = (text: string, key: string): string => {
  const k = key.toUpperCase();
  let keyIndex = 0;
  return text.split('').map(char => {
    if (!/[a-zA-Z]/.test(char)) return char;
    const base = char <= 'Z' ? 65 : 97;
    const shift = k.charCodeAt(keyIndex % k.length) - 65;
    keyIndex++;
    return String.fromCharCode(((char.charCodeAt(0) - base + shift + 26) % 26) + base);
  }).join('');
};

// Simple hash simulation (for visualization - not cryptographically secure)
const simpleHash = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  // Convert to hex string padded to 64 chars (simulating SHA-256)
  const hex = Math.abs(hash).toString(16).padStart(64, '0');
  return hex.slice(0, 64);
};

export default function CipherVisualizerEnhanced() {
  const [cipherType, setCipherType] = useState<CipherType>("caesar");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showHint, setShowHint] = useState(false);

  // Cipher state
  const [caesarShift, setCaesarShift] = useState(3);
  const [vigenereKey, setVigenereKey] = useState("KEY");
  const [plaintext, setPlaintext] = useState("HELLO");
  const [processedText, setProcessedText] = useState("");
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);

  const getMaxSteps = () => {
    switch (cipherType) {
      case "caesar": return plaintext.length + 2;
      case "vigenere": return plaintext.length + 2;
      case "rsa": return 7;
      case "hash": return 4;
      default: return 5;
    }
  };

  const getStepInfo = (step: number): StepInfo => {
    switch (cipherType) {
      case "caesar":
        if (step === 0) return {
          title: "Input Setup",
          description: `Plaintext: "${plaintext}", Shift: ${caesarShift}`,
          latex: `E(x) = (x + ${caesarShift}) mod 26`
        };
        if (step <= plaintext.length) {
          const char = plaintext[step - 1];
          const shifted = caesarEncrypt(char, caesarShift);
          return {
            title: `Process '${char}'`,
            description: char.match(/[a-zA-Z]/) 
              ? `'${char}' + ${caesarShift} = '${shifted}'`
              : `'${char}' is not a letter, kept as-is`,
            latex: char.match(/[a-zA-Z]/) 
              ? `(${char.charCodeAt(0) - 65} + ${caesarShift}) mod 26 = ${shifted.charCodeAt(0) - 65}`
              : "\\text{non-alphabetic}"
          };
        }
        return {
          title: "Complete",
          description: `Ciphertext: "${caesarEncrypt(plaintext, caesarShift)}"`,
          latex: "\\text{Encryption complete}"
        };
      
      case "vigenere":
        if (step === 0) return {
          title: "Input Setup",
          description: `Plaintext: "${plaintext}", Key: "${vigenereKey}"`,
          latex: "\\text{Key stream: }" + vigenereKey.repeat(Math.ceil(plaintext.length / vigenereKey.length)).slice(0, plaintext.length)
        };
        if (step <= plaintext.length) {
          const char = plaintext[step - 1];
          const keyChar = vigenereKey[(step - 1) % vigenereKey.length];
          const shifted = vigenereEncrypt(char, vigenereKey);
          const shiftedChar = shifted[step - 1];
          return {
            title: `Process '${char}'`,
            description: char.match(/[a-zA-Z]/)
              ? `'${char}' + '${keyChar}' = '${shiftedChar}'`
              : `'${char}' kept as-is`,
            latex: char.match(/[a-zA-Z]/) 
              ? `${char.charCodeAt(0) - 65} + ${keyChar.charCodeAt(0) - 65} = ${shiftedChar.charCodeAt(0) - 65} \\text{ mod } 26`
              : ""
          };
        }
        return {
          title: "Complete",
          description: `Ciphertext: "${vigenereEncrypt(plaintext, vigenereKey)}"`,
          latex: "\\text{Encryption complete}"
        };

      case "rsa":
        const rsaSteps = [
          { title: "Choose Primes", description: "Select two prime numbers p and q", latex: "p = 61, q = 53" },
          { title: "Compute n", description: "Calculate n = p × q", latex: "n = 61 \\times 53 = 3233" },
          { title: "Euler's Totient", description: "Compute φ(n) = (p-1)(q-1)", latex: "\\phi(n) = 60 \\times 52 = 3120" },
          { title: "Public Exponent", description: "Choose e coprime to φ(n)", latex: "e = 17, \\gcd(17, 3120) = 1" },
          { title: "Private Exponent", description: "Find d where d×e ≡ 1 mod φ(n)", latex: "d = 2753" },
          { title: "Encrypt", description: "c = m^e mod n", latex: "c = 65^{17} \\mod 3233 = 2790" },
          { title: "Verify", description: "m = c^d mod n", latex: "m = 2790^{2753} \\mod 3233 = 65" }
        ];
        return rsaSteps[step] || rsaSteps[rsaSteps.length - 1];

      case "hash":
        const hashSteps = [
          { title: "Input Message", description: `Message: "${plaintext}"`, latex: "\\text{Input}" },
          { title: "Initialize", description: "Set up initial hash values (IV)", latex: "h_0...h_7 = \\text{constants}" },
          { title: "Process Blocks", description: "Process message in 512-bit blocks", latex: "\\text{Compression function}" },
          { title: "Output", description: `Hash: ${simpleHash(plaintext).slice(0, 16)}...`, latex: "\\text{256-bit digest}" }
        ];
        return hashSteps[step] || hashSteps[hashSteps.length - 1];

      default:
        return { title: "Unknown", description: "" };
    }
  };

  const nextStep = useCallback(() => {
    const max = getMaxSteps();
    if (currentStep < max - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStep, cipherType, plaintext, caesarShift, vigenereKey]);

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setAnimatingIndex(null);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        nextStep();
      }, 1500 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, nextStep, speed]);

  useEffect(() => {
    if (cipherType === "caesar") {
      setProcessedText(caesarEncrypt(plaintext, caesarShift));
    } else if (cipherType === "vigenere") {
      setProcessedText(vigenereEncrypt(plaintext, vigenereKey));
    } else if (cipherType === "hash") {
      setProcessedText(simpleHash(plaintext));
    }
  }, [cipherType, plaintext, caesarShift, vigenereKey]);

  const renderCipherWheel = () => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    return (
      <div className="relative w-64 h-64 mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Outer ring (plaintext) */}
          <circle cx="100" cy="100" r="90" fill="none" stroke="#3b82f6" strokeWidth="2" />
          {alphabet.split('').map((char, i) => {
            const angle = (i * 360 / 26 - 90) * Math.PI / 180;
            const x = 100 + 75 * Math.cos(angle);
            const y = 100 + 75 * Math.sin(angle);
            return (
              <text key={char} x={x} y={y} textAnchor="middle" dominantBaseline="middle" 
                className="fill-blue-600 text-xs font-bold">
                {char}
              </text>
            );
          })}
          
          {/* Inner ring (ciphertext) */}
          <circle cx="100" cy="100" r="60" fill="none" stroke="#ef4444" strokeWidth="2" />
          {alphabet.split('').map((char, i) => {
            const shiftedIndex = (i + caesarShift) % 26;
            const shiftedChar = alphabet[shiftedIndex];
            const angle = (i * 360 / 26 - 90) * Math.PI / 180;
            const x = 100 + 45 * Math.cos(angle);
            const y = 100 + 45 * Math.sin(angle);
            return (
              <text key={`inner-${char}`} x={x} y={y} textAnchor="middle" dominantBaseline="middle" 
                className="fill-red-600 text-xs font-bold">
                {shiftedChar}
              </text>
            );
          })}
          
          {/* Center */}
          <circle cx="100" cy="100" r="25" fill="#f3f4f6" />
          <text x="100" y="100" textAnchor="middle" dominantBaseline="middle" className="fill-gray-700 text-sm font-bold">
            +{caesarShift}
          </text>
        </svg>
      </div>
    );
  };

  const renderTextAnimation = () => {
    const chars = plaintext.split('');
    const processed = cipherType === "caesar" ? caesarEncrypt(plaintext, caesarShift)
      : cipherType === "vigenere" ? vigenereEncrypt(plaintext, vigenereKey)
      : simpleHash(plaintext);
    const processedChars = cipherType === "hash" ? [processed] : processed.split('');

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          {chars.map((char, i) => {
            const isAnimating = i === currentStep - 1;
            const isDone = i < currentStep - 1;
            
            return (
              <motion.div
                key={i}
                className={`w-12 h-14 flex items-center justify-center text-xl font-bold rounded-lg border-2 transition-all
                  ${isAnimating ? 'border-blue-500 bg-blue-100 scale-110' : ''}
                  ${isDone ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}
                animate={isAnimating ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
              >
                {char}
              </motion.div>
            );
          })}
        </div>
        
        <div className="text-2xl text-gray-400">↓</div>
        
        <div className="flex gap-2">
          {cipherType === "hash" ? (
            <motion.div 
              className="px-4 py-3 font-mono text-sm bg-gray-800 text-green-400 rounded-lg"
              animate={currentStep >= getMaxSteps() - 1 ? { opacity: [0, 1] } : { opacity: 0.3 }}
            >
              {processed.slice(0, 16)}...
            </motion.div>
          ) : (
            processedChars.map((char, i) => {
              const isDone = i < currentStep - 1;
              const isCurrent = i === currentStep - 1;
              
              return (
                <motion.div
                  key={i}
                  className={`w-12 h-14 flex items-center justify-center text-xl font-bold rounded-lg border-2
                    ${isCurrent ? 'border-red-500 bg-red-100' : ''}
                    ${isDone ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-100'}`}
                  initial={isCurrent ? { scale: 0, rotate: -180 } : {}}
                  animate={isCurrent ? { scale: 1, rotate: 0 } : {}}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {isDone || isCurrent ? char : '?'}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const stepInfo = getStepInfo(currentStep);
  const maxSteps = getMaxSteps();

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            {cipherType === "hash" ? <Hash className="w-6 h-6 text-purple-600" />
              : cipherType === "rsa" ? <Key className="w-6 h-6 text-purple-600" />
              : <Lock className="w-6 h-6 text-purple-600" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Cipher Visualizer</h2>
            <p className="text-sm text-gray-500">Watch encryption transform data</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {(["caesar", "vigenere", "rsa", "hash"] as CipherType[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                setCipherType(type);
                reset();
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors
                ${cipherType === type ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Plaintext</label>
            <input
              type="text"
              value={plaintext}
              onChange={(e) => {
                setPlaintext(e.target.value.toUpperCase().slice(0, 12));
                reset();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter text..."
            />
          </div>
          
          {cipherType === "caesar" && (
            <div className="w-32">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
              <input
                type="number"
                value={caesarShift}
                onChange={(e) => {
                  setCaesarShift(parseInt(e.target.value) || 0);
                  reset();
                }}
                min="0"
                max="25"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}
          
          {cipherType === "vigenere" && (
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={vigenereKey}
                onChange={(e) => {
                  setVigenereKey(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8));
                  reset();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="KEY"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Visualization */}
      <div className="mb-6 p-6 bg-gray-50 rounded-xl min-h-[300px] flex items-center justify-center">
        {cipherType === "caesar" && currentStep === 0 ? renderCipherWheel() : renderTextAnimation()}
      </div>

      {/* Step Info */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-1">{stepInfo.title}</h3>
        <p className="text-blue-700 text-sm mb-2">{stepInfo.description}</p>
        {stepInfo.latex && (
          <code className="text-xs bg-blue-100 px-2 py-1 rounded text-blue-800 font-mono">
            {stepInfo.latex}
          </code>
        )}
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
        
        <button onClick={reset} className="p-2 hover:bg-gray-100 rounded-lg">
          <RotateCcw className="w-5 h-5 text-gray-600" />
        </button>
        
        <div className="flex items-center gap-2">
          <button onClick={prevStep} disabled={currentStep === 0} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30">
            <SkipBack className="w-5 h-5" />
          </button>
          <span className="text-sm font-medium text-gray-600 min-w-[80px] text-center">
            {currentStep + 1} / {maxSteps}
          </span>
          <button onClick={nextStep} disabled={currentStep >= maxSteps - 1} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-30">
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-500">Speed:</span>
          {speeds.map((s) => (
            <button
              key={s.value}
              onClick={() => setSpeed(s.value)}
              className={`px-2 py-1 text-xs rounded ${speed === s.value ? 'bg-purple-100 text-purple-700' : 'text-gray-500'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / maxSteps) * 100}%` }}
        />
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-100 border-2 border-blue-500 rounded" />
          <span>Current Processing</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-50 border-2 border-green-500 rounded" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 border-2 border-red-500 rounded" />
          <span>Output</span>
        </div>
      </div>
    </div>
  );
}
