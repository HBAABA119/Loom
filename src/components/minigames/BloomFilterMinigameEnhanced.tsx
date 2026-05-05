"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Plus, RotateCcw } from "lucide-react";

export default function BloomFilterMinigameEnhanced() {
  const [size] = useState(10);
  const [filter, setFilter] = useState<boolean[]>(Array(10).fill(false));
  const [input, setInput] = useState("");
  const [hashResults, setHashResults] = useState<number[]>([]);
  const [addedItems, setAddedItems] = useState<string[]>([]);

  const hash1 = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash + str.charCodeAt(i)) % size;
    }
    return hash;
  };

  const hash2 = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % size;
    }
    return hash;
  };

  const add = () => {
    if (!input) return;
    const h1 = hash1(input);
    const h2 = hash2(input);
    const newFilter = [...filter];
    newFilter[h1] = true;
    newFilter[h2] = true;
    setFilter(newFilter);
    setHashResults([h1, h2]);
    setAddedItems([...addedItems, input]);
    setInput("");
  };

  const check = () => {
    if (!input) return;
    const h1 = hash1(input);
    const h2 = hash2(input);
    const exists = filter[h1] && filter[h2];
    setHashResults([h1, h2]);
    return exists;
  };

  const reset = () => {
    setFilter(Array(10).fill(false));
    setHashResults([]);
    setAddedItems([]);
    setInput("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <Database size={24} className="text-[#f0883e]" />
          Bloom Filter
        </h2>
        <div className="flex gap-2">
          <button onClick={add} className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg">
            <Plus size={16} />
            Add
          </button>
          <button onClick={reset} className="flex items-center gap-2 px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg">
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Bloom Filter (10 bits)</h3>
          <div className="flex gap-2">
            {filter.map((bit, i) => (
              <motion.div
                key={i}
                animate={{
                  backgroundColor: bit ? "#238636" : "#21262d",
                  scale: hashResults.includes(i) ? 1.2 : 1,
                }}
                className="flex-1 p-4 rounded-lg text-white font-bold text-center"
              >
                {i}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-48 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Add Item</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text"
              className="w-full px-3 py-2 bg-[#21262d] text-white rounded-lg"
            />
            {hashResults.length > 0 && (
              <div className="p-2 bg-[#21262d] rounded text-sm">
                <div className="text-[#8b949e]">Hash indices:</div>
                <div className="text-[#f0883e]">{hashResults.join(", ")}</div>
              </div>
            )}
            <div className="p-2 bg-[#21262d] rounded text-sm">
              <div className="text-[#8b949e]">Added items:</div>
              {addedItems.map((item, i) => (
                <div key={i} className="text-[#7ee787]">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
