"use client";

import { ReactNode, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Minimize2, X } from "lucide-react";

interface ExpandablePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  subtitle?: string;
}

export function ExpandablePanel({ isOpen, onClose, title, children, subtitle }: ExpandablePanelProps) {
  // Handle escape key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-4 md:inset-8 lg:inset-12 z-50 rounded-xl bg-[#0d1117] border border-[#30363d] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22]">
              <div>
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                {subtitle && <p className="text-sm text-[#8b949e] mt-0.5">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-white transition-colors"
                aria-label="Close panel"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ExpandableTriggerProps {
  onClick: () => void;
  title: string;
  icon?: ReactNode;
  description?: string;
  isAvailable?: boolean;
}

export function ExpandableTrigger({ onClick, title, icon, description, isAvailable = true }: ExpandableTriggerProps) {
  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={`w-full group relative overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22] p-6 text-left transition-all duration-300 ${
        isAvailable 
          ? "hover:border-[#58a6ff] hover:bg-[#1c2128] hover:shadow-lg hover:shadow-[#58a6ff]/5 cursor-pointer" 
          : "opacity-50 cursor-not-allowed"
      }`}
    >
      {/* Hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#58a6ff]/0 via-[#58a6ff]/5 to-[#58a6ff]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#21262d] text-[#58a6ff] group-hover:bg-[#58a6ff]/20 transition-colors">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white group-hover:text-[#58a6ff] transition-colors">{title}</h3>
            {description && <p className="text-sm text-[#8b949e] mt-1">{description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 text-[#8b949e] group-hover:text-[#58a6ff] transition-colors">
          <span className="text-xs font-medium hidden sm:inline">Click to expand</span>
          <Maximize2 size={18} />
        </div>
      </div>
    </button>
  );
}
