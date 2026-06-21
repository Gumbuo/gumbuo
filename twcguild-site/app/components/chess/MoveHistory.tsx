"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface MoveHistoryProps {
  moves: string[];
  currentMoveIndex?: number;
  onMoveClick?: (index: number) => void;
}

export function MoveHistory({ moves, currentMoveIndex, onMoveClick }: MoveHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest move
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [moves.length]);

  // Group moves into pairs (white, black)
  const movePairs: Array<{ number: number; white?: string; black?: string }> = [];
  for (let i = 0; i < moves.length; i += 2) {
    movePairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i],
      black: moves[i + 1],
    });
  }

  return (
    <div
      className="bg-black/50 rounded-lg border border-cyan-400/30 overflow-hidden"
      style={{ fontFamily: "Share Tech Mono, monospace" }}
    >
      <div className="px-4 py-2 border-b border-cyan-400/30 bg-black/30">
        <h3 className="text-cyan-400 font-bold text-sm" style={{ fontFamily: "Orbitron, sans-serif" }}>
          Move History
        </h3>
      </div>

      <div
        ref={containerRef}
        className="max-h-64 overflow-y-auto p-2 space-y-1"
      >
        {movePairs.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">No moves yet</p>
        ) : (
          movePairs.map((pair, pairIndex) => (
            <motion.div
              key={pair.number}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: pairIndex * 0.02 }}
              className="flex items-center text-sm"
            >
              {/* Move number */}
              <span className="text-gray-500 w-8 flex-shrink-0">{pair.number}.</span>

              {/* White's move */}
              <button
                onClick={() => onMoveClick?.(pairIndex * 2)}
                className={`
                  px-2 py-0.5 rounded flex-1 text-left transition-colors
                  ${
                    currentMoveIndex === pairIndex * 2
                      ? "bg-cyan-400/20 text-cyan-400"
                      : "text-white hover:bg-white/10"
                  }
                `}
              >
                {pair.white}
              </button>

              {/* Black's move */}
              {pair.black && (
                <button
                  onClick={() => onMoveClick?.(pairIndex * 2 + 1)}
                  className={`
                    px-2 py-0.5 rounded flex-1 text-left transition-colors
                    ${
                      currentMoveIndex === pairIndex * 2 + 1
                        ? "bg-cyan-400/20 text-cyan-400"
                        : "text-gray-300 hover:bg-white/10"
                    }
                  `}
                >
                  {pair.black}
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Move count footer */}
      <div className="px-4 py-2 border-t border-cyan-400/30 bg-black/30">
        <p className="text-gray-500 text-xs">
          {moves.length} move{moves.length !== 1 ? "s" : ""} played
        </p>
      </div>
    </div>
  );
}

export default MoveHistory;
