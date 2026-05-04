"use client";

import { motion } from "framer-motion";
import { ChevronDown, Clock, Database, Zap } from "lucide-react";
import { useState } from "react";

interface ComplexityData {
  access: string;
  search: string;
  insertion: string;
  deletion: string;
  space: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
}

interface ContentPanelProps {
  title: string;
  overview: string;
  keyConcepts: { name: string; description: string }[];
  complexity: ComplexityData;
  problems: Problem[];
  className?: string;
}

const difficultyColors = {
  easy: "text-green-500",
  medium: "text-yellow-500",
  hard: "text-red-500",
};

export default function ContentPanel({
  title,
  overview,
  keyConcepts,
  complexity,
  problems,
  className = "",
}: ContentPanelProps) {
  const [activeSection, setActiveSection] = useState<string | null>("overview");

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  return (
    <div className={`flex h-full flex-col border-r border-border bg-background ${className}`}>
      {/* Header */}
      <div className="border-b border-border p-4">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-xs text-muted">Chapter 1 • Fundamentals</p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Overview Section */}
        <motion.div className="mb-4">
          <button
            onClick={() => toggleSection("overview")}
            className="flex w-full items-center justify-between rounded border border-border p-3 text-left hover:bg-accent"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Database size={16} />
              Overview
            </span>
            <motion.div
              animate={{ rotate: activeSection === "overview" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: activeSection === "overview" ? "auto" : 0,
              opacity: activeSection === "overview" ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-3 text-sm text-muted leading-relaxed">{overview}</div>
          </motion.div>
        </motion.div>

        {/* Key Concepts Section */}
        <motion.div className="mb-4">
          <button
            onClick={() => toggleSection("concepts")}
            className="flex w-full items-center justify-between rounded border border-border p-3 text-left hover:bg-accent"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Zap size={16} />
              Key Concepts
            </span>
            <motion.div
              animate={{ rotate: activeSection === "concepts" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: activeSection === "concepts" ? "auto" : 0,
              opacity: activeSection === "concepts" ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-3">
              {keyConcepts.map((concept, index) => (
                <div
                  key={index}
                  className="mb-3 border-l-2 border-border pl-3 last:mb-0"
                >
                  <h4 className="text-sm font-medium">{concept.name}</h4>
                  <p className="mt-1 text-xs text-muted">{concept.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Complexity Section */}
        <motion.div className="mb-4">
          <button
            onClick={() => toggleSection("complexity")}
            className="flex w-full items-center justify-between rounded border border-border p-3 text-left hover:bg-accent"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Clock size={16} />
              Complexity Analysis
            </span>
            <motion.div
              animate={{ rotate: activeSection === "complexity" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: activeSection === "complexity" ? "auto" : 0,
              opacity: activeSection === "complexity" ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-2 p-3">
              {Object.entries(complexity).map(([operation, value]) => (
                <div
                  key={operation}
                  className="rounded border border-border bg-accent/30 p-2"
                >
                  <span className="text-xs text-muted capitalize">{operation}</span>
                  <p className="text-sm font-mono">{value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Problems Section */}
        <motion.div>
          <button
            onClick={() => toggleSection("problems")}
            className="flex w-full items-center justify-between rounded border border-border p-3 text-left hover:bg-accent"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <Zap size={16} />
              Practice Problems ({problems.length})
            </span>
            <motion.div
              animate={{ rotate: activeSection === "problems" ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} />
            </motion.div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: activeSection === "problems" ? "auto" : 0,
              opacity: activeSection === "problems" ? 1 : 0,
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="p-3">
              {problems.map((problem, index) => (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  className="mb-2 flex items-center justify-between rounded border border-border p-2 hover:bg-accent/50 cursor-pointer"
                >
                  <span className="text-sm">{problem.title}</span>
                  <span className={`text-xs ${difficultyColors[problem.difficulty]}`}>
                    {problem.difficulty}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
