"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, Pause, RotateCcw, ChevronRight, GitBranch, 
  ArrowRight, Layers, Terminal, Activity, Code,
  Binary, ChevronDown, ChevronUp
} from "lucide-react";

interface ASTNode {
  type: string;
  value?: string | number;
  children: ASTNode[];
  id: string;
}

const expressionExamples = [
  { name: "Simple Add", expr: "3 + 5", description: "Basic binary operation" },
  { name: "Precedence", expr: "2 + 3 * 4", description: "Multiplication before addition" },
  { name: "Parentheses", expr: "(2 + 3) * 4", description: "Parens override precedence" },
  { name: "Nested", expr: "1 + 2 + 3 + 4", description: "Left-associative chain" },
  { name: "Complex", expr: "a + b * c - d / e", description: "Mixed precedence" },
];

export default function ParserVisualizerEnhanced() {
  const [selectedExample, setSelectedExample] = useState(0);
  const [currentExpr, setCurrentExpr] = useState(expressionExamples[0].expr);
  const [ast, setAst] = useState<ASTNode | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const [selectedNode, setSelectedNode] = useState<ASTNode | null>(null);
  const [showTokens, setShowTokens] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(800);

  // Simple recursive descent parser for arithmetic expressions
  const parseExpression = useCallback((tokens: string[]): ASTNode => {
    let pos = 0;
    let nodeId = 0;
    const newId = () => `node-${nodeId++}`;

    // Define all parser functions as function declarations (hoisted)
    function parseExpr(): ASTNode {
      let left = parseTerm();
      while (pos < tokens.length && (tokens[pos] === "+" || tokens[pos] === "-")) {
        const op = tokens[pos];
        pos++;
        const right = parseTerm();
        left = {
          type: "BinaryOp",
          value: op,
          children: [left, right],
          id: newId()
        };
      }
      return left;
    }

    function parseTerm(): ASTNode {
      let left = parsePrimary();
      while (pos < tokens.length && (tokens[pos] === "*" || tokens[pos] === "/")) {
        const op = tokens[pos];
        pos++;
        const right = parsePrimary();
        left = {
          type: "BinaryOp",
          value: op,
          children: [left, right],
          id: newId()
        };
      }
      return left;
    }

    function parsePrimary(): ASTNode {
      const token = tokens[pos];
      if (token === "(") {
        pos++; // consume (
        const node = parseExpr();
        pos++; // consume )
        return node;
      }
      const node: ASTNode = {
        type: "NUMBER",
        value: token,
        children: [],
        id: newId()
      };
      pos++;
      return node;
    }

    return parseExpr();
  }, []);

  // Tokenize the expression
  const tokenize = (expr: string): string[] => {
    return expr
      .replace(/\(/g, " ( ")
      .replace(/\)/g, " ) ")
      .split(/\s+/)
      .filter(t => t.length > 0);
  };

  const tokens = tokenize(currentExpr);

  const buildAST = useCallback(() => {
    const parsed = parseExpression(tokens);
    setAst(parsed);
  }, [tokens, parseExpression]);

  const reset = () => {
    setAst(null);
    setBuildStep(0);
    setIsBuilding(false);
    setSelectedNode(null);
  };

  const handleExampleChange = (idx: number) => {
    setSelectedExample(idx);
    setCurrentExpr(expressionExamples[idx].expr);
    reset();
  };

  // Animated tree builder
  useEffect(() => {
    if (isBuilding && buildStep < tokens.length) {
      const timer = setTimeout(() => {
        setBuildStep(prev => prev + 1);
      }, animationSpeed);
      return () => clearTimeout(timer);
    } else if (buildStep >= tokens.length && isBuilding) {
      setIsBuilding(false);
      buildAST();
    }
  }, [isBuilding, buildStep, tokens.length, animationSpeed, buildAST]);

  // Render AST node recursively
  const renderNode = (node: ASTNode, depth: number = 0): React.JSX.Element => {
    const isSelected = selectedNode?.id === node.id;
    const hasChildren = node.children.length > 0;
    
    const getNodeColor = (type: string) => {
      switch (type) {
        case "BinaryOp": return "#d2a8ff";
        case "NUMBER": return "#79c0ff";
        case "IDENTIFIER": return "#ffa657";
        default: return "#8b949e";
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: depth * 0.1 }}
        className="flex flex-col items-center"
      >
        <motion.button
          onClick={() => setSelectedNode(node)}
          className={`px-4 py-2 rounded-lg font-mono font-bold border-2 transition-all ${
            isSelected
              ? "border-[#58a6ff] bg-[#58a6ff]/20"
              : "border-transparent hover:border-[#30363d]"
          }`}
          style={{ 
            backgroundColor: `${getNodeColor(node.type)}20`,
            color: getNodeColor(node.type),
            marginLeft: depth * 20
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {node.value || node.type}
          {hasChildren && (
            <span className="ml-2 text-xs opacity-60">
              [{node.children.length}]
            </span>
          )}
        </motion.button>
        
        {hasChildren && (
          <div className="flex gap-4 mt-4 relative">
            {/* Connection lines */}
            <svg 
              className="absolute top-0 left-0 w-full h-4 pointer-events-none" 
              style={{ transform: "translateY(-100%)" }}
            >
              {node.children.map((_, i) => (
                <line
                  key={i}
                  x1={`${50}%`}
                  y1="0"
                  x2={`${((i + 1) / (node.children.length + 1)) * 100}%`}
                  y2="100%"
                  stroke="#30363d"
                  strokeWidth="2"
                />
              ))}
            </svg>
            {node.children.map((child, i) => (
              <div key={child.id}>
                {renderNode(child, depth + 1)}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  // Flatten AST for sequential display
  const flattenAST = (node: ASTNode, result: ASTNode[] = []): ASTNode[] => {
    result.push(node);
    node.children.forEach(child => flattenAST(child, result));
    return result;
  };

  const nodeCount = ast ? flattenAST(ast).length : 0;
  const treeDepth = ast ? Math.max(...flattenAST(ast).map((n, i) => {
    let depth = 0;
    let current = n;
    // This is simplified - real depth calculation would need parent pointers
    return depth;
  })) + 1 : 0;

  return (
    <div className="w-full h-full flex flex-col bg-[#0d1117] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#58a6ff]/20 rounded-lg">
            <GitBranch size={20} className="text-[#58a6ff]" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Parser & AST Builder</h3>
            <p className="text-[#8b949e] text-sm">See expressions become trees</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTokens(!showTokens)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showTokens ? "bg-[#58a6ff] text-white" : "bg-[#21262d] text-[#8b949e]"
            }`}
          >
            Tokens
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/3 flex flex-col border-r border-[#30363d]">
          {/* Example Selector */}
          <div className="p-3 border-b border-[#30363d]">
            <label className="text-[#8b949e] text-xs mb-2 block">Expression</label>
            <select
              value={selectedExample}
              onChange={(e) => handleExampleChange(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-white text-sm mb-2"
            >
              {expressionExamples.map((ex, i) => (
                <option key={i} value={i}>{ex.name}</option>
              ))}
            </select>
            <p className="text-[#8b949e] text-xs">{expressionExamples[selectedExample].description}</p>
          </div>

          {/* Expression Display */}
          <div className="flex-1 p-4">
            <div className="text-[#8b949e] text-xs mb-2">Input Expression:</div>
            <div className="p-4 bg-[#21262d] rounded-lg font-mono text-lg text-center text-white">
              {currentExpr}
            </div>

            {/* Tokens */}
            {showTokens && (
              <div className="mt-4">
                <div className="text-[#8b949e] text-xs mb-2 flex items-center gap-1">
                  <Layers size={12} />
                  Tokens
                </div>
                <div className="flex flex-wrap gap-1">
                  {tokens.map((token, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: i < buildStep ? 1 : 0.4, scale: 1 }}
                      className={`px-2 py-1 rounded text-xs font-mono ${
                        token === "+" || token === "-" || token === "*" || token === "/"
                          ? "bg-[#d2a8ff]/20 text-[#d2a8ff]"
                          : token === "(" || token === ")"
                          ? "bg-[#8b949e]/20 text-[#8b949e]"
                          : "bg-[#79c0ff]/20 text-[#79c0ff]"
                      }`}
                    >
                      {token}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-[#30363d] bg-[#161b22]">
            <div className="flex items-center gap-2 mb-3">
              <button
                onClick={() => {
                  setIsBuilding(!isBuilding);
                  if (!isBuilding && buildStep === 0) {
                    buildAST();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg font-medium transition-colors"
              >
                {isBuilding ? <Pause size={16} /> : <Play size={16} />}
                {isBuilding ? "Pause" : "Build AST"}
              </button>
              <button
                onClick={reset}
                className="p-2 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg transition-colors"
              >
                <RotateCcw size={16} />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#8b949e]">Speed:</span>
              <input
                type="range"
                min="200"
                max="1500"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Right Panel - AST Visualization */}
        <div className="flex-1 flex flex-col bg-[#0d1117]">
          {/* Tree View */}
          <div className="flex-1 overflow-auto p-6">
            {ast ? (
              <div className="min-w-max">
                {renderNode(ast)}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-[#6e7681]">
                <div className="text-center">
                  <GitBranch size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Click "Build AST" to visualize the parse tree</p>
                </div>
              </div>
            )}
          </div>

          {/* Node Details */}
          {selectedNode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 border-t border-[#30363d] bg-[#161b22]"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="px-4 py-2 rounded-lg font-mono font-bold"
                  style={{ 
                    backgroundColor: selectedNode.type === "BinaryOp" 
                      ? "#d2a8ff20" 
                      : "#79c0ff20",
                    color: selectedNode.type === "BinaryOp" 
                      ? "#d2a8ff" 
                      : "#79c0ff"
                  }}
                >
                  {selectedNode.value || selectedNode.type}
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{selectedNode.type}</div>
                  <div className="text-[#8b949e] text-sm">
                    {selectedNode.children.length > 0 
                      ? `Operator with ${selectedNode.children.length} operands`
                      : "Leaf node (operand)"
                    }
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[#8b949e] text-xs">Node ID</div>
                  <div className="text-white font-mono text-sm">{selectedNode.id}</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="p-3 border-t border-[#30363d] bg-[#0d1117]">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 bg-[#21262d] rounded">
                <div className="text-[#8b949e]">Tokens</div>
                <div className="text-white font-bold">{tokens.length}</div>
              </div>
              <div className="p-2 bg-[#21262d] rounded">
                <div className="text-[#8b949e]">AST Nodes</div>
                <div className="text-white font-bold">{nodeCount}</div>
              </div>
              <div className="p-2 bg-[#21262d] rounded">
                <div className="text-[#8b949e]">Operators</div>
                <div className="text-white font-bold">
                  {ast ? flattenAST(ast).filter(n => n.type === "BinaryOp").length : 0}
                </div>
              </div>
              <div className="p-2 bg-[#21262d] rounded">
                <div className="text-[#8b949e]">Leaves</div>
                <div className="text-white font-bold">
                  {ast ? flattenAST(ast).filter(n => n.children.length === 0).length : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
