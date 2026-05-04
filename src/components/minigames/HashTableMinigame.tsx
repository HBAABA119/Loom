"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface Bucket {
  id: string;
  index: number;
  items: { key: string; value: number }[];
}

export default function HashTableMinigame() {
  const [buckets, setBuckets] = useState<Bucket[]>(
    Array.from({ length: 8 }, (_, i) => ({ id: `b${i}`, index: i, items: [] }))
  );
  const [toInsert, setToInsert] = useState([{ key: "apple", value: 10 }, { key: "banana", value: 20 }, { key: "grape", value: 30 }, { key: "orange", value: 40 }, { key: "melon", value: 50 }]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");

  const hash = (key: string) => {
    let h = 0;
    for (let i = 0; i < key.length; i++) {
      h = ((h << 5) - h + key.charCodeAt(i)) & 0x7fffffff;
    }
    return h % 8;
  };

  const insertNext = useCallback(() => {
    if (toInsert.length === 0) {
      setFeedback("✅ All items inserted!");
      return;
    }
    const item = toInsert[0];
    const idx = hash(item.key);
    const newBuckets = [...buckets];
    newBuckets[idx].items.push(item);
    setBuckets(newBuckets);
    setToInsert(toInsert.slice(1));
    setScore(score + 10);
    setFeedback(`Inserted "${item.key}" → Bucket ${idx} (hash: ${idx})`);
  }, [buckets, toInsert, score]);

  const reset = () => {
    setBuckets(Array.from({ length: 8 }, (_, i) => ({ id: `b${i}`, index: i, items: [] })));
    setToInsert([{ key: "apple", value: 10 }, { key: "banana", value: 20 }, { key: "grape", value: 30 }, { key: "orange", value: 40 }, { key: "melon", value: 50 }]);
    setScore(0);
    setFeedback("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Hash Table Minigame</h3>
        <div className="flex items-center gap-4">
          <span className="text-[#8b949e]">Score: <span className="text-[#58a6ff] font-bold">{score}</span></span>
          <span className="text-[#8b949e]">Remaining: <span className="text-[#f0883e]">{toInsert.length}</span></span>
        </div>
      </div>
      <div className="flex-1 p-4 relative overflow-hidden">
        <div className="grid grid-cols-4 gap-3">
          {buckets.map((b) => (
            <motion.div key={b.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
              <span className="text-[#58a6ff] font-mono font-bold">Bucket {b.index}</span>
              <div className="mt-2 flex flex-col gap-1">
                {b.items.map((item, i) => (
                  <div key={i} className="bg-[#238636] text-white px-2 py-1 rounded text-xs">{item.key}: {item.value}</div>
                ))}
                {b.items.length === 0 && <span className="text-[#8b949e] text-xs">Empty</span>}
              </div>
            </motion.div>
          ))}
        </div>
        {toInsert.length > 0 && (
          <div className="absolute top-4 right-4 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
            <span className="text-[#8b949e]">Next: </span>
            <span className="text-[#f0883e] font-mono font-bold">{toInsert[0].key}</span>
          </div>
        )}
        {feedback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-20 left-4 right-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <p className="text-[#3fb950]">{feedback}</p>
          </motion.div>
        )}
      </div>
      <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
        <span className="text-[#8b949e] text-sm">Hash function: sum of char codes mod 8</span>
        <div className="flex items-center gap-2">
          {toInsert.length > 0 ? (
            <button onClick={insertNext} className="px-6 py-2 bg-[#238636] text-white rounded-md hover:bg-[#2ea043] font-semibold">Insert</button>
          ) : (
            <button onClick={reset} className="px-6 py-2 bg-[#8957e5] text-white rounded-md hover:bg-[#a371f7] font-semibold">Reset</button>
          )}
        </div>
      </div>
    </div>
  );
}
