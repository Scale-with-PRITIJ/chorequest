import React from 'react';
import { Pet } from '../types';
import { motion } from 'motion/react';

interface VirtualPetProps {
  pet: Pet;
}

export function VirtualPet({ pet }: VirtualPetProps) {
  // Simple SVG-based pet that grows
  // Stage 0: Egg
  // Stage 1: Baby
  // Stage 2: Teen
  // Stage 3: Adult

  const petType = pet.type?.toLowerCase() || 'cat';
  
  let color = '#ec4899'; // Default pink
  let secondaryColor = '#fbcfe8';
  
  if (petType === 'dragon') { color = '#f97316'; secondaryColor = '#fbbf24'; }
  else if (petType === 'unicorn') { color = '#ec4899'; secondaryColor = '#fbcfe8'; }
  else if (petType === 'dog') { color = '#8b5cf6'; secondaryColor = '#c4b5fd'; } // Purple dog
  else if (petType === 'cat') { color = '#3b82f6'; secondaryColor = '#93c5fd'; } // Blue cat

  return (
    <div className="w-full h-full flex items-center justify-center">
      <motion.div
        animate={{ 
          y: [0, -10, 0],
          scale: [1, 1.05, 1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative"
      >
        {pet.stage === 0 ? (
          // Egg
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            <ellipse cx="50" cy="60" rx="30" ry="40" fill="#f5f5f4" stroke="#e7e5e4" strokeWidth="2" />
            <path d="M35 45 Q50 35 65 45" fill="none" stroke="#e7e5e4" strokeWidth="2" />
            <motion.path 
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              d="M45 55 L55 65 M55 55 L45 65" 
              stroke="#d6d3d1" 
              strokeWidth="2" 
            />
          </svg>
        ) : (
          // Creature
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            {/* Body */}
            <circle cx="50" cy="60" r={20 + pet.stage * 5} fill={color} />
            
            {/* Head */}
            <circle cx="50" cy={40 - pet.stage * 2} r={15 + pet.stage * 2} fill={color} />
            
            {/* Eyes */}
            <circle cx="43" cy={38 - pet.stage * 2} r="3" fill="white" />
            <circle cx="57" cy={38 - pet.stage * 2} r="3" fill="white" />
            <circle cx="43" cy={38 - pet.stage * 2} r="1.5" fill="black" />
            <circle cx="57" cy={38 - pet.stage * 2} r="1.5" fill="black" />
            
            {/* Features based on type */}
            {petType === 'dragon' && (
              <>
                {/* Wings - Grow with stage */}
                {pet.stage > 0 && (
                  <>
                    <path d={`M30 60 Q10 ${50 - pet.stage * 15} 30 45`} fill={secondaryColor} opacity="0.8" />
                    <path d={`M70 60 Q90 ${50 - pet.stage * 15} 70 45`} fill={secondaryColor} opacity="0.8" />
                  </>
                )}
                {/* Horns - Appear at stage 2 */}
                {pet.stage >= 2 && (
                  <>
                    <path d="M40 30 L35 15 L45 25 Z" fill={secondaryColor} />
                    <path d="M60 30 L65 15 L55 25 Z" fill={secondaryColor} />
                  </>
                )}
                {/* Fire Breath - Stage 3 */}
                {pet.stage >= 3 && (
                  <motion.path 
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }} 
                    transition={{ duration: 0.5, repeat: Infinity }}
                    d="M45 65 Q50 85 55 65 Q50 75 45 65 Z" 
                    fill="#ef4444" 
                  />
                )}
              </>
            )}

            {petType === 'unicorn' && (
              <>
                {/* Horn - Grows with stage */}
                {pet.stage > 0 && (
                  <path d={`M50 25 L${50 - pet.stage} ${25 - pet.stage * 10} L${50 + pet.stage} ${25 - pet.stage * 10} Z`} fill={secondaryColor} />
                )}
                {/* Mane - Appears at stage 2 */}
                {pet.stage >= 2 && (
                  <path d="M50 30 Q70 35 60 55" fill={secondaryColor} stroke={secondaryColor} strokeWidth="6" strokeLinecap="round" />
                )}
                {/* Magic Sparkles - Stage 3 */}
                {pet.stage >= 3 && (
                  <motion.circle 
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    cx="70" cy="20" r="4" fill="#fbbf24" 
                  />
                )}
                {pet.stage >= 3 && (
                  <motion.circle 
                    animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    cx="30" cy="15" r="3" fill="#fbbf24" 
                  />
                )}
              </>
            )}

            {petType === 'cat' && (
              <>
                {/* Ears - Grow slightly with stage */}
                {pet.stage > 0 && (
                  <>
                    <path d={`M35 35 L${25 - pet.stage * 2} 15 L45 25 Z`} fill={secondaryColor} />
                    <path d="M65 35 L75 15 L55 25 Z" fill={secondaryColor} />
                  </>
                )}
                {/* Whiskers - Appear at stage 2 */}
                {pet.stage >= 2 && (
                  <g stroke="#64748b" strokeWidth="1.5">
                    <line x1="35" y1="45" x2="20" y2="42" />
                    <line x1="35" y1="48" x2="20" y2="48" />
                    <line x1="35" y1="51" x2="20" y2="54" />
                    <line x1="65" y1="45" x2="80" y2="42" />
                    <line x1="65" y1="48" x2="80" y2="48" />
                    <line x1="65" y1="51" x2="80" y2="54" />
                  </g>
                )}
                {/* Tail - Wags at stage 3 */}
                {pet.stage >= 3 && (
                  <motion.path 
                    animate={{ rotate: [-10, 10, -10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: '80px 70px' }}
                    d="M70 70 Q90 60 85 40" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" 
                  />
                )}
              </>
            )}

            {petType === 'dog' && (
              <>
                {/* Floppy Ears - Grow with stage */}
                {pet.stage > 0 && (
                  <>
                    <path d={`M35 30 Q20 20 ${20 - pet.stage * 2} 40 Q30 45 40 35`} fill={secondaryColor} />
                    <path d={`M65 30 Q80 20 ${80 + pet.stage * 2} 40 Q70 45 60 35`} fill={secondaryColor} />
                  </>
                )}
                {/* Snout - Appears at stage 2 */}
                {pet.stage >= 2 && (
                  <circle cx="50" cy="48" r="8" fill={secondaryColor} />
                )}
                {pet.stage >= 2 && (
                  <circle cx="50" cy="46" r="3" fill="#1e293b" />
                )}
                {/* Tail - Wags extremely fast at stage 3 */}
                {pet.stage >= 3 && (
                  <motion.path 
                    animate={{ rotate: [-20, 20, -20] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                    style={{ transformOrigin: '20px 70px' }}
                    d="M30 70 Q10 80 15 55" fill="none" stroke={secondaryColor} strokeWidth="6" strokeLinecap="round" 
                  />
                )}
              </>
            )}

            {/* Accessories */}
            {pet.accessories?.includes('Hat') && (
              <path d="M35 25 L65 25 L50 5 Z" fill="#1e293b" />
            )}
          </svg>
        )}

        {/* Level Badge */}
        <div className="absolute -bottom-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md border-2 border-stone-100 text-xs font-black text-stone-700">
          S{pet.stage}
        </div>
      </motion.div>
    </div>
  );
}
