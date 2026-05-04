"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Search, BookOpen, TreePine, Hash, GitGraph, Network, Sigma } from "lucide-react";
import Link from "next/link";

interface Chapter {
  id: string;
  title: string;
  category: "fundamentals" | "intermediate" | "advanced";
  completed?: boolean;
  icon?: React.ReactNode;
}

const chapters: Chapter[] = [
  { id: "01-dynamic-arrays", title: "Dynamic Arrays", category: "fundamentals", icon: <BookOpen size={14} /> },
  { id: "02-strings", title: "Strings", category: "fundamentals", icon: <BookOpen size={14} /> },
  { id: "03-linked-lists", title: "Linked Lists", category: "fundamentals", icon: <BookOpen size={14} /> },
  { id: "04-stacks", title: "Stacks", category: "fundamentals", icon: <BookOpen size={14} /> },
  { id: "05-queues", title: "Queues", category: "fundamentals", icon: <BookOpen size={14} /> },
  { id: "06-recursion", title: "Recursion", category: "fundamentals", icon: <BookOpen size={14} /> },
  { id: "07-sorting", title: "Sorting", category: "intermediate", icon: <Hash size={14} /> },
  { id: "08-searching", title: "Searching", category: "intermediate", icon: <Hash size={14} /> },
  { id: "09-hash-tables", title: "Hash Tables", category: "intermediate", icon: <Hash size={14} /> },
  { id: "10-bst", title: "Binary Search Trees", category: "intermediate", icon: <TreePine size={14} /> },
  { id: "11-heaps", title: "Heaps", category: "intermediate", icon: <TreePine size={14} /> },
  { id: "12-graphs", title: "Graphs", category: "intermediate", icon: <GitGraph size={14} /> },
  { id: "13-dfs-bfs", title: "DFS / BFS", category: "intermediate", icon: <GitGraph size={14} /> },
  { id: "14-shortest-paths", title: "Shortest Paths", category: "advanced", icon: <Network size={14} /> },
  { id: "15-mst", title: "Minimum Spanning Tree", category: "advanced", icon: <Network size={14} /> },
  { id: "16-tries", title: "Tries", category: "advanced", icon: <TreePine size={14} /> },
  { id: "17-segment-trees", title: "Segment Trees", category: "advanced", icon: <TreePine size={14} /> },
  { id: "18-fenwick-trees", title: "Fenwick Trees", category: "advanced", icon: <TreePine size={14} /> },
  { id: "19-disjoint-sets", title: "Disjoint Sets", category: "advanced", icon: <Network size={14} /> },
  { id: "20-dp-fundamentals", title: "DP Fundamentals", category: "advanced", icon: <Sigma size={14} /> },
  { id: "21-advanced-dp", title: "Advanced DP", category: "advanced", icon: <Sigma size={14} /> },
  { id: "22-greedy", title: "Greedy Algorithms", category: "advanced", icon: <Sigma size={14} /> },
  { id: "23-backtracking", title: "Backtracking", category: "advanced", icon: <GitGraph size={14} /> },
  { id: "24-bit-manipulation", title: "Bit Manipulation", category: "advanced", icon: <Hash size={14} /> },
  { id: "25-math-primes", title: "Math & Primes", category: "advanced", icon: <Sigma size={14} /> },
  { id: "26-suffix-trees", title: "Suffix Trees", category: "advanced", icon: <TreePine size={14} /> },
  { id: "27-kd-trees", title: "K-D Trees", category: "advanced", icon: <TreePine size={14} /> },
  { id: "28-bloom-filters", title: "Bloom Filters", category: "advanced", icon: <Hash size={14} /> },
  { id: "29-network-flow", title: "Network Flow", category: "advanced", icon: <Network size={14} /> },
  { id: "30-computational-geometry", title: "Computational Geometry", category: "advanced", icon: <Sigma size={14} /> },
];

const categories = {
  fundamentals: { label: "Fundamentals", color: "#4ade80" },
  intermediate: { label: "Intermediate", color: "#60a5fa" },
  advanced: { label: "Advanced", color: "#f472b6" },
};

interface ChapterNavProps {
  currentChapterId?: string;
}

export default function ChapterNav({ currentChapterId }: ChapterNavProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["fundamentals", "intermediate", "advanced"]);

  const filteredChapters = chapters.filter((chapter) =>
    chapter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const chaptersByCategory = {
    fundamentals: filteredChapters.filter((c) => c.category === "fundamentals"),
    intermediate: filteredChapters.filter((c) => c.category === "intermediate"),
    advanced: filteredChapters.filter((c) => c.category === "advanced"),
  };

  return (
    <div className="flex h-full flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Cartesian Ultra
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded border border-border bg-accent/50 px-3 py-2 pl-9 text-sm text-foreground placeholder:text-muted focus:border-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto p-2">
        {Object.entries(chaptersByCategory).map(([category, categoryChapters]) => (
          <div key={category} className="mb-2">
            <motion.button
              onClick={() => toggleCategory(category)}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs font-medium uppercase tracking-wider hover:bg-accent"
              style={{ color: categories[category as keyof typeof categories].color }}
            >
              <motion.div
                animate={{ rotate: expandedCategories.includes(category) ? 90 : 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <ChevronRight size={14} />
              </motion.div>
              {categories[category as keyof typeof categories].label}
              <span className="ml-auto text-muted">({categoryChapters.length})</span>
            </motion.button>

            <AnimatePresence>
              {expandedCategories.includes(category) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  {categoryChapters.map((chapter) => {
                    const isActive = chapter.id === currentChapterId;

                    return (
                      <Link
                        key={chapter.id}
                        href={`/chapter/${chapter.id}`}
                        className={`flex items-center gap-2 rounded px-3 py-2 text-sm transition-colors ${
                          isActive
                            ? "bg-accent text-foreground"
                            : "text-muted hover:bg-accent/50 hover:text-foreground"
                        }`}
                      >
                        <span className="text-muted">{chapter.icon}</span>
                        <span className="flex-1 truncate">{chapter.title}</span>
                        {chapter.completed && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2 w-2 rounded-full bg-green-500"
                          />
                        )}
                      </Link>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Progress Footer */}
      <div className="border-t border-border p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>Progress</span>
          <span>0 / 30</span>
        </div>
        <div className="h-1 rounded-full bg-accent">
          <motion.div
            className="h-full rounded-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: "0%" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
