"use client";

import { useState } from "react";
import { Plus, Play, RotateCcw } from "lucide-react";

export default function FenwickTreeMinigameEnhanced() {
  const [array] = useState([0, 0, 0, 0, 0, 0, 0, 0]);
  const [tree, setTree] = useState<number[]>(Array(9).fill(0));
  const [index, setIndex] = useState(1);
  const [value, setValue] = useState(5);

  const update = (idx: number, val: number) => {
    const newTree = [...tree];
    while (idx < newTree.length) {
      newTree[idx] += val;
      idx += idx & -idx;
    }
    setTree(newTree);
  };

  const query = (idx: number) => {
    let sum = 0;
    while (idx > 0) {
      sum += tree[idx];
      idx -= idx & -idx;
    }
    return sum;
  };

  const handleUpdate = () => {
    update(index, value);
  };

  const reset = () => {
    setTree(Array(9).fill(0));
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <Plus size={24} className="text-[#f0883e]" />
          Fenwick Tree (BIT)
        </h2>
        <div className="flex gap-2">
          <button onClick={handleUpdate} className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg">Update</button>
          <button onClick={reset} className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg">Reset</button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Fenwick Tree</h3>
          <div className="flex gap-2">
            {tree.slice(1).map((val, i) => (
              <div key={i + 1} className="flex-1 p-3 bg-[#21262d] text-white rounded-lg font-mono text-center">
                <div className="text-xs text-[#8b949e]">{i + 1}</div>
                <div className="text-lg font-bold">{val}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-48 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Controls</h3>
          <div className="space-y-3">
            <div>
              <label className="text-[#8b949e] text-sm">Index (1-8)</label>
              <input
                type="number"
                min="1"
                max="8"
                value={index}
                onChange={(e) => setIndex(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#21262d] text-white rounded-lg"
              />
            </div>
            <div>
              <label className="text-[#8b949e] text-sm">Value to Add</label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#21262d] text-white rounded-lg"
              />
            </div>
            <div className="p-3 bg-[#21262d] rounded-lg">
              <div className="text-[#8b949e] text-sm">Prefix Sum ({index}):</div>
              <div className="text-2xl font-bold text-[#58a6ff]">{query(index)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
