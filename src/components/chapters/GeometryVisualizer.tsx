"use client";

import { motion } from "framer-motion";
import { useEffect, useCallback } from "react";
import { useTimeline, useCodeHighlight } from "@/lib/engine/store";

interface Point {
  id: string;
  x: number;
  y: number;
  isHull: boolean;
  isActive: boolean;
}

interface GeometryStep {
  step: number;
  action: string;
  points: Point[];
  algorithm: string;
  highlightLines: number[];
  description: string;
}

const geometrySteps: GeometryStep[] = [
  { step: 0, action: "init", points: [
    { id: "p1", x: 20, y: 50, isHull: false, isActive: false },
    { id: "p2", x: 40, y: 80, isHull: false, isActive: false },
    { id: "p3", x: 60, y: 30, isHull: false, isActive: false },
    { id: "p4", x: 80, y: 70, isHull: false, isActive: false },
    { id: "p5", x: 30, y: 20, isHull: false, isActive: false },
    { id: "p6", x: 70, y: 50, isHull: false, isActive: false },
  ], algorithm: "Convex Hull (Graham Scan)", highlightLines: [1, 2], description: "Computational Geometry: Convex Hull - smallest convex polygon containing all points." },
  { step: 1, action: "find-min", points: [
    { id: "p1", x: 20, y: 50, isHull: false, isActive: false },
    { id: "p2", x: 40, y: 80, isHull: false, isActive: false },
    { id: "p3", x: 60, y: 30, isHull: false, isActive: false },
    { id: "p4", x: 80, y: 70, isHull: false, isActive: false },
    { id: "p5", x: 30, y: 20, isHull: true, isActive: true },
    { id: "p6", x: 70, y: 50, isHull: false, isActive: false },
  ], algorithm: "Convex Hull", highlightLines: [3, 4], description: "Find point with minimum y-coordinate (p5 at y=20). This will be our starting point." },
  { step: 2, action: "sort-angle", points: [
    { id: "p1", x: 20, y: 50, isHull: false, isActive: true },
    { id: "p2", x: 40, y: 80, isHull: false, isActive: true },
    { id: "p3", x: 60, y: 30, isHull: false, isActive: true },
    { id: "p4", x: 80, y: 70, isHull: false, isActive: true },
    { id: "p5", x: 30, y: 20, isHull: true, isActive: true },
    { id: "p6", x: 70, y: 50, isHull: false, isActive: true },
  ], algorithm: "Convex Hull", highlightLines: [5, 6], description: "Sort remaining points by polar angle from p5. Order: p5 → p1 → p3 → p6 → p4 → p2" },
  { step: 3, action: "scan", points: [
    { id: "p1", x: 20, y: 50, isHull: true, isActive: false },
    { id: "p2", x: 40, y: 80, isHull: true, isActive: false },
    { id: "p3", x: 60, y: 30, isHull: true, isActive: false },
    { id: "p4", x: 80, y: 70, isHull: true, isActive: false },
    { id: "p5", x: 30, y: 20, isHull: true, isActive: false },
    { id: "p6", x: 70, y: 50, isHull: false, isActive: true },
  ], algorithm: "Convex Hull", highlightLines: [7, 8], description: "Graham Scan: Use stack. Push p5, p1, p3. Check turns - p6 makes right turn, pop p3. Push p6." },
  { step: 4, action: "complete", points: [
    { id: "p1", x: 20, y: 50, isHull: true, isActive: false },
    { id: "p2", x: 40, y: 80, isHull: true, isActive: false },
    { id: "p3", x: 60, y: 30, isHull: true, isActive: false },
    { id: "p4", x: 80, y: 70, isHull: true, isActive: false },
    { id: "p5", x: 30, y: 20, isHull: true, isActive: false },
    { id: "p6", x: 70, y: 50, isHull: false, isActive: false },
  ], algorithm: "Convex Hull", highlightLines: [9, 10], description: "Convex Hull complete! Hull: p5 → p3 → p4 → p2 → p1 → p5. Time: O(n log n). p6 is interior point." },
];

export default function GeometryVisualizer() {
  const { currentStep, totalSteps, isPlaying, togglePlay, setTotalSteps, nextStep, prevStep } = useTimeline();
  const { setActiveLines } = useCodeHighlight();

  useEffect(() => { setTotalSteps(geometrySteps.length); }, [setTotalSteps]);
  useEffect(() => { const step = geometrySteps[currentStep]; if (step) setActiveLines(step.highlightLines); }, [currentStep, setActiveLines]);

  const handlePlay = useCallback(() => togglePlay(), [togglePlay]);
  const handleStep = useCallback((dir: "next" | "prev") => dir === "next" ? nextStep() : prevStep(), [nextStep, prevStep]);
  const step = geometrySteps[currentStep] || geometrySteps[0];

  // Calculate hull polygon points
  const hullPoints = step.points.filter(p => p.isHull).sort((a, b) => {
    // Sort by angle from center for proper polygon drawing
    const centerX = 50, centerY = 50;
    const angleA = Math.atan2(a.y - centerY, a.x - centerX);
    const angleB = Math.atan2(b.y - centerY, b.x - centerX);
    return angleA - angleB;
  });

  const polygonPoints = hullPoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Computational Geometry - {step.algorithm}</h3>
        <div className="flex items-center gap-2">
          <button onClick={handlePlay} className="px-4 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043]">{isPlaying ? "Pause" : "Play"}</button>
          <button onClick={() => handleStep("prev")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Prev</button>
          <button onClick={() => handleStep("next")} className="px-4 py-2 bg-[#21262d] text-white rounded-md hover:bg-[#30363d]">Next</button>
        </div>
      </div>

      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Hull polygon */}
          {hullPoints.length >= 3 && (
            <motion.polygon
              points={polygonPoints}
              fill="rgba(35, 134, 54, 0.2)"
              stroke="#238636"
              strokeWidth={0.5}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          {/* Hull lines */}
          {hullPoints.length >= 2 && hullPoints.map((p, i) => {
            const next = hullPoints[(i + 1) % hullPoints.length];
            return (
              <line key={`hull-${i}`} x1={p.x} y1={p.y} x2={next.x} y2={next.y} stroke="#238636" strokeWidth={0.8} />
            );
          })}

          {/* Points */}
          {step.points.map((p) => (
            <motion.circle
              key={p.id}
              cx={p.x} cy={p.y} r={3}
              animate={{
                fill: p.isHull ? "#238636" : p.isActive ? "#f0883e" : "#8957e5",
                stroke: p.isHull ? "#3fb950" : "#a371f7",
                strokeWidth: p.isHull ? 1.5 : 1
              }}
            />
          ))}
        </svg>

        <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-white">{step.description}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#8b949e]">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>Action: <span className="text-[#58a6ff]">{step.action.toUpperCase()}</span></span>
          </div>
        </motion.div>
      </div>

      <div className="p-4 border-t border-[#30363d] flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#238636] rounded-full" /><span className="text-[#8b949e]">Hull Point</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#8957e5] rounded-full" /><span className="text-[#8b949e]">Interior</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-[#f0883e] rounded-full" /><span className="text-[#8b949e]">Active</span></div>
      </div>
    </div>
  );
}
