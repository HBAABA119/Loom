"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Unlock, Key, CheckCircle, XCircle, RefreshCw, Trophy, Shield } from "lucide-react";

interface Challenge {
  id: number;
  scenario: string;
  publicKey: string;
  privateKey: string;
  message: string;
  correctAction: "encrypt" | "decrypt" | "sign";
  explanation: string;
}

export default function AsymmetricEncryptionMinigame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAction, setSelectedAction] = useState<"encrypt" | "decrypt" | "sign" | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const challenges: Challenge[] = [
    {
      id: 0,
      scenario: "Alice wants to send a secret message to Bob",
      publicKey: "Bob's Public Key",
      privateKey: "Bob's Private Key",
      message: "Secret Message",
      correctAction: "encrypt",
      explanation: "Use Bob's public key to encrypt so only Bob can decrypt with his private key"
    },
    {
      id: 1,
      scenario: "Bob received an encrypted message from Alice",
      publicKey: "Bob's Public Key",
      privateKey: "Bob's Private Key",
      message: "Encrypted Message",
      correctAction: "decrypt",
      explanation: "Use your private key to decrypt messages encrypted with your public key"
    },
    {
      id: 2,
      scenario: "Alice wants to prove she sent a message",
      publicKey: "Alice's Public Key",
      privateKey: "Alice's Private Key",
      message: "Important Document",
      correctAction: "sign",
      explanation: "Use your private key to create a digital signature that anyone can verify"
    },
    {
      id: 3,
      scenario: "Charlie wants to verify Alice's signature",
      publicKey: "Alice's Public Key",
      privateKey: "Alice's Private Key",
      message: "Signed Document",
      correctAction: "decrypt",
      explanation: "Use Alice's public key to verify her signature (decrypt the hash)"
    },
    {
      id: 4,
      scenario: "Eve intercepts an encrypted message",
      publicKey: "Bob's Public Key",
      privateKey: "Bob's Private Key",
      message: "Intercepted Message",
      correctAction: "encrypt",
      explanation: "Eve cannot decrypt without Bob's private key, but can encrypt with his public key"
    }
  ];

  const challenge = challenges[currentChallenge];

  const checkAnswer = (action: "encrypt" | "decrypt" | "sign") => {
    setSelectedAction(action);
    setAttempts(attempts + 1);
    
    if (action === challenge.correctAction) {
      setFeedback("correct");
      const points = Math.max(100 - (attempts * 15), 10);
      setScore(score + points);
      
      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(currentChallenge + 1);
          setSelectedAction(null);
          setAttempts(0);
          setFeedback(null);
        } else {
          setGameComplete(true);
        }
      }, 2000);
    } else {
      setFeedback("incorrect");
      setTimeout(() => {
        setSelectedAction(null);
        setFeedback(null);
      }, 2000);
    }
  };

  const resetGame = () => {
    setCurrentChallenge(0);
    setSelectedAction(null);
    setScore(0);
    setAttempts(0);
    setGameComplete(false);
    setFeedback(null);
  };

  if (gameComplete) {
    return (
      <div className="w-full h-full bg-background p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-md"
        >
          <Trophy size={64} className="mx-auto text-yellow-500" />
          <h2 className="text-2xl font-bold text-foreground">Master of Asymmetric Crypto!</h2>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground">{score} points</p>
            <p className="text-muted">You understand public key cryptography!</p>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <RefreshCw size={16} />
            Play Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Asymmetric Encryption Challenge</h2>
          <p className="text-muted">Choose the correct operation for each scenario</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-muted">Challenge {currentChallenge + 1}/{challenges.length}</span>
            <span className="text-muted">Score: {score}</span>
          </div>
        </div>

        {/* Scenario */}
        <div className="p-6 bg-accent/30 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Scenario</h3>
          <p className="text-base text-muted mb-4">{challenge.scenario}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
              <Unlock size={20} className="text-blue-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Public Key</p>
                <p className="text-xs text-muted">{challenge.publicKey}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <Lock size={20} className="text-red-500" />
              <div>
                <p className="text-sm font-medium text-foreground">Private Key</p>
                <p className="text-xs text-muted">{challenge.privateKey}</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
            <p className="text-sm font-medium text-foreground mb-1">Message</p>
            <p className="text-xs text-muted">{challenge.message}</p>
          </div>
        </div>

        {/* Action Choices */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">What should they do?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => checkAnswer("encrypt")}
              disabled={selectedAction !== null}
              className={`p-4 rounded-lg border transition-all ${
                selectedAction === "encrypt"
                  ? feedback === "correct"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-red-500/20 border-red-500"
                  : "bg-accent/30 border-border hover:bg-accent/50"
              } disabled:cursor-not-allowed`}
            >
              <div className="space-y-2">
                <Lock size={24} className="mx-auto text-blue-500" />
                <p className="font-semibold text-foreground">Encrypt</p>
                <p className="text-xs text-muted">Lock the message with a key</p>
              </div>
            </button>

            <button
              onClick={() => checkAnswer("decrypt")}
              disabled={selectedAction !== null}
              className={`p-4 rounded-lg border transition-all ${
                selectedAction === "decrypt"
                  ? feedback === "correct"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-red-500/20 border-red-500"
                  : "bg-accent/30 border-border hover:bg-accent/50"
              } disabled:cursor-not-allowed`}
            >
              <div className="space-y-2">
                <Unlock size={24} className="mx-auto text-green-500" />
                <p className="font-semibold text-foreground">Decrypt</p>
                <p className="text-xs text-muted">Unlock the message with a key</p>
              </div>
            </button>

            <button
              onClick={() => checkAnswer("sign")}
              disabled={selectedAction !== null}
              className={`p-4 rounded-lg border transition-all ${
                selectedAction === "sign"
                  ? feedback === "correct"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-red-500/20 border-red-500"
                  : "bg-accent/30 border-border hover:bg-accent/50"
              } disabled:cursor-not-allowed`}
            >
              <div className="space-y-2">
                <Shield size={24} className="mx-auto text-purple-500" />
                <p className="font-semibold text-foreground">Sign</p>
                <p className="text-xs text-muted">Create a digital signature</p>
              </div>
            </button>
          </div>
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-lg ${
                feedback === "correct"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {feedback === "correct" ? (
                  <>
                    <CheckCircle size={20} />
                    <span className="font-semibold">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle size={20} />
                    <span className="font-semibold">Incorrect</span>
                  </>
                )}
              </div>
              <p className="text-sm">{challenge.explanation}</p>
              {feedback === "correct" && (
                <p className="text-sm mt-2">+{Math.max(100 - (attempts - 1) * 15, 10)} points</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="p-4 bg-accent/30 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">How to Play</h3>
          <ul className="text-xs text-muted space-y-1">
            <li>• <strong>Encrypt:</strong> Use recipient's public key to send secret messages</li>
            <li>• <strong>Decrypt:</strong> Use your private key to read messages sent to you</li>
            <li>• <strong>Sign:</strong> Use your private key to prove you sent something</li>
            <li>• Remember: Public keys are shared, private keys are secret!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
