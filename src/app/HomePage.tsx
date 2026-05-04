"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Binary, Brain, Cpu, Atom, Lock, Gamepad2, ChevronRight } from "lucide-react";
import { BOOKS } from "@/lib/engine/bookRegistry";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Binary,
  Brain,
  Cpu,
  Atom,
  Lock,
  Gamepad2,
};

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="mb-4 text-6xl font-bold tracking-tight text-foreground">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] via-[#ff6b9d] to-[#4dffb8]">
                Loom
              </span>
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted">
              Interactive learning platform weaving together Algorithms, AI, Architecture, 
              Quantum, Security, and Physics through playable visualizations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Books Grid */}
      <section className="px-6 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {BOOKS.map((book, index) => {
              const Icon = iconMap[book.icon];
              return (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-accent/50 p-6 transition-all hover:border-[var(--book-color)] hover:shadow-lg"
                  style={{ "--book-color": book.accentColor } as React.CSSProperties}
                  onClick={() => router.push(`/book/${book.id}`)}
                >
                  {/* Glow effect */}
                  <div 
                    className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10"
                    style={{ background: `linear-gradient(135deg, ${book.accentColor}, transparent)` }}
                  />
                  
                  {/* Icon */}
                  <div 
                    className="mb-4 inline-flex rounded-lg p-3"
                    style={{ backgroundColor: `${book.accentColor}20` }}
                  >
                    <div style={{ color: book.accentColor }}>
                      <Icon size={28} className="transition-colors" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="mb-1 text-xl font-semibold text-foreground">
                    {book.title}
                  </h3>
                  <p className="mb-3 text-sm font-medium" style={{ color: book.accentColor }}>
                    {book.subtitle}
                  </p>
                  <p className="mb-4 text-sm text-muted">
                    {book.description}
                  </p>

                  {/* Chapters count */}
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted">
                      {book.chapters.length} chapters
                    </span>
                    <ChevronRight 
                      size={16} 
                      className="transition-transform group-hover:translate-x-1"
                      style={{ color: book.accentColor }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 text-center text-2xl font-semibold text-foreground">
            Why Loom?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-3 inline-flex rounded-lg bg-[#00d4ff]/10 p-3">
                <span className="text-2xl">🎮</span>
              </div>
              <h3 className="mb-2 font-medium text-foreground">Playable</h3>
              <p className="text-sm text-muted">
                Don&apos;t just read—interact. Scrub through animations, adjust parameters, see results instantly.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-3 inline-flex rounded-lg bg-[#ff6b9d]/10 p-3">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="mb-2 font-medium text-foreground">Visual Intuition</h3>
              <p className="text-sm text-muted">
                See how data moves in memory, how gradients flow, how qubits entangle.
              </p>
            </div>
            <div className="text-center">
              <div className="mb-3 inline-flex rounded-lg bg-[#4dffb8]/10 p-3">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="mb-2 font-medium text-foreground">Step-by-Step</h3>
              <p className="text-sm text-muted">
                Every algorithm broken down into micro-steps you can follow at your own pace.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
