import type { Unit, Team } from './types';

export const teams: { [key: string]: Team } = {
  blue: {
    name: "Équipe Bleue",
    color: "#3b82f6",
    bgClass: "bg-blue-500",
    textClass: "text-blue-50",
  },
  red: {
    name: "Équipe Rouge",
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
[00:15] Début de la partie. Les portes sont ouvertes.
[01:30] Le Chevalier Bleu engage le Berserker Rouge près de la voie du milieu.
[01:32] Santé du Chevalier Bleu : 75. Santé du Berserker Rouge : 60.
[01:38] L'Archer Bleu soutient le Chevalier Bleu. Le Berserker Rouge bat en retraite.
[02:10] Infiltrateur Rouge repéré près de la Tour Nord.
[02:15] Le Gardien Bleu se déplace pour intercepter l'Infiltrateur Rouge.
[03:00] L'Équipe Bleue capture la Balise de Vision dans la jungle.
[03:45] Le Sorcier Rouge termine la recherche 'Puissance Arcanique'. Régénération de mana de l'équipe +5%.
[04:20] Un combat d'équipe majeur éclate à l'Idole du Sud.
[04:22] Le Mage Bleu lance 'Nova de Givre', touchant 3 unités ennemies.
[04:25] Le Chasseur Rouge utilise 'Tir Rapide' sur le Gardien Bleu. Santé du Gardien Bleu : 40.
[04:28] MODÈLE INHABITUEL : Le Berserker Rouge cible le Mage Bleu au lieu du Chevalier Bleu plus proche.
[04:31] Le Chevalier Bleu utilise 'Charge' pour protéger le Mage Bleu.
[04:35] Le Sorcier Rouge est éliminé par l'Archer Bleu.
[04:40] L'équipe Rouge se désengage. L'Équipe Bleue sécurise l'Idole du Sud.
[05:15] L'Équipe Bleue a un avantage de 500 pièces d'or.
[06:00] Calme plat. Les deux équipes farment sur leurs voies.
[07:30] L'Équipe Rouge se regroupe et pousse vers la Tour Nord.
[07:50] L'Équipe Bleue prépare une défense à la Tour Nord.
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
    { composition: "Attaque", blue: 2, red: 3 },
    { composition: "Défense", blue: 1, red: 1 },
    { composition: "Capture", blue: 1, red: 1 },
    { composition: "Recherche", blue: 1, red: 1 },
];
