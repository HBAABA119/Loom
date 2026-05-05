// Loom - Multi-Book Learning Platform
// Book Registry - Defines all 6 books and their chapter structures

export interface Book {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: "dsa" | "ai" | "architecture" | "quantum" | "security" | "physics";
  accentColor: string;
  icon: string;
  chapters: ChapterMeta[];
}

export interface ChapterMeta {
  id: string;
  title: string;
  bookId: string;
  order: number;
  category: string;
  hasVisualizer: boolean;
  hasMinigame: boolean;
  hasPractice: boolean;
  estimatedTime: string; // e.g., "15 min"
}

export const BOOKS: Book[] = [
  {
    id: "book-dsa",
    title: "Data Structures & Algorithms",
    subtitle: "The Foundation",
    description: "Visualize how data moves in memory. From Big O to Graphs, master the building blocks of computing.",
    category: "dsa",
    accentColor: "#00d4ff",
    icon: "Binary",
    chapters: [
      // Book 1: DSA - 30 chapters organized by topic
      // Foundations
      { id: "01-big-o", title: "Big O Notation", bookId: "book-dsa", order: 1, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "20 min" },
      { id: "02-memory", title: "Memory Management", bookId: "book-dsa", order: 2, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      
      // Linear Structures
      { id: "03-arrays", title: "Arrays & Operations", bookId: "book-dsa", order: 3, category: "Linear Structures", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "04-strings", title: "String Algorithms", bookId: "book-dsa", order: 4, category: "Linear Structures", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      { id: "05-linked-lists", title: "Linked Lists", bookId: "book-dsa", order: 5, category: "Linear Structures", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "06-stacks", title: "Stacks (LIFO)", bookId: "book-dsa", order: 6, category: "Linear Structures", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "07-queues", title: "Queues (FIFO)", bookId: "book-dsa", order: 7, category: "Linear Structures", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      
      // Sorting & Searching
      { id: "08-searching", title: "Searching Algorithms", bookId: "book-dsa", order: 8, category: "Searching", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      { id: "09-hash-tables", title: "Hash Tables", bookId: "book-dsa", order: 9, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "10-bst", title: "Binary Search Trees", bookId: "book-dsa", order: 10, category: "Trees", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "11-heaps", title: "Heaps & Priority Queues", bookId: "book-dsa", order: 11, category: "Trees", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "12-graphs", title: "Graph Fundamentals", bookId: "book-dsa", order: 12, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "13-dfs-bfs", title: "BFS & DFS Traversals", bookId: "book-dsa", order: 13, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "14-shortest-paths", title: "Shortest Path Algorithms", bookId: "book-dsa", order: 14, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "15-mst", title: "Minimum Spanning Tree", bookId: "book-dsa", order: 15, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      
      // Advanced Data Structures
      { id: "16-tries", title: "Tries (Prefix Trees)", bookId: "book-dsa", order: 16, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "17-segment-trees", title: "Segment Trees", bookId: "book-dsa", order: 17, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "18-fenwick-trees", title: "Fenwick Trees", bookId: "book-dsa", order: 18, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "19-disjoint-sets", title: "Disjoint Set Union (Union-Find)", bookId: "book-dsa", order: 19, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      
      // Algorithms
      { id: "20-dp-fundamentals", title: "DP Fundamentals", bookId: "book-dsa", order: 20, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "60 min" },
      { id: "21-advanced-dp", title: "Advanced DP", bookId: "book-dsa", order: 21, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "55 min" },
      { id: "22-greedy", title: "Greedy Algorithms", bookId: "book-dsa", order: 22, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "23-backtracking", title: "Backtracking", bookId: "book-dsa", order: 23, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "24-bit-manipulation", title: "Bit Manipulation", bookId: "book-dsa", order: 24, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "25-math-primes", title: "Math & Primes", bookId: "book-dsa", order: 25, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "26-suffix-trees", title: "Suffix Trees", bookId: "book-dsa", order: 26, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "27-kd-trees", title: "K-D Trees", bookId: "book-dsa", order: 27, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "28-bloom-filters", title: "Bloom Filters", bookId: "book-dsa", order: 28, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "29-network-flow", title: "Network Flow", bookId: "book-dsa", order: 29, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "30-computational-geometry", title: "Computational Geometry", bookId: "book-dsa", order: 30, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
    ]
  },
  
  // Book 2: Neural Network Atlas
  {
    id: "book-ai",
    title: "The Neural Network Atlas",
    subtitle: "AI & Machine Learning",
    description: "Play with live neural networks. Watch decision boundaries warp as you train. Visualize backpropagation in real-time.",
    category: "ai",
    accentColor: "#ff6b9d",
    icon: "Brain",
    chapters: [
      { id: "ai-01-perceptron", title: "The Perceptron", bookId: "book-ai", order: 1, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "ai-02-activation", title: "Activation Functions", bookId: "book-ai", order: 2, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      { id: "ai-03-backprop", title: "Backpropagation", bookId: "book-ai", order: 3, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "ai-04-gradient", title: "Gradient Descent", bookId: "book-ai", order: 4, category: "Training", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "ai-05-learning-rate", title: "Learning Rate & Optimizers", bookId: "book-ai", order: 5, category: "Training", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "ai-06-mlp", title: "Multi-Layer Perceptron", bookId: "book-ai", order: 6, category: "Neural Networks", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "ai-07-cnn", title: "Convolutional Neural Networks", bookId: "book-ai", order: 7, category: "Deep Learning", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "ai-08-rnn", title: "Recurrent Neural Networks", bookId: "book-ai", order: 8, category: "Deep Learning", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "ai-09-transformers", title: "Transformers & Attention", bookId: "book-ai", order: 9, category: "Deep Learning", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "60 min" },
      { id: "ai-10-gan", title: "Generative Adversarial Networks", bookId: "book-ai", order: 10, category: "Generative AI", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "55 min" },
      { id: "ai-11-autoencoder", title: "Autoencoders", bookId: "book-ai", order: 11, category: "Unsupervised", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "ai-12-reinforcement", title: "Reinforcement Learning", bookId: "book-ai", order: 12, category: "RL", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "60 min" },
      { id: "ai-13-regularization", title: "Regularization & Dropout", bookId: "book-ai", order: 13, category: "Training", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "ai-14-batch-norm", title: "Batch Normalization", bookId: "book-ai", order: 14, category: "Training", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "ai-15-loss-functions", title: "Loss Functions", bookId: "book-ai", order: 15, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
    ]
  },
  
  // Book 3: Silicon Blueprint
  {
    id: "book-arch",
    title: "The Silicon Blueprint",
    subtitle: "Computer Architecture",
    description: "Go under the hood. Watch bits move through registers, ALU operations, and memory. Build a CPU from logic gates.",
    category: "architecture",
    accentColor: "#4dffb8",
    icon: "Cpu",
    chapters: [
      { id: "arch-01-binary", title: "Binary & Number Systems", bookId: "book-arch", order: 1, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      { id: "arch-02-logic", title: "Logic Gates", bookId: "book-arch", order: 2, category: "Digital Logic", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "arch-03-adder", title: "Adders & ALU", bookId: "book-arch", order: 3, category: "Digital Logic", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "arch-04-flipflop", title: "Flip-Flops & Memory", bookId: "book-arch", order: 4, category: "Memory", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "arch-05-registers", title: "Registers & Counters", bookId: "book-arch", order: 5, category: "Memory", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "arch-06-ram", title: "RAM Architecture", bookId: "book-arch", order: 6, category: "Memory", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "arch-07-cpu", title: "CPU Architecture", bookId: "book-arch", order: 7, category: "Processor", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "arch-08-instructions", title: "Instruction Cycle", bookId: "book-arch", order: 8, category: "Processor", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "arch-09-pipelining", title: "Pipelining", bookId: "book-arch", order: 9, category: "Performance", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "arch-10-cache", title: "Cache Memory", bookId: "book-arch", order: 10, category: "Memory", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "arch-11-assembly", title: "Assembly Language", bookId: "book-arch", order: 11, category: "Programming", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "arch-12-virtual", title: "Virtual Memory", bookId: "book-arch", order: 12, category: "Memory", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
    ]
  },
  
  // Book 4: Quantum Canvas
  {
    id: "book-quantum",
    title: "The Quantum Canvas",
    subtitle: "Quantum Computing",
    description: "Bloch spheres, superposition, and entanglement made tangible. Drag quantum gates and watch probability amplitudes evolve.",
    category: "quantum",
    accentColor: "#a855f7",
    icon: "Atom",
    chapters: [
      { id: "q-01-qubits", title: "Qubits vs Classical Bits", bookId: "book-quantum", order: 1, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "q-02-superposition", title: "Superposition", bookId: "book-quantum", order: 2, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "q-03-measurement", title: "Measurement & Collapse", bookId: "book-quantum", order: 3, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "q-04-bloch", title: "Bloch Sphere", bookId: "book-quantum", order: 4, category: "Visualization", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "q-05-gates", title: "Quantum Gates", bookId: "book-quantum", order: 5, category: "Operations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "q-06-hadamard", title: "Hadamard Gate", bookId: "book-quantum", order: 6, category: "Operations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      { id: "q-07-entanglement", title: "Quantum Entanglement", bookId: "book-quantum", order: 7, category: "Phenomena", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "q-08-cnot", title: "CNOT & Multi-Qubit Gates", bookId: "book-quantum", order: 8, category: "Operations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "q-09-circuits", title: "Quantum Circuits", bookId: "book-quantum", order: 9, category: "Programming", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "q-10-algorithms", title: "Quantum Algorithms", bookId: "book-quantum", order: 10, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "55 min" },
      { id: "q-11-deutsch", title: "Deutsch-Jozsa Algorithm", bookId: "book-quantum", order: 11, category: "Algorithms", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "q-12-grover", title: "Grover's Search", bookId: "book-quantum", order: 12, category: "Algorithms", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "q-13-shor", title: "Shor's Algorithm", bookId: "book-quantum", order: 13, category: "Algorithms", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "60 min" },
      { id: "q-14-teleportation", title: "Quantum Teleportation", bookId: "book-quantum", order: 14, category: "Phenomena", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "q-15-error", title: "Quantum Error Correction", bookId: "book-quantum", order: 15, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
    ]
  },
  
  // Book 5: Cryptographic Vault
  {
    id: "book-crypto",
    title: "The Cryptographic Vault",
    subtitle: "Cybersecurity",
    description: "Watch math turn into secrets. Visualize AES rounds, RSA key generation, and handshake protocols. Simulate man-in-the-middle attacks.",
    category: "security",
    accentColor: "#22d3ee",
    icon: "Lock",
    chapters: [
      { id: "crypto-01-classical", title: "Classical Ciphers", bookId: "book-crypto", order: 1, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "crypto-02-symmetric", title: "Symmetric Encryption", bookId: "book-crypto", order: 2, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "crypto-03-asymmetric", title: "Public Key Cryptography", bookId: "book-crypto", order: 3, category: "Intermediate", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "crypto-04-hashing", title: "Hash Functions", bookId: "book-crypto", order: 4, category: "Intermediate", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "crypto-05-signatures", title: "Digital Signatures", bookId: "book-crypto", order: 5, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "crypto-06-keyexchange", title: "Key Exchange", bookId: "book-crypto", order: 6, category: "Intermediate", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "crypto-07-mac", title: "Message Authentication Codes", bookId: "book-crypto", order: 7, category: "Intermediate", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "crypto-08-protocols", title: "Cryptographic Protocols", bookId: "book-crypto", order: 8, category: "Intermediate", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "55 min" },
      { id: "crypto-09-pki", title: "Public Key Infrastructure", bookId: "book-crypto", order: 9, category: "Intermediate", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "crypto-10-random", title: "Random Number Generation", bookId: "book-crypto", order: 10, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "crypto-11-stream", title: "Stream Ciphers", bookId: "book-crypto", order: 11, category: "Intermediate", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "crypto-12-ecc", title: "Elliptic Curve Cryptography", bookId: "book-crypto", order: 12, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "60 min" },
      { id: "crypto-13-passwords", title: "Password Hashing", bookId: "book-crypto", order: 13, category: "Applied", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "crypto-14-zkp", title: "Zero-Knowledge Proofs", bookId: "book-crypto", order: 14, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "55 min" },
      { id: "crypto-15-postquantum", title: "Post-Quantum Cryptography", bookId: "book-crypto", order: 15, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
    ]
  },
  
  // Book 6: Engine Room (CS Engines)
  {
    id: "book-engine",
    title: "The Engine Room",
    subtitle: "Computer Science Engines",
    description: "Peek under the hood of programming languages. Visualize lexers, parsers, virtual machines, garbage collectors, JIT compilers, and more.",
    category: "architecture",
    accentColor: "#f59e0b",
    icon: "Cpu",
    chapters: [
      { id: "engine-01-lexer", title: "Lexical Analysis & Tokenization", bookId: "book-engine", order: 1, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "engine-02-parser", title: "Parsing & Abstract Syntax Trees", bookId: "book-engine", order: 2, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "engine-03-vm", title: "Virtual Machines & Bytecode", bookId: "book-engine", order: 3, category: "Execution", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "engine-04-gc", title: "Garbage Collection", bookId: "book-engine", order: 4, category: "Memory", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "engine-05-allocator", title: "Memory Allocation Strategies", bookId: "book-engine", order: 5, category: "Memory", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "engine-06-jit", title: "JIT Compilation", bookId: "book-engine", order: 6, category: "Optimization", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "engine-07-types", title: "Type Systems & Type Checking", bookId: "book-engine", order: 7, category: "Intermediate", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "engine-08-ir", title: "Intermediate Representations", bookId: "book-engine", order: 8, category: "Intermediate", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "engine-09-codegen", title: "Code Generation & Instruction Selection", bookId: "book-engine", order: 9, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "engine-10-linker", title: "Linkers & Loaders", bookId: "book-engine", order: 10, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "engine-11-exceptions", title: "Exception Handling & Stack Unwinding", bookId: "book-engine", order: 11, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "engine-12-concurrency", title: "Concurrency & Threading", bookId: "book-engine", order: 12, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "engine-13-io", title: "I/O Systems & Event Loops", bookId: "book-engine", order: 13, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "engine-14-optimization", title: "Optimization Passes", bookId: "book-engine", order: 14, category: "Optimization", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "engine-15-profiling", title: "Profiling & Performance Analysis", bookId: "book-engine", order: 15, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
    ]
  },
];

export function getBookById(id: string): Book | undefined {
  return BOOKS.find(b => b.id === id);
}

export function getChapterMeta(bookId: string, chapterId: string): ChapterMeta | undefined {
  const book = getBookById(bookId);
  return book?.chapters.find(c => c.id === chapterId);
}

export function getAllChapters(): ChapterMeta[] {
  return BOOKS.flatMap(b => b.chapters);
}

export function getChaptersByBook(bookId: string): ChapterMeta[] {
  const book = getBookById(bookId);
  return book?.chapters || [];
}
