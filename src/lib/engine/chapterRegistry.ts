import { lazy, ComponentType } from "react";

export interface ChapterConfig {
  id: string;
  title: string;
  category: "fundamentals" | "intermediate" | "advanced";
  visualizer: React.LazyExoticComponent<ComponentType> | null;
  minigame: React.LazyExoticComponent<ComponentType> | null;
  hasCode: boolean;
}

// Dynamic imports for visualizers - mapped to chapter IDs
const visualizers: Record<string, React.LazyExoticComponent<ComponentType>> = {
  "01-big-o": lazy(() => import("@/components/chapters/ArrayVisualizerEnhanced")),
  "03-arrays": lazy(() => import("@/components/chapters/ArrayVisualizerEnhanced")),
  "05-linked-lists": lazy(() => import("@/components/chapters/LinkedListVisualizerEnhanced")),
  "06-stacks": lazy(() => import("@/components/chapters/StackVisualizerEnhanced")),
  "07-queues": lazy(() => import("@/components/chapters/QueueVisualizerEnhanced")),
  "04-strings": lazy(() => import("@/components/chapters/StringVisualizerEnhanced")),
  "09-hash-tables": lazy(() => import("@/components/chapters/HashTableVisualizerEnhanced")),
  "10-bst": lazy(() => import("@/components/chapters/BSTVisualizerEnhanced")),
  "11-heaps": lazy(() => import("@/components/chapters/HeapVisualizer")),
  "12-graphs": lazy(() => import("@/components/chapters/GraphVisualizer")),
  "13-dfs-bfs": lazy(() => import("@/components/chapters/GraphVisualizer")),
  "16-tries": lazy(() => import("@/components/chapters/TrieVisualizer")),
  "17-segment-trees": lazy(() => import("@/components/chapters/SegmentTreeVisualizer")),
  "18-fenwick-trees": lazy(() => import("@/components/chapters/FenwickTreeVisualizer")),
  "19-disjoint-sets": lazy(() => import("@/components/chapters/DisjointSetVisualizer")),
  "08-searching": lazy(() => import("@/components/chapters/SearchingVisualizer")),
  "14-shortest-paths": lazy(() => import("@/components/chapters/ShortestPathVisualizer")),
  "15-mst": lazy(() => import("@/components/chapters/MSTVisualizer")),
  "02-memory": lazy(() => import("@/components/chapters/MemoryVisualizer")),
  "20-dp-fundamentals": lazy(() => import("@/components/chapters/DPVisualizer")),
  "21-advanced-dp": lazy(() => import("@/components/chapters/DPVisualizer")),
  "22-greedy-algorithms": lazy(() => import("@/components/chapters/GreedyVisualizer")),
  "23-backtracking": lazy(() => import("@/components/chapters/BacktrackVisualizer")),
  "24-bit-manipulation": lazy(() => import("@/components/chapters/BitManipVisualizer")),
  "25-math-primes": lazy(() => import("@/components/chapters/MathVisualizer")),
  "26-suffix-trees": lazy(() => import("@/components/chapters/SuffixTreeVisualizer")),
  "27-kd-trees": lazy(() => import("@/components/chapters/KDTreeVisualizer")),
  "28-bloom-filters": lazy(() => import("@/components/chapters/BloomFilterVisualizer")),
  "29-network-flow": lazy(() => import("@/components/chapters/NetworkFlowVisualizer")),
  "30-computational-geometry": lazy(() => import("@/components/chapters/GeometryVisualizer")),
};

// Dynamic imports for minigames - mapped to chapter IDs
const minigames: Record<string, React.LazyExoticComponent<ComponentType>> = {
  "01-big-o": lazy(() => import("@/components/minigames/ArrayMinigameEnhanced")),
  "03-arrays": lazy(() => import("@/components/minigames/ArrayMinigameEnhanced")),
  "05-linked-lists": lazy(() => import("@/components/minigames/LinkedListMinigameEnhanced")),
  "06-stacks": lazy(() => import("@/components/minigames/StackMinigameEnhanced")),
  "07-queues": lazy(() => import("@/components/minigames/QueueMinigameEnhanced")),
  "10-bst": lazy(() => import("@/components/minigames/BSTMinigameEnhanced")),
  "11-heaps": lazy(() => import("@/components/minigames/HeapMinigame")),
  "02-memory": lazy(() => import("@/components/minigames/ArrayMinigameEnhanced")),
  "04-strings": lazy(() => import("@/components/minigames/StringMinigameEnhanced")),
  "08-searching": lazy(() => import("@/components/minigames/SearchingMinigame")),
  "09-hash-tables": lazy(() => import("@/components/minigames/HashTableMinigameEnhanced")),
  "15-mst": lazy(() => import("@/components/minigames/SortingMinigame")),
  "12-graphs": lazy(() => import("@/components/minigames/GraphMinigame")),
  "13-dfs-bfs": lazy(() => import("@/components/minigames/GraphMinigame")),
  "14-shortest-paths": lazy(() => import("@/components/minigames/GraphMinigame")),
  "16-tries": lazy(() => import("@/components/minigames/TrieMinigame")),
  "17-segment-trees": lazy(() => import("@/components/minigames/SortingMinigame")),
  "18-fenwick-trees": lazy(() => import("@/components/minigames/SortingMinigame")),
  "19-disjoint-sets": lazy(() => import("@/components/minigames/SortingMinigame")),
  "20-dp-fundamentals": lazy(() => import("@/components/minigames/DPMinigame")),
  "21-advanced-dp": lazy(() => import("@/components/minigames/DPMinigame")),
  "22-greedy-algorithms": lazy(() => import("@/components/minigames/GreedyMinigame")),
  "23-backtracking": lazy(() => import("@/components/minigames/SortingMinigame")),
  "24-bit-manipulation": lazy(() => import("@/components/minigames/SortingMinigame")),
  "25-math-primes": lazy(() => import("@/components/minigames/SortingMinigame")),
  "26-suffix-trees": lazy(() => import("@/components/minigames/TrieMinigame")),
  "27-kd-trees": lazy(() => import("@/components/minigames/SortingMinigame")),
  "28-bloom-filters": lazy(() => import("@/components/minigames/HashTableMinigame")),
  "29-network-flow": lazy(() => import("@/components/minigames/GraphMinigame")),
  "30-computational-geometry": lazy(() => import("@/components/minigames/SortingMinigame")),
};

export function getChapterConfig(id: string): ChapterConfig {
  const chapterMap: Record<string, Omit<ChapterConfig, "id" >> = {
    "01-big-o": {
      title: "Big O Notation",
      category: "fundamentals",
      visualizer: visualizers["01-big-o"] || null,
      minigame: minigames["01-big-o"] || null,
      hasCode: true,
    },
    "02-memory": {
      title: "Memory Management",
      category: "fundamentals",
      visualizer: visualizers["02-memory"] || null,
      minigame: minigames["02-memory"] || null,
      hasCode: true,
    },
    "03-arrays": {
      title: "Arrays & Operations",
      category: "fundamentals",
      visualizer: visualizers["03-arrays"] || null,
      minigame: minigames["03-arrays"] || null,
      hasCode: true,
    },
    "04-strings": {
      title: "Strings",
      category: "fundamentals",
      visualizer: visualizers["04-strings"] || null,
      minigame: minigames["04-strings"] || null,
      hasCode: true,
    },
    "05-linked-lists": {
      title: "Linked Lists",
      category: "fundamentals",
      visualizer: visualizers["05-linked-lists"] || null,
      minigame: minigames["05-linked-lists"] || null,
      hasCode: true,
    },
    "06-stacks": {
      title: "Stacks",
      category: "fundamentals",
      visualizer: visualizers["06-stacks"] || null,
      minigame: minigames["06-stacks"] || null,
      hasCode: true,
    },
    "07-queues": {
      title: "Queues",
      category: "fundamentals",
      visualizer: visualizers["07-queues"] || null,
      minigame: minigames["07-queues"] || null,
      hasCode: true,
    },
    "08-searching": {
      title: "Searching Algorithms",
      category: "fundamentals",
      visualizer: visualizers["08-searching"] || null,
      minigame: minigames["08-searching"] || null,
      hasCode: true,
    },
    "09-hash-tables": {
      title: "Hash Tables",
      category: "intermediate",
      visualizer: visualizers["09-hash-tables"] || null,
      minigame: minigames["09-hash-tables"] || null,
      hasCode: true,
    },
    "10-bst": {
      title: "Binary Search Trees",
      category: "intermediate",
      visualizer: visualizers["10-bst"] || null,
      minigame: minigames["10-bst"] || null,
      hasCode: true,
    },
    "11-heaps": {
      title: "Heaps",
      category: "intermediate",
      visualizer: visualizers["11-heaps"] || null,
      minigame: minigames["11-heaps"] || null,
      hasCode: true,
    },
    "12-graphs": {
      title: "Graph Fundamentals",
      category: "intermediate",
      visualizer: visualizers["12-graphs"] || null,
      minigame: minigames["12-graphs"] || null,
      hasCode: true,
    },
    "13-dfs-bfs": {
      title: "DFS & BFS Advanced",
      category: "intermediate",
      visualizer: visualizers["13-dfs-bfs"] || null,
      minigame: minigames["13-dfs-bfs"] || null,
      hasCode: true,
    },
    "14-shortest-paths": {
      title: "Shortest Paths",
      category: "advanced",
      visualizer: visualizers["14-shortest-paths"] || null,
      minigame: minigames["14-shortest-paths"] || null,
      hasCode: true,
    },
    "15-mst": {
      title: "Minimum Spanning Tree",
      category: "advanced",
      visualizer: visualizers["15-mst"] || null,
      minigame: minigames["15-mst"] || null,
      hasCode: true,
    },
    "16-tries": {
      title: "Tries (Prefix Trees)",
      category: "advanced",
      visualizer: visualizers["16-tries"] || null,
      minigame: minigames["16-tries"] || null,
      hasCode: true,
    },
    "17-segment-trees": {
      title: "Segment Trees",
      category: "advanced",
      visualizer: visualizers["17-segment-trees"] || null,
      minigame: minigames["17-segment-trees"] || null,
      hasCode: true,
    },
    "18-fenwick-trees": {
      title: "Fenwick Trees",
      category: "advanced",
      visualizer: visualizers["18-fenwick-trees"] || null,
      minigame: minigames["18-fenwick-trees"] || null,
      hasCode: true,
    },
    "19-disjoint-sets": {
      title: "Disjoint Set Union (Union-Find)",
      category: "advanced",
      visualizer: visualizers["19-disjoint-sets"] || null,
      minigame: minigames["19-disjoint-sets"] || null,
      hasCode: true,
    },
    "20-dp-fundamentals": {
      title: "DP Fundamentals",
      category: "advanced",
      visualizer: visualizers["20-dp-fundamentals"] || null,
      minigame: minigames["20-dp-fundamentals"] || null,
      hasCode: true,
    },
    "21-advanced-dp": {
      title: "Advanced DP",
      category: "advanced",
      visualizer: visualizers["21-advanced-dp"] || null,
      minigame: minigames["21-advanced-dp"] || null,
      hasCode: true,
    },
    "22-greedy": {
      title: "Greedy Algorithms",
      category: "advanced",
      visualizer: visualizers["22-greedy-algorithms"] || null,
      minigame: minigames["22-greedy-algorithms"] || null,
      hasCode: true,
    },
    "23-backtracking": {
      title: "Backtracking",
      category: "advanced",
      visualizer: visualizers["23-backtracking"] || null,
      minigame: minigames["23-backtracking"] || null,
      hasCode: true,
    },
    "24-bit-manipulation": {
      title: "Bit Manipulation",
      category: "advanced",
      visualizer: visualizers["24-bit-manipulation"] || null,
      minigame: minigames["24-bit-manipulation"] || null,
      hasCode: true,
    },
    "25-math-primes": {
      title: "Math & Primes",
      category: "advanced",
      visualizer: visualizers["25-math-primes"] || null,
      minigame: minigames["25-math-primes"] || null,
      hasCode: true,
    },
    "26-suffix-trees": {
      title: "Suffix Trees",
      category: "advanced",
      visualizer: visualizers["26-suffix-trees"] || null,
      minigame: minigames["26-suffix-trees"] || null,
      hasCode: true,
    },
    "27-kd-trees": {
      title: "K-D Trees",
      category: "advanced",
      visualizer: visualizers["27-kd-trees"] || null,
      minigame: minigames["27-kd-trees"] || null,
      hasCode: true,
    },
    "28-bloom-filters": {
      title: "Bloom Filters",
      category: "advanced",
      visualizer: visualizers["28-bloom-filters"] || null,
      minigame: minigames["28-bloom-filters"] || null,
      hasCode: true,
    },
    "29-network-flow": {
      title: "Network Flow",
      category: "advanced",
      visualizer: visualizers["29-network-flow"] || null,
      minigame: minigames["29-network-flow"] || null,
      hasCode: true,
    },
    "30-computational-geometry": {
      title: "Computational Geometry",
      category: "advanced",
      visualizer: visualizers["30-computational-geometry"] || null,
      minigame: minigames["30-computational-geometry"] || null,
      hasCode: true,
    },
  };

  const config = chapterMap[id] || {
    title: "Unknown Chapter",
    category: "fundamentals",
    visualizer: null,
    minigame: null,
    hasCode: false,
  };

  return { id, ...config };
}

export async function loadChapterData(bookId: string, chapterId: string) {
  try {
    const data = await import(`@/content/${bookId}/${chapterId}.json`);
    return data.default || data;
  } catch {
    return null;
  }
}
