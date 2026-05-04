"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Clock, PlayCircle, BookOpen, Binary, Brain, Cpu, Atom, Lock, Gamepad2 } from "lucide-react";
import { getBookById, Book } from "@/lib/engine/bookRegistry";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Binary,
  Brain,
  Cpu,
  Atom,
  Lock,
  Gamepad2,
};

interface BookPageClientProps {
  book: Book;
  bookId: string;
}

export default function BookPageClient({ book, bookId }: BookPageClientProps) {
  const router = useRouter();

  const Icon = iconMap[book.icon];
  const chaptersByCategory: Record<string, typeof book.chapters> = {};
  
  book.chapters.forEach(chapter => {
    if (!chaptersByCategory[chapter.category]) {
      chaptersByCategory[chapter.category] = [];
    }
    chaptersByCategory[chapter.category].push(chapter);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
          >
            <ChevronLeft size={18} />
            Back to Library
          </button>
          <div className="flex items-center gap-3">
            <div style={{ color: book.accentColor }}>
              <Icon size={20} />
            </div>
            <span className="font-medium text-foreground">{book.title}</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div 
              className="mb-6 inline-flex rounded-2xl p-4"
              style={{ backgroundColor: `${book.accentColor}15` }}
            >
              <div style={{ color: book.accentColor }}>
                <Icon size={48} />
              </div>
            </div>
            <h1 className="mb-3 text-4xl font-bold text-foreground">{book.title}</h1>
            <p className="mb-4 text-lg font-medium" style={{ color: book.accentColor }}>
              {book.subtitle}
            </p>
            <p className="mx-auto max-w-2xl text-muted">{book.description}</p>
            
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <BookOpen size={16} />
                <span>{book.chapters.length} chapters</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>
                  {Math.round(book.chapters.reduce((acc, c) => acc + parseInt(c.estimatedTime), 0) / 60)} hours
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chapters by Category */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {Object.entries(chaptersByCategory).map(([category, chapters], catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
            >
              <h2 className="mb-6 flex items-center gap-3 text-xl font-semibold text-foreground">
                <span 
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: book.accentColor }}
                />
                {category}
              </h2>
              
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <motion.button
                    key={chapter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: catIndex * 0.1 + index * 0.05 }}
                    onClick={() => router.push(`/book/${bookId}/chapter/${chapter.id}`)}
                    className="group flex w-full items-center justify-between rounded-lg border border-border bg-accent/30 p-4 text-left transition-all hover:border-[var(--book-color)] hover:bg-accent/50"
                    style={{ "--book-color": book.accentColor } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-4">
                      <span 
                        className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: `${book.accentColor}20`,
                          color: book.accentColor 
                        }}
                      >
                        {chapter.order}
                      </span>
                      <div>
                        <h3 className="font-medium text-foreground">{chapter.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {chapter.estimatedTime}
                          </span>
                          {chapter.hasVisualizer && (
                            <span className="flex items-center gap-1">
                              <PlayCircle size={12} />
                              Interactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronLeft 
                      size={18} 
                      className="rotate-180 text-muted transition-all group-hover:translate-x-1 group-hover:text-foreground"
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
