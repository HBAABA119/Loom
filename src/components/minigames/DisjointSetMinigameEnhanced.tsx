"use client";

import { useState } from "react";
import { Link2, Play, RotateCcw } from "lucide-react";

export default function DisjointSetMinigameEnhanced() {
  const [parent, setParent] = useState([0, 1, 2, 3, 4]);
  const [rank, setRank] = useState([0, 0, 0, 0, 0]);
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const find = (x: number): number => {
    if (parent[x] !== x) {
      return find(parent[x]);
    }
    return x;
  };

  const union = (x: number, y: number) => {
    const px = find(x);
    const py = find(y);
    if (px === py) return;

    if (rank[px] < rank[py]) {
      setParent(prev => { const newP = [...prev]; newP[px] = py; return newP; });
    } else if (rank[px] > rank[py]) {
      setParent(prev => { const newP = [...prev]; newP[py] = px; return newP; });
    } else {
      setParent(prev => { const newP = [...prev]; newP[py] = px; return newP; });
      setRank(prev => { const newR = [...prev]; newR[px]++; return newR; });
    }
  };

  const handleUnion = () => {
    if (selected && selected[0] !== selected[1]) {
      union(selected[0], selected[1]);
    }
  };

  const reset = () => {
    setParent([0, 1, 2, 3, 4]);
    setRank([0, 0, 0, 0, 0]);
    setSelected(null);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-bold flex items-center gap-2">
          <Link2 size={24} className="text-[#58a6ff]" />
          Disjoint Set Union
        </h2>
        <div className="flex gap-2">
          <button onClick={handleUnion} disabled={!selected} className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg">Union</button>
          <button onClick={reset} className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg">Reset</button>
        </div>
      </div>

      <div className="flex-1 flex gap-4">
        <div className="flex-1 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Elements</h3>
          <div className="flex gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                onClick={() => setSelected(selected ? (selected[0] === i ? null : [selected[0], i]) : [i, -1])}
                className={`flex-1 p-4 rounded-lg text-white font-bold text-center cursor-pointer transition-colors ${
                  selected?.includes(i) ? "bg-[#f0883e]" : "bg-[#21262d]"
                }`}
              >
                <div className="text-lg">{i}</div>
                <div className="text-xs text-[#8b949e]">parent: {parent[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-48 bg-[#161b22] rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Sets</h3>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="p-2 bg-[#21262d] rounded text-sm">
                <span className="text-[#58a6ff]">find({i}) = </span>
                <span className="text-white">{find(i)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
