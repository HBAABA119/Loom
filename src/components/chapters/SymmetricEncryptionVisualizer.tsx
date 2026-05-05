"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Info } from "lucide-react";

interface SymmetricEncryptionStep {
  id: number;
  title: string;
  description: string;
  input: string;
  output: string;
  key: string;
  operation: string;
}

export default function SymmetricEncryptionVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const plaintext = "HELLO WORLD";
  const key = "SECRETKEY123";

  const steps: SymmetricEncryptionStep[] = [
    {
      id: 0,
      title: "Input Plaintext",
      description: "Original message to be encrypted",
      input: plaintext,
      output: "",
      key: "",
      operation: "Ready to encrypt"
    },
    {
      id: 1,
      title: "Apply Secret Key",
      description: "Using symmetric key for encryption",
      input: plaintext,
      output: "XKJZC QZJJP",
      key: key,
      operation: "AES-256 encryption"
    },
    {
      id: 2,
      title: "Block Processing",
      description: "Processing in 128-bit blocks",
      input: "HELLO WORLD",
      output: "XKJZC QZJJP",
      key: key,
      operation: "Block cipher mode: CBC"
    },
    {
      id: 3,
      title: "Final Ciphertext",
      description: "Encrypted output ready for transmission",
      input: plaintext,
      output: "XKJZC QZJJP",
      key: key,
      operation: "Encryption complete"
    }
  ];

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 2000);
      return () => clearTimeout(timer);
    } else if (currentStep === steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps.length]);

  const step = steps[currentStep];

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="w-full h-full bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Symmetric Encryption Visualization</h2>
            <p className="text-muted">See how AES encrypts data using a secret key</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2 rounded-lg border border-border hover:bg-accent transition-colors"
            >
              <Info size={16} />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{step.title}</span>
          </div>
          <div className="h-2 bg-accent rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Main Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Input */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Input</h3>
            <div className="p-4 bg-accent/30 rounded-lg border border-border">
              <p className="font-mono text-sm">{step.input || "—"}</p>
            </div>
          </div>

          {/* Key */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Secret Key</h3>
            <div className="p-4 bg-accent/30 rounded-lg border border-border">
              <p className="font-mono text-sm">{step.key || "—"}</p>
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Output</h3>
            <div className="p-4 bg-accent/30 rounded-lg border border-border">
              <p className="font-mono text-sm">{step.output || "—"}</p>
            </div>
          </div>
        </div>

        {/* Operation Details */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Operation</h3>
          <div className="p-4 bg-accent/30 rounded-lg border border-border">
            <p className="text-sm">{step.operation}</p>
            <p className="text-xs text-muted mt-1">{step.description}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? "Pause" : "Play"}
          </button>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>

        {/* Details Panel */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-border rounded-lg p-4 bg-accent/30"
            >
              <h3 className="font-semibold text-foreground mb-2">About Symmetric Encryption</h3>
              <ul className="text-sm text-muted space-y-1">
                <li>• Same key encrypts and decrypts data</li>
                <li>• AES-256 uses 256-bit keys for maximum security</li>
                <li>• Processes data in 128-bit blocks</li>
                <li>• Fast and efficient for large amounts of data</li>
                <li>• Key distribution is the main challenge</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
