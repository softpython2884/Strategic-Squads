import type { Unit, Team } from './types';

export const teams: { [key: string]: Team } = {
  blue: {
    name: "Blue Team",
    color: "#3b82f6",
    bgClass: "bg-blue-500",
    textClass: "text-blue-50",
  },
  red: {
    name: "Red Team",
    color: "#ef4444",
    bgClass: "bg-red-500",
    textClass: "text-red-50",
  },
};

export const units: Unit[] = [
  // Blue Team
  { id: 'b1', name: 'Blue Knight', teamId: 'blue', composition: 'attack', position: { x: 2, y: 3 }, stats: { health: 90, mana: 40 }, status: [] },
  { id: 'b2', name: 'Blue Archer', teamId: 'blue', composition: 'attack', position: { x: 2, y: 4 }, stats: { health: 70, mana: 60 }, status: ['Haste'] },
  { id: 'b3', name: 'Blue Guardian', teamId: 'blue', composition: 'defense', position: { x: 1, y: 3 }, stats: { health: 100, mana: 30 }, status: ['Shielded'] },
  { id: 'b4', name: 'Blue Mage', teamId: 'blue', composition: 'research', position: { x: 1, y: 2 }, stats: { health: 60, mana: 95 }, status: [] },
  { id: 'b5', name: 'Blue Scout', teamId: 'blue', composition: 'capture', position: { x: 4, y: 2 }, stats: { health: 80, mana: 50 }, status: [] },
  
  // Red Team
  { id: 'r1', name: 'Red Berserker', teamId: 'red', composition: 'attack', position: { x: 8, y: 7 }, stats: { health: 85, mana: 45 }, status: ['Enraged'] },
  { id: 'r2', name: 'Red Hunter', teamId: 'red', composition: 'attack', position: { x: 9, y: 7 }, stats: { health: 75, mana: 55 }, status: [] },
  { id: 'r3', name: 'Red Sentinel', teamId: 'red', composition: 'defense', position: { x: 10, y: 8 }, stats: { health: 100, mana: 35 }, status: [] },
  { id: 'r4', name: 'Red Sorcerer', teamId: 'red', composition: 'research', position: { x: 10, y: 9 }, stats: { health: 55, mana: 100 }, status: ['Mana Shield'] },
  { id: 'r5', name: 'Red Infiltrator', teamId: 'red', composition: 'capture', position: { x: 6, y: 9 }, stats: { health: 75, mana: 55 }, status: [] },
  { id: 'r6', name: 'Red Warrior', teamId: 'red', composition: 'attack', position: { x: 7, y: 6 }, stats: { health: 95, mana: 30 }, status: [] },
];

export const gameEventsLog = `
[00:15] Game Start. Gates are open.
[01:30] Blue Knight engages Red Berserker near mid-lane.
[01:32] Blue Knight health: 75. Red Berserker health: 60.
[01:38] Blue Archer supports Blue Knight. Red Berserker retreats.
[02:10] Red Infiltrator spotted near North Tower.
[02:15] Blue Guardian moves to intercept Red Infiltrator.
[03:00] Blue Team captures Vision Ward in jungle.
[03:45] Red Sorcerer completes 'Arcane Power' research. Team-wide mana regen +5%.
[04:20] Major team fight erupts at South Idol.
[04:22] Blue Mage casts 'Frost Nova', hitting 3 enemy units.
[04:25] Red Hunter uses 'Rapid Fire' on Blue Guardian. Blue Guardian health: 40.
[04:28] UNUSUAL PATTERN: Red Berserker targets Blue Mage instead of closer Blue Knight.
[04:31] Blue Knight uses 'Charge' to peel for Blue Mage.
[04:35] Red Sorcerer is eliminated by Blue Archer.
[04:40] Red team disengages. Blue Team secures South Idol.
[05:15] Blue Team has a 500 gold advantage.
[06:00] Lull in fighting. Both teams farming lanes.
[07:30] Red Team groups up and pushes towards North Tower.
[07:50] Blue Team prepares a defense at North Tower.
`;

export const teamResourceData = [
    { minute: "Min 1", blue: 150, red: 140 },
    { minute: "Min 2", blue: 320, red: 310 },
    { minute: "Min 3", blue: 500, red: 480 },
    { minute: "Min 4", blue: 680, red: 650 },
    { minute: "Min 5", blue: 900, red: 800 },
    { minute: "Min 6", blue: 1100, red: 1050 },
    { minute: "Min 7", blue: 1300, red: 1350 },
];

export const unitCompositionData = [
    { composition: "Attack", blue: 2, red: 3 },
    { composition: "Defense", blue: 1, red: 1 },
    { composition: "Capture", blue: 1, red: 1 },
    { composition: "Research", blue: 1, red: 1 },
];
