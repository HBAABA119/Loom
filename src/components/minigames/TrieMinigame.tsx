"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";

interface TrieNode {
  id: string;
  char: string;
  isEnd: boolean;
  children: { [key: string]: string };
  parent: string | null;
}

export default function TrieMinigame() {
  const [nodes, setNodes] = useState<{ [id: string]: TrieNode }>({
    root: { id: "root", char: "", isEnd: false, children: {}, parent: null },
  });
  const [toInsert, setToInsert] = useState(["cat", "car", "card", "care", "dog"]);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const insertNext = useCallback(() => {
    if (toInsert.length === 0) return;
    const word = toInsert[0];
    let current = "root";
    const newNodes = { ...nodes };

    for (const char of word) {
      const parent = newNodes[current];
      if (!parent.children[char]) {
        const newId = `n${Date.now()}${char}`;
        parent.children[char] = newId;
        newNodes[newId] = { id: newId, char, isEnd: false, children: {}, parent: current };
      }
      current = parent.children[char];
      setActiveNode(current);
    }
    newNodes[current].isEnd = true;
    setNodes(newNodes);
    setToInsert(toInsert.slice(1));
    setScore(s => s + 10);
    setTimeout(() => setActiveNode(null), 500);
  }, [nodes, toInsert]);

  const reset = () => {
    setNodes({ root: { id: "root", char: "", isEnd: false, children: {}, parent: null } });
    setToInsert(["cat", "car", "card", "care", "dog"]);
    setScore(0);
  };

  const renderNode = (id: string, depth: number = 0) => {
    const node = nodes[id];
    if (!node) return null;
    const children = Object.entries(node.children);
    return (
      <div key={id} className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: 1,
            backgroundColor: activeNode === id ? "#238636" : node.isEnd ? "#f0883e" : "#21262d",
            borderColor: activeNode === id ? "#3fb950" : "#30363d"
          }}
          className="w-10 h-10 flex items-center justify-center rounded-full border-2 text-white font-bold"
        >
          {node.char || "R"}
        </motion.div>
        {children.length > 0 && (
          <div className="flex gap-2 mt-4">
            {children.map(([char, childId]) => renderNode(childId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-[#30363d]">
        <h3 className="text-white font-semibold">Trie Construction Minigame</h3>
        <span className="text-[#8b949e]">Score: <span className="text-[#58a6ff] font-bold">{score}</span></span>
      </div>
      <div className="flex-1 p-4 relative overflow-hidden flex flex-col items-center justify-center">
        {toInsert.length > 0 && (
          <div className="absolute top-4 p-3 bg-[#161b22] border border-[#30363d] rounded-lg">
            <span className="text-[#8b949e]">Insert: </span>
            <span className="text-[#f0883e] font-mono font-bold">{toInsert[0]}</span>
          </div>
        )}
        <div className="mt-12">
          {renderNode("root")}
        </div>
      </div>
      <div className="p-4 border-t border-[#30363d] flex items-center justify-between">
        <div className="text-sm text-[#8b949e]">
          <span className="inline-block w-4 h-4 bg-[#238636] rounded-full mr-2"></span>Active
          <span className="inline-block w-4 h-4 bg-[#f0883e] rounded-full ml-4 mr-2"></span>Word End
        </div>
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
