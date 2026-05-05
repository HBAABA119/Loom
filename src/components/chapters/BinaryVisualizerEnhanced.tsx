"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRightLeft, Binary, Hash, RefreshCcw, Calculator } from "lucide-react";

export default function BinaryVisualizerEnhanced() {
  const [decimalValue, setDecimalValue] = useState(45);
  const [hexValue, setHexValue] = useState("2D");
  const [showConversion, setShowConversion] = useState(false);
  const [activeBit, setActiveBit] = useState<number | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const bits = 8;
  const binaryString = decimalValue.toString(2).padStart(bits, '0');
  
  const bitValues = Array.from({ length: bits }, (_, i) => Math.pow(2, bits - 1 - i));

  useEffect(() => {
    setHexValue(decimalValue.toString(16).toUpperCase().padStart(2, '0'));
  }, [decimalValue]);

  const handleBitClick = (index: number) => {
    const bitPosition = bits - 1 - index;
    const newValue = decimalValue ^ (1 << bitPosition);
    setDecimalValue(newValue);
    setActiveBit(index);
    setTimeout(() => setActiveBit(null), 300);
  };

  const handleDecimalChange = (delta: number) => {
    const newValue = Math.max(0, Math.min(255, decimalValue + delta));
    setDecimalValue(newValue);
    setAnimationKey(prev => prev + 1);
  };

  const handleRandom = () => {
    setDecimalValue(Math.floor(Math.random() * 256));
    setAnimationKey(prev => prev + 1);
  };

  return (
    <div className="w-full h-full bg-[#0d1117] rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-3">
          <Binary className="w-6 h-6 text-[#58a6ff]" />
          <div>
            <h3 className="text-white font-semibold">Binary & Number Systems</h3>
            <p className="text-[#8b949e] text-sm">Interactive converter and visualizer</p>
          </div>
        </div>
        <button
          onClick={handleRandom}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-lg text-sm transition-colors"
        >
          <RefreshCcw size={14} />
          Random
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left - Controls */}
        <div className="w-full lg:w-80 p-6 border-r border-[#30363d] space-y-6 overflow-y-auto">
          {/* Decimal Control */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <label className="flex items-center gap-2 text-[#8b949e] text-sm mb-3">
              <Calculator size={16} />
              Decimal Value
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDecimalChange(-1)}
                className="w-10 h-10 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-bold transition-colors"
              >
                -
              </button>
              <div className="flex-1 text-center">
                <span className="text-3xl font-bold text-[#58a6ff]">{decimalValue}</span>
              </div>
              <button
                onClick={() => handleDecimalChange(1)}
                className="w-10 h-10 bg-[#21262d] hover:bg-[#30363d] text-white rounded-lg font-bold transition-colors"
              >
                +
              </button>
            </div>
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={() => handleDecimalChange(-10)}
                className="px-3 py-1 bg-[#0d1117] text-[#8b949e] hover:text-white text-xs rounded transition-colors"
              >
                -10
              </button>
              <button
                onClick={() => handleDecimalChange(10)}
                className="px-3 py-1 bg-[#0d1117] text-[#8b949e] hover:text-white text-xs rounded transition-colors"
              >
                +10
              </button>
            </div>
          </div>

          {/* Hex Display */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <label className="flex items-center gap-2 text-[#8b949e] text-sm mb-3">
              <Hash size={16} />
              Hexadecimal
            </label>
            <div className="text-center">
              <span className="text-3xl font-mono font-bold text-[#f0883e]">0x{hexValue}</span>
            </div>
            <p className="text-[#8b949e] text-xs text-center mt-2">
              {hexValue.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join(' ')}
            </p>
          </div>

          {/* Info */}
          <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
            <h4 className="text-white font-medium mb-2">How it works</h4>
            <ul className="space-y-2 text-[#c9d1d9] text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#58a6ff]">•</span>
                Click bits to toggle them (0↔1)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#58a6ff]">•</span>
                Each position is a power of 2
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#58a6ff]">•</span>
                Hex groups binary by 4 bits
              </li>
            </ul>
          </div>
        </div>

        {/* Right - Visualization */}
        <div className="flex-1 p-6 flex flex-col items-center justify-center">
          {/* Binary Representation */}
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={animationKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Bit Values Row */}
                <div className="grid grid-cols-8 gap-2">
                  {bitValues.map((val, i) => (
                    <div key={i} className="text-center">
                      <span className="text-[#6e7681] text-sm font-mono">{val}</span>
                    </div>
                  ))}
                </div>

                {/* Bits Row */}
                <div className="grid grid-cols-8 gap-2">
                  {binaryString.split('').map((bit, i) => (
                    <motion.button
                      key={i}
                      onClick={() => handleBitClick(i)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      animate={activeBit === i ? { scale: [1, 1.2, 1] } : {}}
                      className={`aspect-square rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                        bit === '1'
                          ? 'bg-[#238636] text-white shadow-lg shadow-[#238636]/30'
                          : 'bg-[#21262d] text-[#6e7681] border-2 border-[#30363d]'
                      }`}
                    >
                      {bit}
                    </motion.button>
                  ))}
                </div>

                {/* Position Labels */}
                <div className="grid grid-cols-8 gap-2">
                  {Array.from({ length: bits }, (_, i) => (
                    <div key={i} className="text-center">
                      <span className="text-[#8b949e] text-xs">{bits - 1 - i}</span>
                    </div>
                  ))}
                </div>

                {/* Calculation */}
                <div className="mt-8 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
                  <div className="flex items-center justify-center gap-2 flex-wrap text-lg">
                    {binaryString.split('').map((bit, i) => {
                      if (bit === '0') return null;
                      const val = bitValues[i];
                      const isLast = binaryString.slice(i + 1).indexOf('1') === -1;
                      return (
                        <span key={i} className="flex items-center">
                          <span className="text-[#238636] font-mono">{val}</span>
                          {!isLast && <span className="text-[#8b949e] mx-2">+</span>}
                        </span>
                      );
                    }).filter(Boolean)}
                    <span className="text-[#8b949e] mx-2">=</span>
                    <span className="text-[#58a6ff] font-bold text-2xl">{decimalValue}</span>
                  </div>
                </div>

                {/* Hex Breakdown */}
                <div className="mt-4 p-4 bg-[#161b22] border border-[#30363d] rounded-lg">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <span className="text-[#f0883e] text-xl font-mono font-bold">
                        {hexValue[0]}
                      </span>
                      <p className="text-[#8b949e] text-xs mt-1">
                        {parseInt(hexValue[0], 16).toString(2).padStart(4, '0')}
                      </p>
                    </div>
                    <ArrowRightLeft className="text-[#8b949e]" size={20} />
                    <div className="text-center">
                      <span className="text-[#f0883e] text-xl font-mono font-bold">
                        {hexValue[1]}
                      </span>
                      <p className="text-[#8b949e] text-xs mt-1">
                        {parseInt(hexValue[1], 16).toString(2).padStart(4, '0')}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#8b949e] text-xs text-center mt-3">
                    Hex digits = groups of 4 bits
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
