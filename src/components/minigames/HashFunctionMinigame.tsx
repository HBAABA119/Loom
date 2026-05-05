"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hash, CheckCircle, XCircle, RefreshCw, Trophy, AlertTriangle } from "lucide-react";

interface Challenge {
  id: number;
  property: string;
  description: string;
  examples: {
    good: string[];
    bad: string[];
  };
  question: string;
  correctAnswer: boolean;
  explanation: string;
}

export default function HashFunctionMinigame() {
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);

  const challenges: Challenge[] = [
    {
      id: 0,
      property: "Deterministic",
      description: "Same input always produces same output",
      examples: {
        good: ["SHA-256('hello') = same every time"],
        bad: ["Random salt changes hash each time"]
      },
      question: "If you hash 'Hello' twice with SHA-256, should you get the same result?",
      correctAnswer: true,
      explanation: "Hash functions are deterministic - same input always produces same hash"
    },
    {
      id: 1,
      property: "One-Way Function",
      description: "Cannot reverse hash to get original input",
      examples: {
        good: ["Cannot recover password from hash"],
        bad: ["Encryption can be decrypted with key"]
      },
      question: "Can you recover the original message from its SHA-256 hash?",
      correctAnswer: false,
      explanation: "Hash functions are one-way - you cannot reverse them to get the original input"
    },
    {
      id: 2,
      property: "Fixed Output Size",
      description: "Always produces hash of same length",
      examples: {
        good: ["SHA-256 always 256 bits regardless of input"],
        bad: ["Variable length encoding changes size"]
      },
      question: "Does hashing a 1MB file with SHA-256 produce a larger hash than hashing 'hello'?",
      correctAnswer: false,
      explanation: "Hash functions produce fixed-size output - SHA-256 is always 256 bits"
    },
    {
      id: 3,
      property: "Avalanche Effect",
      description: "Small input change creates completely different hash",
      examples: {
        good: ["'hello' vs 'hello1' produce unrelated hashes"],
        bad: ["Similar inputs produce similar outputs"]
      },
      question: "If you change one character in a message, should the hash change completely?",
      correctAnswer: true,
      explanation: "The avalanche effect ensures tiny input changes create completely different hashes"
    },
    {
      id: 4,
      property: "Collision Resistance",
      description: "Extremely hard to find two inputs with same hash",
      examples: {
        good: ["Practically impossible to find SHA-256 collisions"],
        bad: ["Simple checksum functions have many collisions"]
      },
      question: "Is it easy to find two different messages that produce the same SHA-256 hash?",
      correctAnswer: false,
      explanation: "Good hash functions are collision resistant - finding collisions is computationally infeasible"
    }
  ];

  const challenge = challenges[currentChallenge];

  const checkAnswer = (answer: boolean) => {
    setSelectedAnswer(answer);
    
    if (answer === challenge.correctAnswer) {
      setFeedback("correct");
      setScore(score + 100);
      
      setTimeout(() => {
        if (currentChallenge < challenges.length - 1) {
          setCurrentChallenge(currentChallenge + 1);
          setSelectedAnswer(null);
          setFeedback(null);
        } else {
          setGameComplete(true);
        }
      }, 2000);
    } else {
      setFeedback("incorrect");
      setTimeout(() => {
        setSelectedAnswer(null);
        setFeedback(null);
      }, 2000);
    }
  };

  const resetGame = () => {
    setCurrentChallenge(0);
    setSelectedAnswer(null);
    setScore(0);
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
          <Trophy size={64} className="mx-auto text-orange-500" />
          <h2 className="text-2xl font-bold text-foreground">Hash Function Expert!</h2>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-foreground">{score} points</p>
            <p className="text-muted">You understand hash function properties!</p>
          </div>
          <button
            onClick={resetGame}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
          <div className="flex items-center justify-center gap-2">
            <Hash size={24} className="text-orange-500" />
            <h2 className="text-2xl font-bold text-foreground">Hash Function Properties</h2>
          </div>
          <p className="text-muted">Test your understanding of cryptographic hash functions</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-muted">Challenge {currentChallenge + 1}/{challenges.length}</span>
            <span className="text-muted">Score: {score}</span>
          </div>
        </div>

        {/* Property Description */}
        <div className="p-6 bg-accent/30 rounded-lg border border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-orange-500" />
            <h3 className="text-lg font-semibold text-foreground">{challenge.property}</h3>
          </div>
          <p className="text-muted mb-4">{challenge.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-sm font-medium text-green-400 mb-1">Good Examples</p>
              <ul className="text-xs text-muted space-y-1">
                {challenge.examples.good.map((example, i) => (
                  <li key={i}>• {example}</li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="text-sm font-medium text-red-400 mb-1">Bad Examples</p>
              <ul className="text-xs text-muted space-y-1">
                {challenge.examples.bad.map((example, i) => (
                  <li key={i}>• {example}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="p-6 bg-accent/30 rounded-lg border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Question</h3>
          <p className="text-base text-muted mb-6">{challenge.question}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => checkAnswer(true)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-lg border transition-all ${
                selectedAnswer === true
                  ? feedback === "correct"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-red-500/20 border-red-500"
                  : "bg-accent/50 border-border hover:bg-accent/70"
              } disabled:cursor-not-allowed`}
            >
              <div className="space-y-2">
                <CheckCircle size={24} className="mx-auto text-green-500" />
                <p className="font-semibold text-foreground">Yes</p>
              </div>
            </button>

            <button
              onClick={() => checkAnswer(false)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-lg border transition-all ${
                selectedAnswer === false
                  ? feedback === "correct"
                    ? "bg-green-500/20 border-green-500"
                    : "bg-red-500/20 border-red-500"
                  : "bg-accent/50 border-border hover:bg-accent/70"
              } disabled:cursor-not-allowed`}
            >
              <div className="space-y-2">
                <XCircle size={24} className="mx-auto text-red-500" />
                <p className="font-semibold text-foreground">No</p>
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
                <p className="text-sm mt-2">+100 points</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Instructions */}
        <div className="p-4 bg-accent/30 rounded-lg border border-border">
          <h3 className="text-sm font-semibold text-foreground mb-2">Hash Function Properties</h3>
          <ul className="text-xs text-muted space-y-1">
            <li>• <strong>Deterministic:</strong> Same input = same output</li>
            <li>• <strong>One-way:</strong> Cannot reverse to get input</li>
            <li>• <strong>Fixed size:</strong> Always same length output</li>
            <li>• <strong>Avalanche:</strong> Small change = big difference</li>
            <li>• <strong>Collision resistant:</strong> Hard to find collisions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
