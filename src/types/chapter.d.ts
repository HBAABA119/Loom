declare module "@/content/chapters/*.json" {
  interface ComplexityData {
    access: string;
    search: string;
    insertion: string;
    deletion: string;
    space: string;
  }

  interface KeyConcept {
    name: string;
    description: string;
  }

  interface Problem {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
  }

  interface AlgorithmStep {
    step: number;
    action: string;
    value?: number;
    arrayState?: (number | null)[];
    capacity?: number;
    activeIndex?: number | null;
    highlightLines: number[];
    description: string;
  }

  interface Minigame {
    type: string;
    title: string;
    description: string;
    instructions: string[];
  }

  interface Theory {
    overview: string;
    keyConcepts: KeyConcept[];
    complexity: ComplexityData;
  }

  interface Chapter {
    id: string;
    title: string;
    category: "fundamentals" | "intermediate" | "advanced";
    theory: Theory;
    problems: Problem[];
    algorithmSteps: AlgorithmStep[];
    minigame: Minigame;
  }

  const content: Chapter;
  export default content;
}
