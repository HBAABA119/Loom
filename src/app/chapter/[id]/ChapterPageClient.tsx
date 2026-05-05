"use client";

import { useEffect, useState, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Gamepad2, Maximize2, Eye } from "lucide-react";

import ChapterNav from "@/components/ChapterNav";
import ContentPanel from "@/components/ContentPanel";
import CodePanel from "@/components/CodePanel";
import Timeline from "@/components/Timeline";
import ThemeToggle from "@/components/ThemeToggle";
import { initTimelineSync, destroyTimelineSync } from "@/lib/engine/timelineSync";
import { ExpandablePanel } from "@/components/ExpandablePanel";
import { ErrorBoundary, VisualizerErrorFallback, MinigameErrorFallback } from "@/components/ErrorBoundary";

// Dynamic imports for chapter visualizers
const chapterVisualizers: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "01-dynamic-arrays": lazy(() => import("@/components/chapters/DynamicArrayVisualizer")),
  "03-linked-lists": lazy(() => import("@/components/chapters/LinkedListVisualizer")),
  "04-stacks": lazy(() => import("@/components/chapters/StackVisualizer")),
  "05-queues": lazy(() => import("@/components/chapters/QueueVisualizer")),
  "10-bst": lazy(() => import("@/components/chapters/BSTVisualizer")),
};

// Dynamic imports for minigames
const chapterMinigames: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "01-dynamic-arrays": lazy(() => import("@/components/minigames/ArrayResizeGame")),
  "03-linked-lists": lazy(() => import("@/components/minigames/LinkedListMinigame")),
  "04-stacks": lazy(() => import("@/components/minigames/StackMinigame")),
  "05-queues": lazy(() => import("@/components/minigames/QueueMinigame")),
};

const defaultCode = `// Select a chapter to see code examples
class Example<T> {
  // Code will appear here
}`;

const chapterCode: Record<string, string> = {
  "01-dynamic-arrays": `class DynamicArray<T> {
  private data: T[];
  private size: number;
  private capacity: number;

  constructor(capacity: number = 4) {
    this.data = new Array(capacity);
    this.size = 0;
    this.capacity = capacity;
  }

  push(value: T): void {
    if (this.size === this.capacity) {
      this.resize();
    }
    this.data[this.size] = value;
    this.size++;
  }

  private resize(): void {
    const newCapacity = this.capacity * 2;
    const newData = new Array(newCapacity);
    for (let i = 0; i < this.size; i++) {
      newData[i] = this.data[i];
    }
    this.data = newData;
    this.capacity = newCapacity;
  }

  pop(): T | undefined {
    if (this.size === 0) return undefined;
    this.size--;
    return this.data[this.size];
  }
}`,
  "03-linked-lists": `class ListNode<T> {
  value: T;
  next: ListNode<T> | null;
  
  constructor(value: T) {
    this.value = value;
    this.next = null;
  }
}

class LinkedList<T> {
  head: ListNode<T> | null;
  
  constructor() {
    this.head = null;
  }
  
  append(value: T): void {
    const newNode = new ListNode(value);
    if (!this.head) {
      this.head = newNode;
      return;
    }
    let current = this.head;
    while (current.next) {
      current = current.next;
    }
    current.next = newNode;
  }
  
  prepend(value: T): void {
    const newNode = new ListNode(value);
    newNode.next = this.head;
    this.head = newNode;
  }
}`,
  "04-stacks": `class Stack<T> {
  private items: T[];
  
  constructor() {
    this.items = [];
  }
  
  push(item: T): void {
    this.items.push(item);
  }
  
  pop(): T | undefined {
    return this.items.pop();
  }
  
  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }
  
  isEmpty(): boolean {
    return this.items.length === 0;
  }
  
  size(): number {
    return this.items.length;
  }
}`,
  "05-queues": `class Queue<T> {
  private items: T[];
  private front: number;
  private rear: number;
  
  constructor() {
    this.items = [];
    this.front = 0;
    this.rear = -1;
  }
  
  enqueue(item: T): void {
    this.items.push(item);
    this.rear++;
  }
  
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    const item = this.items[this.front];
    this.front++;
    return item;
  }
  
  peek(): T | undefined {
    return this.items[this.front];
  }
  
  isEmpty(): boolean {
    return this.front > this.rear;
  }
}`,
};

type ViewMode = "learn" | "challenge";

interface ChapterPageClientProps {
  chapterId: string;
  chapterData: {
    title: string;
    theory: {
      overview: string;
      keyConcepts: { name: string; description: string }[];
      complexity: {
        access: string;
        search: string;
        insertion: string;
        deletion: string;
        space: string;
      };
    };
    problems: { id: string; title: string; difficulty: "easy" | "medium" | "hard" }[];
  };
}

export default function ChapterPageClient({ chapterId, chapterData }: ChapterPageClientProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("learn");
  const [visualizerOpen, setVisualizerOpen] = useState(false);
  const [minigameOpen, setMinigameOpen] = useState(false);
  
  // Get visualizer and minigame components for this chapter
  const VisualizerComponent = chapterVisualizers[chapterId];
  const MinigameComponent = chapterMinigames[chapterId];
  const code = chapterCode[chapterId] || defaultCode;
  const hasInteractiveContent = VisualizerComponent !== undefined;

  useEffect(() => {
    initTimelineSync();
    return () => {
      destroyTimelineSync();
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Left Sidebar - Chapter Navigation */}
      <div className="h-full w-64 flex-shrink-0">
        <ChapterNav currentChapterId={chapterId} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h1 className="text-lg font-semibold">{chapterData.title}</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex rounded border border-border">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode("learn")}
              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                viewMode === "learn"
                  ? "bg-foreground text-background"
                  : "hover:bg-accent"
              }`}
            >
              <BookOpen size={14} />
              Learn
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode("challenge")}
              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                viewMode === "challenge"
                  ? "bg-foreground text-background"
                  : "hover:bg-accent"
              }`}
            >
              <Gamepad2 size={14} />
              Challenge
            </motion.button>
            </div>
          </div>
        </div>

        {/* Three Pane Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Pane - Content/Theory */}
          <div className="h-full w-1/4 flex-shrink-0">
            <ContentPanel
              title={chapterData.title}
              overview={chapterData.theory.overview}
              keyConcepts={chapterData.theory.keyConcepts}
              complexity={chapterData.theory.complexity}
              problems={chapterData.problems}
            />
          </div>

          {/* Center Pane - Visualizer */}
          <div className="flex flex-1 flex-col relative">
            {/* Expand Button */}
            <button
              onClick={() => viewMode === "learn" ? setVisualizerOpen(true) : setMinigameOpen(true)}
              className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#58a6ff] transition-colors shadow-lg"
              title="Expand to full view"
            >
              <Maximize2 size={16} />
              <span className="text-xs font-medium hidden sm:inline">Expand</span>
            </button>

            <div className="flex-1 overflow-auto border-x border-border">
              <AnimatePresence mode="wait">
                {viewMode === "learn" ? (
                  <motion.div
                    key="learn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {VisualizerComponent ? (
                      <Suspense fallback={<div className="flex h-full items-center justify-center text-muted">Loading visualizer...</div>}>
                        <VisualizerComponent />
                      </Suspense>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-8">
                        <h3 className="mb-4 text-xl font-semibold">Interactive Visualizer Coming Soon</h3>
                        <p className="text-center text-muted">This chapter is currently being developed.</p>
                        <p className="mt-2 text-sm text-muted">Check out Chapter 1: Dynamic Arrays for a complete example.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="challenge"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full"
                  >
                    {MinigameComponent ? (
                      <Suspense fallback={<div className="flex h-full items-center justify-center text-muted">Loading minigame...</div>}>
                        <MinigameComponent />
                      </Suspense>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center p-8">
                        <h3 className="mb-4 text-xl font-semibold">Challenge Mode Coming Soon</h3>
                        <p className="text-center text-muted">Practice problems are available in the left panel.</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Pane - Code/Terminal */}
          <div className="h-full w-1/4 flex-shrink-0">
            <CodePanel code={code} />
          </div>
        </div>

        {/* Bottom Timeline */}
        {viewMode === "learn" && <Timeline />}

        {/* Expandable Panels */}
        <ExpandablePanel
          isOpen={visualizerOpen}
          onClose={() => setVisualizerOpen(false)}
          title="Algorithm Visualizer"
          subtitle={chapterData.title}
        >
          {VisualizerComponent ? (
            <ErrorBoundary fallback={<VisualizerErrorFallback />}>
              <Suspense fallback={<div className="flex h-full items-center justify-center text-muted">Loading visualizer...</div>}>
                <VisualizerComponent />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8">
              <Eye size={64} className="mx-auto mb-4 text-[#58a6ff]" />
              <h3 className="text-2xl font-semibold text-white mb-2">Visualizer Coming Soon</h3>
              <p className="text-[#8b949e]">This chapter&apos;s interactive visualization is being developed.</p>
            </div>
          )}
        </ExpandablePanel>

        <ExpandablePanel
          isOpen={minigameOpen}
          onClose={() => setMinigameOpen(false)}
          title="Practice Minigame"
          subtitle={chapterData.title}
        >
          {MinigameComponent ? (
            <ErrorBoundary fallback={<MinigameErrorFallback />}>
              <Suspense fallback={<div className="flex h-full items-center justify-center text-muted">Loading minigame...</div>}>
                <MinigameComponent />
              </Suspense>
            </ErrorBoundary>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8">
              <Gamepad2 size={64} className="mx-auto mb-4 text-[#f0883e]" />
              <h3 className="text-2xl font-semibold text-white mb-2">Minigame Coming Soon</h3>
              <p className="text-[#8b949e]">Practice challenges for this chapter are being prepared.</p>
            </div>
          )}
        </ExpandablePanel>
      </div>
    </div>
  );
}
