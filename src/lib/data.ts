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
  { 
    id: 'b1', name: 'Blue Knight', type: 'Knight', teamId: 'blue', groupId: 'player1_squadA', composition: 'attack', 
    position: { x: 2, y: 3 }, 
    stats: { hp: 90, maxHp: 100, resource: 40, maxResource: 50, atk: 15, def: 10, spd: 5 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: [], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player1' }
  },
  { 
    id: 'b2', name: 'Blue Archer', type: 'Archer', teamId: 'blue', groupId: 'player1_squadA', composition: 'attack',
    position: { x: 2, y: 4 },
    stats: { hp: 70, maxHp: 70, resource: 60, maxResource: 60, atk: 12, def: 5, spd: 7 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: ['Haste'], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player1' }
  },
  { 
    id: 'b3', name: 'Blue Guardian', type: 'Guardian', teamId: 'blue', groupId: 'player2_squadB', composition: 'defense',
    position: { x: 1, y: 3 },
    stats: { hp: 100, maxHp: 120, resource: 30, maxResource: 30, atk: 8, def: 20, spd: 4 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: ['Shielded'], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player2' }
  },
  { 
    id: 'b4', name: 'Blue Mage', type: 'Mage', teamId: 'blue', groupId: 'player3_squadC', composition: 'research',
    position: { x: 1, y: 2 },
    stats: { hp: 60, maxHp: 60, resource: 95, maxResource: 100, atk: 18, def: 3, spd: 6 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: [], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player3' }
  },
  { 
    id: 'b5', name: 'Blue Scout', type: 'Scout', teamId: 'blue', groupId: 'player4_squadD', composition: 'capture',
    position: { x: 4, y: 2 },
    stats: { hp: 80, maxHp: 80, resource: 50, maxResource: 50, atk: 10, def: 7, spd: 8 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: [], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player4' }
  },
  
  // Red Team
  { 
    id: 'r1', name: 'Red Berserker', type: 'Berserker', teamId: 'red', groupId: 'player5_squadE', composition: 'attack',
    position: { x: 8, y: 7 },
    stats: { hp: 85, maxHp: 100, resource: 45, maxResource: 50, atk: 16, def: 8, spd: 6 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: ['Enraged'], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player5' }
  },
  { 
    id: 'r2', name: 'Red Hunter', type: 'Hunter', teamId: 'red', groupId: 'player5_squadE', composition: 'attack',
    position: { x: 9, y: 7 },
    stats: { hp: 75, maxHp: 75, resource: 55, maxResource: 60, atk: 13, def: 6, spd: 7 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: [], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player5' }
  },
  { 
    id: 'r3', name: 'Red Sentinel', type: 'Sentinel', teamId: 'red', groupId: 'player6_squadF', composition: 'defense',
    position: { x: 10, y: 8 },
    stats: { hp: 100, maxHp: 120, resource: 35, maxResource: 40, atk: 9, def: 22, spd: 4 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: [], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player6' }
  },
  { 
    id: 'r4', name: 'Red Sorcerer', type: 'Sorcerer', teamId: 'red', groupId: 'player7_squadG', composition: 'research',
    position: { x: 10, y: 9 },
    stats: { hp: 55, maxHp: 55, resource: 100, maxResource: 100, atk: 20, def: 2, spd: 6 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: ['Mana Shield'], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player7' }
  },
  { 
    id: 'r5', name: 'Red Infiltrator', type: 'Infiltrator', teamId: 'red', groupId: 'player8_squadH', composition: 'capture',
    position: { x: 6, y: 9 },
    stats: { hp: 75, maxHp: 75, resource: 55, maxResource: 60, atk: 11, def: 8, spd: 9 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: [], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player8' }
  },
  { 
    id: 'r6', name: 'Red Warrior', type: 'Warrior', teamId: 'red', composition: 'attack',
    position: { x: 7, y: 6 },
    stats: { hp: 95, maxHp: 100, resource: 30, maxResource: 30, atk: 14, def: 12, spd: 5 },
    progression: { xp: 0, level: 1, respawnTimeRemaining: 0 },
    combat: { cooldowns: {}, buffs: [], debuffs: [], status: 'alive' },
    control: { controllerPlayerId: 'player9' }
  },
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