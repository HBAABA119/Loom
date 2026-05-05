"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, RotateCcw, Type, Variable, FunctionSquare,
  CheckCircle, AlertCircle, ArrowRight, Sigma, Hash
} from "lucide-react";

type TypeExpr = { kind: "var"; name: string } | { kind: "int" } | { kind: "bool" } | { kind: "fun"; arg: TypeExpr; ret: TypeExpr } | { kind: "list"; elem: TypeExpr };

interface Expression {
  id: string;
  text: string;
  expectedType?: TypeExpr;
}

const sampleExpressions: Expression[] = [
  { id: "1", text: "5", expectedType: { kind: "int" } },
  { id: "2", text: "true", expectedType: { kind: "bool" } },
  { id: "3", text: "x", expectedType: { kind: "var", name: "α" } },
  { id: "4", text: "\\x -> x + 1", expectedType: { kind: "fun", arg: { kind: "int" }, ret: { kind: "int" } } },
  { id: "5", text: "[1, 2, 3]", expectedType: { kind: "list", elem: { kind: "int" } } },
];

function typeToString(t: TypeExpr): string {
  switch (t.kind) {
    case "var": return t.name;
    case "int": return "Int";
    case "bool": return "Bool";
    case "fun": return `(${typeToString(t.arg)} -> ${typeToString(t.ret)})`;
    case "list": return `[${typeToString(t.elem)}]`;
  }
}

export default function TypeVisualizerEnhanced() {
  const [selectedExpr, setSelectedExpr] = useState(0);
  const [inferredType, setInferredType] = useState<TypeExpr | null>(null);
  const [isInferring, setIsInferring] = useState(false);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(0);

  const reset = () => {
    setInferredType(null);
    setConstraints([]);
    setCurrentStep(0);
    setIsInferring(false);
  };

  const inferStep = useCallback(() => {
    const expr = sampleExpressions[selectedExpr];
    setIsInferring(true);

    setTimeout(() => {
      setCurrentStep(prev => {
        const newStep = prev + 1;
        
        if (newStep === 1) {
          setConstraints(["Analyzing expression structure..."]);
        } else if (newStep === 2) {
          if (expr.expectedType) {
            setConstraints(prev => [...prev, `Constraint: expression has type ${typeToString(expr.expectedType!)}`]);
          }
        } else if (newStep === 3) {
          setInferredType(expr.expectedType || null);
          setConstraints(prev => [...prev, "Unification complete ✓"]);
          setIsInferring(false);
        }
        
        return newStep;
      });
    }, 800);
  }, [selectedExpr]);

  const startInference = () => {
    reset();
    inferStep();
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#a371f7]/20 rounded-lg">
            <Type size={20} className="text-[#a371f7]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Type Inference Engine</h3>
            <p className="text-[#8b949e] text-sm">Hindley-Milner style type inference</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-[#30363d]">
          <div className="p-4 border-b border-[#30363d]">
            <label className="text-[#8b949e] text-sm mb-2 block">Select Expression</label>
            <select
              value={selectedExpr}
              onChange={(e) => { setSelectedExpr(Number(e.target.value)); reset(); }}
              className="w-full px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-white text-sm"
            >
              {sampleExpressions.map((expr, i) => (
                <option key={expr.id} value={i}>{expr.text}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 p-4">
            <div className="text-[#8b949e] text-xs mb-2 flex items-center gap-1">
              <FunctionSquare size={12} />
              Expression Tree
            </div>
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#30363d]">
              <div className="flex items-center justify-center">
                <motion.div
                  className="px-6 py-3 bg-[#21262d] border border-[#a371f7] rounded-lg"
                  animate={isInferring ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ repeat: isInferring ? Infinity : 0, duration: 1 }}
                >
                  <span className="text-white font-mono text-lg">{sampleExpressions[selectedExpr].text}</span>
                </motion.div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={startInference}
                disabled={isInferring}
                className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
              >
                <Play size={16} />
                Infer Type
              </button>
              <button
                onClick={reset}
                className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="w-1/2 flex flex-col bg-[#0d1117]">
          <div className="flex-1 p-4 border-b border-[#30363d]">
            <div className="flex items-center gap-2 mb-3">
              <Sigma size={16} className="text-[#79c0ff]" />
              <span className="text-white font-medium">Inference Steps</span>
            </div>
            <div className="space-y-2">
              <AnimatePresence>
                {constraints.map((constraint, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-3 py-2 bg-[#21262d] rounded-lg"
                  >
                    <ArrowRight size={14} className="text-[#8b949e]" />
                    <span className="text-[#c9d1d9] text-sm font-mono">{constraint}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="h-1/2 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Variable size={16} className="text-[#3fb950]" />
              <span className="text-white font-medium">Inferred Type</span>
            </div>
            <div className="bg-[#161b22] rounded-lg p-4 border border-[#30363d] h-32 flex items-center justify-center">
              {inferredType ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle size={24} className="text-[#3fb950]" />
                  <span className="text-2xl font-mono text-[#a371f7]">{typeToString(inferredType)}</span>
                </motion.div>
              ) : (
                <span className="text-[#6e7681]">Click &quot;Infer Type&quot; to begin analysis</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
