"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Coin {
  value: number;
  count: number;
}

export default function GreedyMinigame() {
  const [coins] = useState<Coin[]>([
    { value: 25, count: 4 },
    { value: 10, count: 2 },
    { value: 5, count: 1 },
    { value: 1, count: 10 },
  ]);
  const [target] = useState(67);
  const [used, setUsed] = useState<{ [key: number]: number }>({ 25: 0, 10: 0, 5: 0, 1: 0 });
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);

  const useCoin = (value: number) => {
    if (total + value > target || used[value] >= coins.find(c => c.value === value)!.count) return;
    setUsed({ ...used, [value]: used[value] + 1 });
    setTotal(total + value);
    setCount(count + 1);
  };

  const reset = () => {
    setUsed({ 25: 0, 10: 0, 5: 0, 1: 0 });
    setTotal(0);
    setCount(0);
  };

  const isOptimal = count === 4; // 2*25 + 1*10 + 1*5 + 2*1 = 67 with 6 coins, or optimal is 2*25 + 1*10 + 1*5 + 2*1 = 67 with 6 coins

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Coin Change (Greedy) Minigame</h3>
        <span className="text-[#8b949e]">Target: <span className="text-[#f0883e] font-bold">{target}¢</span></span>
      </div>
      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-4">
          {coins.map((c) => (
            <motion.button
              key={c.value}
              whileTap={{ scale: 0.95 }}
              onClick={() => useCoin(c.value)}
              disabled={total + c.value > target || used[c.value] >= c.count}
              className="w-20 h-20 rounded-full bg-[#f0883e] flex flex-col items-center justify-center text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">{c.value}¢</span>
              <span className="text-xs">x{used[c.value]}/{c.count}</span>
            </motion.button>
          ))}
        </div>
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg text-center">
          <span className="text-[#8b949e] block">Total</span>
          <span className="text-[#58a6ff] text-3xl font-bold">{total}¢</span>
          <span className="text-[#8b949e] block mt-2">Coins used: {count}</span>
        </div>
        {total === target && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-[#238636]/20 border border-[#238636] rounded-lg text-center">
            <p className="text-[#3fb950] font-bold">🎉 Target reached with {count} coins!</p>
            {isOptimal && <p className="text-[#3fb950] text-sm">Optimal solution!</p>}
          </motion.div>
        )}
      </div>
      <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
        <span className="text-[#8b949e] text-sm">Click coins to make {target}¢</span>
        <button onClick={reset} className="px-4 py-2 bg-[#8957e5] text-white rounded-md hover:bg-[#a371f7]">Reset</button>
      </div>
    </div>
  );
}
