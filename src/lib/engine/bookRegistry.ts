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
      { id: "crypto-01-history", title: "History of Cryptography", bookId: "book-crypto", order: 1, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      { id: "crypto-02-caesar", title: "Caesar & Substitution Ciphers", bookId: "book-crypto", order: 2, category: "Classical", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "20 min" },
      { id: "crypto-03-xor", title: "XOR & One-Time Pads", bookId: "book-crypto", order: 3, category: "Symmetric", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      { id: "crypto-04-des", title: "DES Algorithm", bookId: "book-crypto", order: 4, category: "Symmetric", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "crypto-05-aes", title: "AES Encryption", bookId: "book-crypto", order: 5, category: "Symmetric", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "crypto-06-modes", title: "Block Cipher Modes", bookId: "book-crypto", order: 6, category: "Symmetric", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "crypto-07-rsa", title: "RSA Public Key", bookId: "book-crypto", order: 7, category: "Asymmetric", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "55 min" },
      { id: "crypto-08-diffie", title: "Diffie-Hellman Key Exchange", bookId: "book-crypto", order: 8, category: "Key Exchange", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "crypto-09-ecc", title: "Elliptic Curve Cryptography", bookId: "book-crypto", order: 9, category: "Asymmetric", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "crypto-10-hash", title: "Hash Functions (SHA)", bookId: "book-crypto", order: 10, category: "Hashing", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "crypto-11-mac", title: "MAC & Digital Signatures", bookId: "book-crypto", order: 11, category: "Authentication", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "crypto-12-tls", title: "TLS/SSL Handshake", bookId: "book-crypto", order: 12, category: "Protocols", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "crypto-13-attacks", title: "Cryptographic Attacks", bookId: "book-crypto", order: 13, category: "Security", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "crypto-14-pki", title: "Public Key Infrastructure", bookId: "book-crypto", order: 14, category: "Infrastructure", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "crypto-15-zero", title: "Zero-Knowledge Proofs", bookId: "book-crypto", order: 15, category: "Advanced", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "55 min" },
    ]
  },
  
  // Book 6: Engine Room
  {
    id: "book-physics",
    title: "The Engine Room",
    subtitle: "Game Physics & Math",
    description: "The math behind the games we love. Collision detection, raycasting, inverse kinematics, and physics simulation.",
    category: "physics",
    accentColor: "#f59e0b",
    icon: "Gamepad2",
    chapters: [
      { id: "phys-01-vectors", title: "Vectors & Vector Math", bookId: "book-physics", order: 1, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "phys-02-trig", title: "Trigonometry for Games", bookId: "book-physics", order: 2, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      { id: "phys-03-matrices", title: "Matrix Transformations", bookId: "book-physics", order: 3, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "phys-04-coordinates", title: "Coordinate Systems", bookId: "book-physics", order: 4, category: "Foundations", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "25 min" },
      { id: "phys-05-velocity", title: "Velocity & Acceleration", bookId: "book-physics", order: 5, category: "Motion", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "phys-06-collision-aabb", title: "AABB Collision Detection", bookId: "book-physics", order: 6, category: "Collision", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "phys-07-collision-circle", title: "Circle & Sphere Collision", bookId: "book-physics", order: 7, category: "Collision", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "30 min" },
      { id: "phys-08-sat", title: "Separating Axis Theorem", bookId: "book-physics", order: 8, category: "Collision", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "phys-09-raycast", title: "Raycasting", bookId: "book-physics", order: 9, category: "Collision", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "phys-10-ik", title: "Inverse Kinematics", bookId: "book-physics", order: 10, category: "Animation", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
      { id: "phys-11-gravity", title: "Gravity & Forces", bookId: "book-physics", order: 11, category: "Physics", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "35 min" },
      { id: "phys-12-verlet", title: "Verlet Integration", bookId: "book-physics", order: 12, category: "Physics", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "phys-13-constraints", title: "Physics Constraints", bookId: "book-physics", order: 13, category: "Physics", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "45 min" },
      { id: "phys-14-particles", title: "Particle Systems", bookId: "book-physics", order: 14, category: "Effects", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "40 min" },
      { id: "phys-15-pathfinding", title: "Pathfinding (A*)", bookId: "book-physics", order: 15, category: "AI", hasVisualizer: true, hasMinigame: true, hasPractice: true, estimatedTime: "50 min" },
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
