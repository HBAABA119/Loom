"use client";

import { useEffect, useRef } from "react";
import katex from "katex";

interface LatexRendererProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export default function LatexRenderer({ 
  latex, 
  displayMode = false,
  className = "" 
}: LatexRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(latex, containerRef.current, {
          displayMode,
          throwOnError: false,
          strict: false,
        });
      } catch (error) {
        console.error("KaTeX render error:", error);
        containerRef.current.textContent = latex;
      }
    }
  }, [latex, displayMode]);

  return (
    <span 
      ref={containerRef} 
      className={`${displayMode ? "block my-4 text-center" : "inline"} ${className}`}
    />
  );
}

// Component for rendering mixed text with LaTeX
export function MixedText({ 
  children, 
  className = "" 
}: { 
  children: string; 
  className?: string;
}) {
  // Simple regex to find LaTeX patterns: $...$ for inline, $$...$$ for display
  const parts = children.split(/(\$\$[\s\S]*?\$\$|\$[^\$]*\$)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const latex = part.slice(2, -2);
          return <LatexRenderer key={index} latex={latex} displayMode />;
        } else if (part.startsWith("$") && part.endsWith("$")) {
          const latex = part.slice(1, -1);
          return <LatexRenderer key={index} latex={latex} />;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
