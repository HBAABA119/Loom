"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Info, Hash } from "lucide-react";

interface HashStep {
  id: number;
  title: string;
  description: string;
  input: string;
  output: string;
  process: string;
}

export default function HashFunctionVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const message = "Hello World";
  
  const steps: HashStep[] = [
    {
      id: 0,
      title: "Input Message",
      description: "Original message to be hashed",
      input: message,
      output: "",
      process: "Ready to hash"
    },
    {
      id: 1,
      title: "Padding",
      description: "Add padding to make length multiple of 512 bits",
      input: message + "\x80\x00\x00...",
      output: "",
      process: "SHA-256 padding"
    },
    {
      id: 2,
      title: "Message Blocks",
      description: "Split into 512-bit blocks",
      input: "Block 1: 48656c6c6f20576f726c80...",
      output: "",
      process: "Block processing"
    },
    {
      id: 3,
      title: "Compression Function",
      description: "Apply compression function to each block",
      input: "Block 1: 48656c6c6f20576f726c80...",
      output: "Processing...",
      process: "SHA-256 compression"
    },
    {
      id: 4,
      title: "Final Hash",
      description: "256-bit hash output",
      input: message,
      output: "a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e",
      process: "Hash complete"
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
            <h2 className="text-2xl font-bold text-foreground">Hash Function Visualization</h2>
            <p className="text-muted">See how SHA-256 transforms data into fixed-size hashes</p>
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
              className="h-full bg-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Hash Process Visualization */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Hash size={20} className="text-orange-500" />
            <h3 className="text-sm font-semibold text-foreground">SHA-256 Process</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted">Input Data</h4>
              <div className="p-4 bg-accent/30 rounded-lg border border-border">
                <p className="font-mono text-sm break-all">{step.input}</p>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted">Hash Output</h4>
              <div className="p-4 bg-accent/30 rounded-lg border border-border">
                <p className="font-mono text-sm break-all">{step.output || "—"}</p>
              </div>
            </div>
          </div>

          {/* Process Details */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted">Current Process</h4>
            <div className="p-4 bg-accent/30 rounded-lg border border-border">
              <p className="text-sm">{step.process}</p>
              <p className="text-xs text-muted mt-1">{step.description}</p>
            </div>
          </div>
        </div>

        {/* Hash Properties */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
            <h4 className="text-sm font-semibold text-foreground mb-2">Deterministic</h4>
            <p className="text-xs text-muted">Same input always produces same hash</p>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <h4 className="text-sm font-semibold text-foreground mb-2">One-Way</h4>
            <p className="text-xs text-muted">Cannot reverse hash to get original</p>
          </div>
          <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <h4 className="text-sm font-semibold text-foreground mb-2">Fixed Size</h4>
            <p className="text-xs text-muted">Always 256 bits regardless of input size</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
              <h3 className="font-semibold text-foreground mb-2">About Hash Functions</h3>
              <ul className="text-sm text-muted space-y-1">
                <li>• SHA-256 produces 256-bit (32-byte) hash</li>
                <li>• Used for data integrity and password storage</li>
                <li>• Avalanche effect: tiny input changes create completely different hashes</li>
                <li>• Collision resistant: extremely hard to find two inputs with same hash</li>
                <li>• Used in blockchain, digital signatures, and data verification</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
