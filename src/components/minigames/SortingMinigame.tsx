"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

export default function SortingMinigame() {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90, 5]);
  const [sortedIndices, setSortedIndices] = useState<number[]>([]);
  const [comparing, setComparing] = useState<number[]>([]);
  const [swaps, setSwaps] = useState(0);
  const [pass, setPass] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const bubbleSortStep = useCallback(() => {
    if (pass >= array.length - 1) return;
    setIsRunning(true);
    let swapped = false;
    const newArray = [...array];

    for (let i = 0; i < array.length - 1 - pass; i++) {
      setComparing([i, i + 1]);
      if (newArray[i] > newArray[i + 1]) {
        [newArray[i], newArray[i + 1]] = [newArray[i + 1], newArray[i]];
        swapped = true;
        setSwaps(s => s + 1);
      }
    }
    setArray(newArray);
    setSortedIndices(prev => [...prev, array.length - 1 - pass]);
    setPass(p => p + 1);
    if (!swapped || pass >= array.length - 2) {
      setSortedIndices(Array.from({ length: array.length }, (_, i) => i));
    }
  }, [array, pass]);

  const reset = () => {
    setArray([64, 34, 25, 12, 22, 11, 90, 5]);
    setSortedIndices([]);
    setComparing([]);
    setSwaps(0);
    setPass(0);
    setIsRunning(false);
  };

  const maxVal = Math.max(...array);

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Bubble Sort Minigame</h3>
        <span className="text-[#8b949e]">Swaps: <span className="text-[#f0883e]">{swaps}</span></span>
      </div>
      <div className="flex-1 p-4 relative overflow-hidden flex items-end justify-center gap-2">
        {array.map((val, i) => (
          <motion.div
            key={i}
            animate={{
              height: `${(val / maxVal) * 200}px`,
              backgroundColor: sortedIndices.includes(i) ? "#238636" : comparing.includes(i) ? "#f0883e" : "#8957e5"
            }}
            className="w-12 rounded-t-lg flex items-end justify-center pb-2 text-white font-mono font-bold border-2"
            style={{ borderColor: sortedIndices.includes(i) ? "#3fb950" : comparing.includes(i) ? "#f0883e" : "#30363d" }}
          >
            {val}
          </motion.div>
        ))}
        {sortedIndices.length === array.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-4 left-4 right-4 p-4 bg-[#238636]/20 border border-[#238636] rounded-lg text-center">
            <p className="text-[#3fb950] font-bold">🎉 Array sorted in {swaps} swaps!</p>
          </motion.div>
        )}
      </div>
      <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
        <span className="text-[#8b949e] text-sm">Pass {pass} of {array.length - 1}</span>
        <div className="flex items-center gap-2">
          {sortedIndices.length < array.length ? (
            <button onClick={bubbleSortStep} className="px-6 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] font-semibold">Sort Pass</button>
          ) : (
            <button onClick={reset} className="px-6 py-2 bg-[#8957e5] text-white rounded-md hover:bg-[#a371f7] font-semibold">Reset</button>
          )}
        </div>
      </div>
    </div>
  );
}
