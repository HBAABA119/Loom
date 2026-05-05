"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Layers, Play, RotateCcw } from "lucide-react";

export default function SegmentTreeMinigameEnhanced() {
  const [array] = useState([1, 3, 2, 7, 9, 11, 5, 4]);
  const [tree, setTree] = useState<number[]>([]);
  const [queryRange, setQueryRange] = useState<[number, number]>([0, 3]);
  const [queryResult, setQueryResult] = useState<number | null>(null);

  const buildTree = () => {
    const n = array.length;
    const segTree: number[] = new Array(2 * n);
    for (let i = 0; i < n; i++) segTree[n + i] = array[i];
    for (let i = n - 1; i > 0; i--) segTree[i] = segTree[2 * i] + segTree[2 * i + 1];
    setTree(segTree);
  };

  const query = () => {
    const [l, r] = queryRange;
    const n = array.length;
    let sum = 0;
    for (let left = l + n, right = r + n; left <= right; left >>= 1, right >>= 1) {
      if (left % 2 === 1) sum += tree[left++];
      if (right % 2 === 0) sum += tree[right--];
    }
    setQueryResult(sum);
  };

  const reset = () => {
    setTree([]);
    setQueryResult(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <Layers size={24} className="text-[#f0883e]" />
          Segment Tree
        </h2>
        <div className="flex gap-2">
          <button onClick={buildTree} className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg">Build</button>
          <button onClick={query} disabled={tree.length === 0} className="px-4 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-lg">Query</button>
          <button onClick={reset} className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg">Reset</button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Original Array</h3>
          <div className="flex gap-2">
            {array.map((val, i) => (
              <div key={i} className="px-4 py-3 bg-[#21262d] text-white rounded-lg font-mono">{val}</div>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Segment Tree</h3>
          <div className="flex flex-wrap gap-2">
            {tree.map((val, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="px-3 py-2 bg-[#21262d] text-white rounded-lg font-mono text-sm"
              >
                {val}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-48 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Query</h3>
          <div className="space-y-2">
            <input
              type="number"
              value={queryRange[0]}
              onChange={(e) => setQueryRange([Number(e.target.value), queryRange[1]])}
              className="w-full px-3 py-2 bg-[#21262d] text-white rounded-lg"
              placeholder="Start index"
            />
            <input
              type="number"
              value={queryRange[1]}
              onChange={(e) => setQueryRange([queryRange[0], Number(e.target.value)])}
              className="w-full px-3 py-2 bg-[#21262d] text-white rounded-lg"
              placeholder="End index"
            />
            {queryResult !== null && (
              <div className="mt-4 p-3 bg-[#238636] text-white rounded-lg font-bold text-center">
                Sum: {queryResult}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
