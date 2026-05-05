"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Info, Lock, Unlock, Key } from "lucide-react";

interface AsymmetricStep {
  id: number;
  title: string;
  description: string;
  publicKey: string;
  privateKey: string;
  message: string;
  encrypted: string;
  operation: string;
}

export default function AsymmetricEncryptionVisualizer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  const message = "SECRET MESSAGE";
  const publicKey = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...\n-----END PUBLIC KEY-----";
  const privateKey = "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEA...\n-----END PRIVATE KEY-----";

  const steps: AsymmetricStep[] = [
    {
      id: 0,
      title: "Key Generation",
      description: "Generate public and private key pairs",
      publicKey: "Generating...",
      privateKey: "Generating...",
      message: "",
      encrypted: "",
      operation: "RSA key pair generation"
    },
    {
      id: 1,
      title: "Keys Generated",
      description: "Public key for encryption, private key for decryption",
      publicKey: "Public Key Ready",
      privateKey: "Private Key Ready",
      message: message,
      encrypted: "",
      operation: "Key pair complete"
    },
    {
      id: 2,
      title: "Public Key Encryption",
      description: "Encrypt message using recipient's public key",
      publicKey: "Public Key Ready",
      privateKey: "Private Key Ready",
      message: message,
      encrypted: "8F3A1B2C...",
      operation: "RSA encryption with public key"
    },
    {
      id: 3,
      title: "Private Key Decryption",
      description: "Decrypt message using recipient's private key",
      publicKey: "Public Key Ready",
      privateKey: "Private Key Ready",
      message: message,
      encrypted: "8F3A1B2C...",
      operation: "RSA decryption with private key"
    },
    {
      id: 4,
      title: "Message Recovered",
      description: "Original message successfully decrypted",
      publicKey: "Public Key Ready",
      privateKey: "Private Key Ready",
      message: message,
      encrypted: "8F3A1B2C...",
      operation: "Decryption complete"
    }
  ];

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 2500);
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
            <h2 className="text-2xl font-bold text-foreground">Asymmetric Encryption Visualization</h2>
            <p className="text-muted">See how RSA uses public/private key pairs</p>
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
              className="h-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Key Pair Visualization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Public Key */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Unlock size={16} className="text-green-500" />
              <h3 className="text-sm font-semibold text-foreground">Public Key</h3>
            </div>
            <div className="p-4 bg-accent/30 rounded-lg border border-border">
              <p className="font-mono text-xs break-all">{step.publicKey}</p>
            </div>
            <p className="text-xs text-muted">Shared openly - used for encryption</p>
          </div>

          {/* Private Key */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lock size={16} className="text-red-500" />
              <h3 className="text-sm font-semibold text-foreground">Private Key</h3>
            </div>
            <div className="p-4 bg-accent/30 rounded-lg border border-border">
              <p className="font-mono text-xs break-all">{step.privateKey}</p>
            </div>
            <p className="text-xs text-muted">Kept secret - used for decryption</p>
          </div>
        </div>

        {/* Message Flow */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Message Flow</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Original Message */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted">Original Message</h4>
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <p className="font-mono text-sm">{step.message || "—"}</p>
              </div>
            </div>

            {/* Encrypted Message */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted">Encrypted Message</h4>
              <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <p className="font-mono text-sm">{step.encrypted || "—"}</p>
              </div>
            </div>

            {/* Decrypted Message */}
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted">Decrypted Message</h4>
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="font-mono text-sm">{step.id === 4 ? step.message : "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Operation Details */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Current Operation</h3>
          <div className="p-4 bg-accent/30 rounded-lg border border-border">
            <p className="text-sm">{step.operation}</p>
            <p className="text-xs text-muted mt-1">{step.description}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
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
              <h3 className="font-semibold text-foreground mb-2">About Asymmetric Encryption</h3>
              <ul className="text-sm text-muted space-y-1">
                <li>• Uses different keys for encryption and decryption</li>
                <li>• Public key can be shared openly</li>
                <li>• Private key must be kept secret</li>
                <li>• Solves key distribution problem</li>
                <li>• Based on mathematical problems (factoring, discrete logs)</li>
                <li>• Used in TLS, digital signatures, and cryptocurrencies</li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
