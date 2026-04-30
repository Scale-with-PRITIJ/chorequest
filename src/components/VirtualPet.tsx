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

  const isDragon = pet.type.toLowerCase() === 'dragon';
  const color = isDragon ? '#f97316' : '#ec4899'; // Orange for dragon, Pink for unicorn
  const secondaryColor = isDragon ? '#fbbf24' : '#fbcfe8';

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
            {isDragon ? (
              <>
                {/* Wings */}
                <path d={`M30 60 Q10 ${40 - pet.stage * 10} 30 50`} fill={secondaryColor} opacity="0.8" />
                <path d={`M70 60 Q90 ${40 - pet.stage * 10} 70 50`} fill={secondaryColor} opacity="0.8" />
                {/* Horns */}
                <path d="M40 30 L35 20 L45 28 Z" fill={secondaryColor} />
                <path d="M60 30 L65 20 L55 28 Z" fill={secondaryColor} />
              </>
            ) : (
              <>
                {/* Horn */}
                <path d="M50 25 L47 10 L53 10 Z" fill={secondaryColor} />
                {/* Mane */}
                <path d="M50 30 Q65 35 60 50" fill={secondaryColor} stroke={secondaryColor} strokeWidth="4" strokeLinecap="round" />
              </>
            )}

            {/* Accessories */}
            {pet.accessories.includes('Hat') && (
              <path d="M35 25 L65 25 L50 10 Z" fill="#1e293b" />
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
