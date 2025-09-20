
import type { Unit } from './types';

// This type can be expanded with more objective-specific properties later
export type Objective = {
  id: string;
  name: string;
  position: { x: number; y: number };
  teamId: 'blue' | 'red' | 'neutral';
  type: 'tower' | 'idol' | 'spawn';
  // Potentially add stats if they can be attacked
  stats?: {
      hp: number;
      maxHp: number;
  }
};


// This file is now deprecated for static objectives.
// Objectives are loaded dynamically from the /public/map.json file
// in src/server/game-state.ts
export const objectives: Objective[] = [];
