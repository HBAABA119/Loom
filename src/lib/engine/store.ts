import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

// Types
export interface NodeData {
  id: string;
  x: number;
  y: number;
  value: string | number;
  isActive?: boolean;
  isHighlighted?: boolean;
  glowColor?: string;
}

export interface EdgeData {
  id: string;
  from: string;
  to: string;
  isActive?: boolean;
}

export interface ArrayData {
  id: string;
  elements: (string | number | null)[];
  capacity: number;
  isActive?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  feedback: "correct" | "early" | "late" | "invalid" | "incorrect";
  message: string;
}

// Timeline State
interface TimelineState {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  setStep: (step: number) => void;
  setTotalSteps: (total: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setPlaybackSpeed: (speed: number) => void;
}

// Visualizer State
interface VisualizerState {
  nodes: Map<string, NodeData>;
  edges: EdgeData[];
  arrays: Map<string, ArrayData>;
  updateNodePosition: (id: string, x: number, y: number) => void;
  updateNodeState: (id: string, updates: Partial<NodeData>) => void;
  setNodes: (nodes: NodeData[]) => void;
  setEdges: (edges: EdgeData[]) => void;
  setArrayData: (id: string, data: Omit<ArrayData, "id">) => void;
  resetVisualizer: () => void;
}

// Code Highlight State
interface CodeHighlightState {
  activeLines: number[];
  language: string;
  setActiveLines: (lines: number[]) => void;
  setLanguage: (lang: string) => void;
}

// Minigame State
interface MinigameState {
  isActive: boolean;
  userState: unknown;
  validationResult: ValidationResult | null;
  startMinigame: (initialState: unknown) => void;
  updateUserState: (state: unknown) => void;
  setValidationResult: (result: ValidationResult) => void;
  endMinigame: () => void;
}

// Combined Store Type
export type RootState = TimelineState & VisualizerState & CodeHighlightState & MinigameState;

export const useStore = create<RootState>()(
  subscribeWithSelector((set, get) => ({
    // Timeline
    currentStep: 0,
    totalSteps: 0,
    isPlaying: false,
    playbackSpeed: 1,
    setStep: (step) => set({ currentStep: Math.max(0, Math.min(step, get().totalSteps - 1)) }),
    setTotalSteps: (total) => set({ totalSteps: total }),
    nextStep: () => {
      const { currentStep, totalSteps } = get();
      if (currentStep < totalSteps - 1) {
        set({ currentStep: currentStep + 1 });
      } else {
        set({ isPlaying: false });
      }
    },
    prevStep: () => {
      const { currentStep } = get();
      set({ currentStep: Math.max(0, currentStep - 1) });
    },
    play: () => set({ isPlaying: true }),
    pause: () => set({ isPlaying: false }),
    togglePlay: () => set({ isPlaying: !get().isPlaying }),
    setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),

    // Visualizer
    nodes: new Map(),
    edges: [],
    arrays: new Map(),
    updateNodePosition: (id, x, y) =>
      set((state) => {
        const nodes = new Map(state.nodes);
        const node = nodes.get(id);
        if (node) {
          nodes.set(id, { ...node, x, y });
        }
        return { nodes };
      }),
    updateNodeState: (id, updates) =>
      set((state) => {
        const nodes = new Map(state.nodes);
        const node = nodes.get(id);
        if (node) {
          nodes.set(id, { ...node, ...updates });
        }
        return { nodes };
      }),
    setNodes: (nodes) =>
      set(() => {
        const nodeMap = new Map<string, NodeData>();
        nodes.forEach((node) => nodeMap.set(node.id, node));
        return { nodes: nodeMap };
      }),
    setEdges: (edges) => set({ edges }),
    setArrayData: (id, data) =>
      set((state) => {
        const arrays = new Map(state.arrays);
        arrays.set(id, { ...data, id });
        return { arrays };
      }),
    resetVisualizer: () => set({ nodes: new Map(), edges: [], arrays: new Map() }),

    // Code Highlight
    activeLines: [],
    language: "typescript",
    setActiveLines: (lines) => set({ activeLines: lines }),
    setLanguage: (lang) => set({ language: lang }),

    // Minigame
    isActive: false,
    userState: null,
    validationResult: null,
    startMinigame: (initialState) =>
      set({ isActive: true, userState: initialState, validationResult: null }),
    updateUserState: (state) => set({ userState: state }),
    setValidationResult: (result) => set({ validationResult: result }),
    endMinigame: () =>
      set({ isActive: false, userState: null, validationResult: null }),
  }))
);

// Selector hooks for performance
export const useTimeline = () => {
  const currentStep = useStore((state) => state.currentStep);
  const totalSteps = useStore((state) => state.totalSteps);
  const isPlaying = useStore((state) => state.isPlaying);
  const playbackSpeed = useStore((state) => state.playbackSpeed);
  const setStep = useStore((state) => state.setStep);
  const setTotalSteps = useStore((state) => state.setTotalSteps);
  const nextStep = useStore((state) => state.nextStep);
  const prevStep = useStore((state) => state.prevStep);
  const play = useStore((state) => state.play);
  const pause = useStore((state) => state.pause);
  const togglePlay = useStore((state) => state.togglePlay);
  const setPlaybackSpeed = useStore((state) => state.setPlaybackSpeed);
  return { currentStep, totalSteps, isPlaying, playbackSpeed, setStep, setTotalSteps, nextStep, prevStep, play, pause, togglePlay, setPlaybackSpeed };
};

export const useVisualizer = () => {
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const arrays = useStore((state) => state.arrays);
  const updateNodePosition = useStore((state) => state.updateNodePosition);
  const updateNodeState = useStore((state) => state.updateNodeState);
  const setNodes = useStore((state) => state.setNodes);
  const setEdges = useStore((state) => state.setEdges);
  const setArrayData = useStore((state) => state.setArrayData);
  const resetVisualizer = useStore((state) => state.resetVisualizer);
  return { nodes, edges, arrays, updateNodePosition, updateNodeState, setNodes, setEdges, setArrayData, resetVisualizer };
};

export const useCodeHighlight = () => {
  const activeLines = useStore((state) => state.activeLines);
  const language = useStore((state) => state.language);
  const setActiveLines = useStore((state) => state.setActiveLines);
  const setLanguage = useStore((state) => state.setLanguage);
  return { activeLines, language, setActiveLines, setLanguage };
};

export const useMinigame = () => {
  const isActive = useStore((state) => state.isActive);
  const userState = useStore((state) => state.userState);
  const validationResult = useStore((state) => state.validationResult);
  const startMinigame = useStore((state) => state.startMinigame);
  const updateUserState = useStore((state) => state.updateUserState);
  const setValidationResult = useStore((state) => state.setValidationResult);
  const endMinigame = useStore((state) => state.endMinigame);
  return { isActive, userState, validationResult, startMinigame, updateUserState, setValidationResult, endMinigame };
};
