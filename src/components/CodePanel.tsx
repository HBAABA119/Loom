"use client";

import { motion } from "framer-motion";
import { useCodeHighlight } from "@/lib/engine/store";

interface CodePanelProps {
  code: string;
  className?: string;
}

export default function CodePanel({ code, className = "" }: CodePanelProps) {
  const { activeLines } = useCodeHighlight();

  const lines = code.split("\n");

  return (
    <div className={`flex h-full flex-col border-l border-border bg-background ${className}`}>
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-medium">Algorithm</h3>
        <span className="text-xs text-muted">TypeScript</span>
      </div>

      {/* Code Editor */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        <div className="flex flex-col gap-0">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isActive = activeLines.includes(lineNumber);

            return (
              <motion.div
                key={lineNumber}
                initial={false}
                animate={{
                  backgroundColor: isActive ? "rgba(255, 255, 255, 0.05)" : "transparent",
                  borderLeftColor: isActive ? "#fff" : "transparent",
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex border-l-2"
              >
                {/* Line Number */}
                <span
                  className={`w-10 select-none pr-3 text-right text-xs ${
                    isActive ? "text-foreground" : "text-muted"
                  }`}
                >
                  {lineNumber}
                </span>

                {/* Code Content */}
                <pre
                  className={`flex-1 whitespace-pre ${
                    isActive ? "text-foreground" : "text-muted"
                  }`}
                >
                  {line || " "}
                </pre>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Terminal Output */}
      <div className="border-t border-border">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted">Output</span>
        </div>
        <div className="h-32 overflow-auto bg-black/50 p-3 font-mono text-xs text-muted">
          <span className="text-green-500">$</span> Ready to execute...
        </div>
      </div>
    </div>
  );
}
