"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, BookOpen, Play, CheckCircle, 
  Clock, Target, Lightbulb, Code, Gamepad2, Calculator
} from "lucide-react";
import { Book, ChapterMeta } from "@/lib/engine/bookRegistry";
import { getChapterConfig } from "@/lib/engine/chapterRegistry";
import ThemeToggle from "@/components/ThemeToggle";
import { MixedText } from "@/components/LatexRenderer";

interface ChapterPageClientProps {
  book: Book;
  chapter: ChapterMeta;
  prevChapter: ChapterMeta | null;
  nextChapter: ChapterMeta | null;
  content: any;
}

export default function ChapterPageClient({ 
  book, 
  chapter, 
  prevChapter, 
  nextChapter,
  content
}: ChapterPageClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"theory" | "practice" | "visualizer" | "minigame">("theory");
  const [showHint, setShowHint] = useState<number | null>(null);
  const [problemStep, setProblemStep] = useState(0);

  // Get chapter config for visualizer and minigame
  const chapterConfig = getChapterConfig(chapter.id);
  const VisualizerComponent = chapterConfig.visualizer;
  const MinigameComponent = chapterConfig.minigame;

  // Use loaded content or fallback
  const chapterContent = content?.theory ? content : {
    theory: {
      overview: "Content coming soon...",
      keyConcepts: [],
      complexity: { time: "TBD", space: "TBD" }
    },
    practiceProblems: [],
    steps: []
  };

  const difficultyColors = {
    easy: "bg-green-500/20 text-green-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    hard: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/book/${book.id}`)}
              className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            >
              <ChevronLeft size={18} />
              {book.title}
            </button>
            <span className="text-border">/</span>
            <span className="text-sm font-medium text-foreground">{chapter.title}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Main Content */}
          <div className="space-y-6">
            {/* Chapter Header */}
            <div className="rounded-lg border border-border bg-accent/30 p-6">
              <div className="mb-4 flex items-center gap-3">
                <span 
                  className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
                  style={{ backgroundColor: `${book.accentColor}20`, color: book.accentColor }}
                >
                  {chapter.order}
                </span>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{chapter.title}</h1>
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {chapter.estimatedTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target size={14} />
                      {chapter.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="flex gap-2 border-t border-border pt-4">
                {[
                  { id: "theory", label: "Theory", icon: BookOpen },
                  { id: "visualizer", label: "Visualizer", icon: Play },
                  { id: "practice", label: "Practice", icon: Code },
                  { id: "minigame", label: "Minigame", icon: Gamepad2 },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? "bg-foreground text-background"
                        : "text-muted hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-lg border border-border bg-accent/30 p-6"
              >
                {activeTab === "theory" && (
                  <div className="space-y-8">
                    {/* Overview */}
                    {chapterContent.theory?.overview && (
                      <section>
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                          <Lightbulb size={20} style={{ color: book.accentColor }} />
                          Overview
                        </h2>
                        <div className="prose prose-invert max-w-none">
                          <p className="leading-relaxed text-muted text-base">
                            <MixedText>{chapterContent.theory.overview}</MixedText>
                          </p>
                        </div>
                      </section>
                    )}

                    {/* Theory Sections */}
                    {chapterContent.theory?.sections?.map((section: any, index: number) => (
                      <section key={index} className="border-t border-border pt-6">
                        <h3 className="mb-4 text-lg font-semibold text-foreground">
                          {section.title}
                        </h3>
                        <div className="prose prose-invert max-w-none">
                          <p className="leading-relaxed text-muted">
                            <MixedText>{section.content}</MixedText>
                          </p>
                        </div>
                        
                        {/* Key Points */}
                        {section.keyPoints && (
                          <ul className="mt-4 space-y-2">
                            {section.keyPoints.map((point: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted">
                                <span style={{ color: book.accentColor }}>•</span>
                                {point}
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    ))}

                    {/* Key Concepts */}
                    {chapterContent.theory?.keyConcepts?.length > 0 && (
                      <section className="border-t border-border pt-6">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                          <Target size={20} style={{ color: book.accentColor }} />
                          Key Concepts
                        </h2>
                        <div className="grid gap-4">
                          {chapterContent.theory.keyConcepts.map((concept: any, index: number) => (
                            <div 
                              key={index}
                              className="rounded-lg border border-border bg-background/50 p-5"
                            >
                              <h3 className="mb-2 font-semibold text-foreground">{concept.name}</h3>
                              <p className="text-sm text-muted leading-relaxed"><MixedText>{concept.description}</MixedText></p>
                              {concept.examples && (
                                <div className="mt-3 text-xs text-muted">
                                  <strong>Examples:</strong> {concept.examples.join(", ")}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Complexity */}
                    {chapterContent.theory?.complexity && (
                      <section className="border-t border-border pt-6">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-foreground">
                          <Calculator size={20} style={{ color: book.accentColor }} />
                          Complexity Analysis
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(chapterContent.theory.complexity).map(([key, value]: [string, any]) => (
                            <div key={key} className="rounded-lg border border-border bg-background/50 px-4 py-3">
                              <span className="text-xs text-muted uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <p className="font-mono text-sm text-foreground mt-1"><MixedText>{value}</MixedText></p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                )}

                {activeTab === "practice" && (
                  <div className="space-y-4">
                    <h2 className="mb-4 text-lg font-semibold text-foreground">
                      Practice Problems ({chapterContent.practiceProblems?.length || 0})
                    </h2>
                    {chapterContent.practiceProblems?.map((problem: any, index: number) => (
                      <div 
                        key={problem.id}
                        className="rounded-lg border border-border bg-background/50 p-4"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-medium text-foreground">{problem.title}</h3>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${difficultyColors[problem.difficulty as keyof typeof difficultyColors]}`}>
                            {problem.difficulty}
                          </span>
                        </div>
                        <p className="mb-4 text-sm text-muted"><MixedText>{problem.description}</MixedText></p>
                        
                        {/* Hints */}
                        <div className="space-y-2">
                          {problem.hints.map((hint: string, hintIndex: number) => (
                            <div key={hintIndex}>
                              {showHint === index ? (
                                <div className="rounded bg-accent/50 p-3 text-sm text-muted">
                                  <span className="font-medium text-foreground">Hint {hintIndex + 1}:</span> <MixedText>{hint}</MixedText>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowHint(index)}
                                  className="text-xs text-muted hover:text-foreground"
                                >
                                  Show Hint {hintIndex + 1}
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Code Editor Placeholder */}
                        <div className="mt-4 rounded-lg border border-border bg-[#0d0d0d] p-4">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-muted">Solution</span>
                            <button className="rounded bg-foreground px-3 py-1 text-xs text-background hover:bg-foreground/90">
                              Run Code
                            </button>
                          </div>
                          <pre className="overflow-x-auto text-sm text-muted">
                            <code>{`// Write your solution here
function solve(input) {
  // Your code
  return result;
}`}</code>
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "visualizer" && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Algorithm Visualizer</h2>
                    {VisualizerComponent ? (
                      <div className="rounded-lg border border-border bg-background/50 overflow-hidden" style={{ height: "500px" }}>
                        <Suspense fallback={<div className="flex h-full items-center justify-center text-muted">Loading visualizer...</div>}>
                          <VisualizerComponent />
                        </Suspense>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-background/50 p-8 text-center">
                        <Play size={48} className="mx-auto mb-4 text-muted" />
                        <p className="text-muted">Visualizer coming soon...</p>
                        <p className="mt-2 text-sm text-muted">
                          Watch step-by-step execution of the algorithm
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "minigame" && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Interactive Minigame</h2>
                    {MinigameComponent ? (
                      <div className="rounded-lg border border-border bg-background/50 overflow-hidden" style={{ height: "500px" }}>
                        <Suspense fallback={<div className="flex h-full items-center justify-center text-muted">Loading minigame...</div>}>
                          <MinigameComponent />
                        </Suspense>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-border bg-background/50 p-8 text-center">
                        <Gamepad2 size={48} className="mx-auto mb-4 text-muted" />
                        <p className="text-muted">Minigame coming soon...</p>
                        <p className="mt-2 text-sm text-muted">
                          Practice with interactive challenges
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="rounded-lg border border-border bg-accent/30 p-4">
              <h3 className="mb-3 font-medium text-foreground">Chapter Progress</h3>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted">{chapter.order} of {book.chapters.length}</span>
                <span className="text-muted">
                  {Math.round((chapter.order / book.chapters.length) * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-accent">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{ 
                    width: `${(chapter.order / book.chapters.length) * 100}%`,
                    backgroundColor: book.accentColor 
                  }}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="space-y-2">
              {prevChapter && (
                <button
                  onClick={() => router.push(`/book/${book.id}/chapter/${prevChapter.id}`)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-accent/30 p-4 text-left transition-colors hover:bg-accent/50"
                >
                  <ChevronLeft size={18} className="text-muted" />
                  <div>
                    <span className="text-xs text-muted">Previous</span>
                    <p className="text-sm font-medium text-foreground">{prevChapter.title}</p>
                  </div>
                </button>
              )}
              {nextChapter && (
                <button
                  onClick={() => router.push(`/book/${book.id}/chapter/${nextChapter.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-accent/30 p-4 text-left transition-colors hover:bg-accent/50"
                >
                  <div>
                    <span className="text-xs text-muted">Next</span>
                    <p className="text-sm font-medium text-foreground">{nextChapter.title}</p>
                  </div>
                  <ChevronRight size={18} className="text-muted" />
                </button>
              )}
            </div>

            {/* Book Info */}
            <div className="rounded-lg border border-border bg-accent/30 p-4">
              <h3 className="mb-2 font-medium text-foreground">{book.title}</h3>
              <p className="text-sm text-muted">{book.subtitle}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
