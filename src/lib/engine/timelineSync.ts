import { useStore } from "./store";

interface TimelineSyncOptions {
  targetFPS?: number;
  batchFrames?: number;
}

export class TimelineSync {
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private targetFPS: number;
  private batchFrames: number;
  private frameInterval: number;
  private stepInterval: number; // ms between steps at 1x speed
  private lastStepTime = 0;

  constructor(options: TimelineSyncOptions = {}) {
    this.targetFPS = options.targetFPS ?? 60;
    this.batchFrames = options.batchFrames ?? 3;
    this.frameInterval = 1000 / this.targetFPS;
    this.stepInterval = 2000; // 2 seconds per step at 1x speed (slower for learning)
  }

  start(): void {
    if (this.animationFrameId !== null) return;
    this.lastFrameTime = performance.now();
    this.lastStepTime = performance.now();
    this.frameCount = 0;
    this.tick();
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private tick = (): void => {
    const now = performance.now();
    const delta = now - this.lastFrameTime;

    if (delta >= this.frameInterval) {
      this.lastFrameTime = now - (delta % this.frameInterval);
      this.frameCount++;

      // Get current state directly from store (bypass React render cycle)
      const state = useStore.getState();

      if (state.isPlaying) {
        // Time-based step advancement for consistent speed
        const timeSinceLastStep = now - this.lastStepTime;
        const adjustedInterval = this.stepInterval / Math.max(0.1, state.playbackSpeed);
        
        if (timeSinceLastStep >= adjustedInterval) {
          this.lastStepTime = now;
          
          if (state.currentStep < state.totalSteps - 1) {
            state.setStep(state.currentStep + 1);
          } else {
            state.pause();
          }
        }
      } else {
        // Reset step timer when paused so we don't jump on resume
        this.lastStepTime = now;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.tick);
  };

  getCurrentFPS(): number {
    return this.targetFPS;
  }
}

// Singleton instance for app-wide timeline sync
let globalTimelineSync: TimelineSync | null = null;

export function getTimelineSync(): TimelineSync {
  if (!globalTimelineSync) {
    globalTimelineSync = new TimelineSync();
  }
  return globalTimelineSync;
}

export function initTimelineSync(): void {
  const sync = getTimelineSync();
  sync.start();
}

export function destroyTimelineSync(): void {
  if (globalTimelineSync) {
    globalTimelineSync.stop();
    globalTimelineSync = null;
  }
}
