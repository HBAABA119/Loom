"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

export default function SearchingMinigame() {
  const [array] = useState([2, 5, 8, 12, 16, 23, 38, 56, 72, 91]);
  const [target] = useState(23);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(9);
  const [mid, setMid] = useState<number | null>(null);
  const [comparisons, setComparisons] = useState(0);
  const [found, setFound] = useState(false);
  const [feedback, setFeedback] = useState("");

  const binaryStep = useCallback(() => {
    if (found) return;
    const m = Math.floor((low + high) / 2);
    setMid(m);
    setComparisons(c => c + 1);
    if (array[m] === target) {
      setFound(true);
      setFeedback(`🎉 Found ${target} at index ${m} in ${comparisons + 1} comparisons!`);
    } else if (array[m] < target) {
      setLow(m + 1);
      setFeedback(`${array[m]} < ${target}, search right half (indices ${m + 1}-${high})`);
    } else {
      setHigh(m - 1);
      setFeedback(`${array[m]} > ${target}, search left half (indices ${low}-${m - 1})`);
    }
  }, [low, high, array, target, found, comparisons]);

  const reset = () => {
    setLow(0);
    setHigh(9);
    setMid(null);
    setComparisons(0);
    setFound(false);
    setFeedback("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Binary Search Minigame</h3>
        <span className="text-[#8b949e]">Target: <span className="text-[#f0883e] font-bold">{target}</span></span>
      </div>
      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-6">
        <div className="flex items-end gap-1">
          {array.map((val, i) => (
            <motion.div
              key={i}
              animate={{
                backgroundColor: i === mid ? "#58a6ff" : i >= low && i <= high ? "#8957e5" : "#21262d",
                scale: i === mid ? 1.1 : 1
              }}
              className="w-12 h-16 flex items-center justify-center rounded-lg border-2 text-white font-mono font-bold"
              style={{ borderColor: i === mid ? "#58a6ff" : i >= low && i <= high ? "#a371f7" : "#30363d" }}
            >
              {val}
              <span className="absolute -bottom-5 text-xs text-[#8b949e]">{i}</span>
            </motion.div>
          ))}
        </div>
        {feedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <p className={found ? "text-[#3fb950]" : "text-[#58a6ff]"}>{feedback}</p>
          </motion.div>
        )}
      </div>
      <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
        <span className="text-[#8b949e] text-sm">Comparisons: {comparisons}</span>
        <div className="flex items-center gap-2">
          {!found ? (
            <button onClick={binaryStep} className="px-6 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] font-semibold">Step</button>
          ) : (
            <button onClick={reset} className="px-6 py-2 bg-[#8957e5] text-white rounded-md hover:bg-[#a371f7] font-semibold">Play Again</button>
          )}
        </div>
      </div>
    </div>
  );
}
