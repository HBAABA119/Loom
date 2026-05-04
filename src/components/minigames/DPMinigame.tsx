"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

export default function DPMinigame() {
  const [n, setN] = useState(7);
  const [table, setTable] = useState<number[]>([0, 1]);
  const [current, setCurrent] = useState(2);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("Click 'Compute' to fill DP table");

  const compute = useCallback(() => {
    if (current > n) {
      setFeedback(`🎉 Fib(${n}) = ${table[n]} computed!`);
      return;
    }
    const nextVal = table[current - 1] + table[current - 2];
    setTable([...table, nextVal]);
    setCurrent(current + 1);
    setScore(s => s + 10);
    setFeedback(`fib[${current}] = fib[${current - 1}] + fib[${current - 2}] = ${table[current - 1]} + ${table[current - 2]} = ${nextVal}`);
  }, [table, current, n]);

  const reset = () => {
    setTable([0, 1]);
    setCurrent(2);
    setScore(0);
    setFeedback("Click 'Compute' to fill DP table");
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">DP - Fibonacci Minigame</h3>
        <span className="text-[#8b949e]">Score: <span className="text-[#58a6ff] font-bold">{score}</span></span>
      </div>
      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-6">
        <div className="text-[#f0883e] font-mono text-2xl font-bold">fib({n})</div>
        <div className="flex flex-col gap-2">
          <span className="text-[#8b949e] text-sm">DP Table:</span>
          <div className="flex gap-2">
            {table.map((val, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                <div className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 font-mono font-bold ${i === table.length - 1 ? "bg-[#238636] border-[#3fb950] text-white" : "bg-[#21262d] border-[#30363d] text-[#8b949e]"}`}>
                  {val}
                </div>
                <span className="text-xs text-[#8b949e] mt-1">{i}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <code className="text-[#58a6ff] font-mono">dp[i] = dp[i-1] + dp[i-2]</code>
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
          <p className="text-[#3fb950]">{feedback}</p>
        </motion.div>
      </div>
      <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
        <span className="text-[#8b949e] text-sm">Build bottom-up DP table</span>
        <div className="flex items-center gap-2">
          {current <= n + 1 ? (
            <button onClick={compute} className="px-6 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] font-semibold">Compute</button>
          ) : (
            <button onClick={reset} className="px-6 py-2 bg-[#8957e5] text-white rounded-md hover:bg-[#a371f7] font-semibold">Reset</button>
          )}
        </div>
      </div>
    </div>
  );
}
