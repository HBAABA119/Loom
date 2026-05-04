declare module "katex" {
  export interface KatexOptions {
    displayMode?: boolean;
    throwOnError?: boolean;
    errorColor?: string;
    macros?: Record<string, string>;
    minRuleThickness?: number;
    colorIsTextColor?: boolean;
    maxSize?: number;
    maxExpand?: number;
    strict?: boolean | "ignore" | "warn" | "error" | ((errorCode: string) => "ignore" | "warn" | "error");
    trust?: boolean;
    globalGroup?: boolean;
  }

  export function render(
    tex: string,
    element: HTMLElement,
    options?: KatexOptions
  ): void;

  export function renderToString(
    tex: string,
    options?: KatexOptions
  ): string;

  export function parse(
    tex: string,
    options?: KatexOptions
  ): unknown;
}
