
import type { Unit, Team, UnitComposition } from '@/lib/types';
import type { JoinGameInput, SquadUnit } from '@/app/actions';
import { HEROES_DATA } from '@/lib/heroes';

const teams: { [key: string]: Team } = {
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

const initialUnits: Unit[] = [];

const gameEventsLog = `
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

const teamResourceData = [
    { minute: "Min 1", blue: 150, red: 140 },
    { minute: "Min 2", blue: 320, red: 310 },
    { minute: "Min 3", blue: 500, red: 480 },
    { minute: "Min 4", blue: 680, red: 650 },
    { minute: "Min 5", blue: 900, red: 800 },
    { minute: "Min 6", blue: 1100, red: 1050 },
    { minute: "Min 7", blue: 1300, red: 1350 },
];

const unitCompositionData = [
    { composition: "attaque", blue: 2, red: 3 },
    { composition: "défense", blue: 1, red: 1 },
    { composition: "capture", blue: 1, red: 1 },
    { composition: "escarmouche", blue: 1, red: 1 },
];


// =================================================================
// In-Memory Game State Manager
// This will act as our "live" database for the game state.
// =================================================================

const GAME_DURATION_SECONDS = 25 * 60;

let liveUnits: Unit[] = [...initialUnits.map(u => ({...u, combat: { ...u.combat, cooldowns: {} }, progression: {...u.progression}}))];
let liveTeams = {...teams};
let isGameStarted = false;
let gameTime = GAME_DURATION_SECONDS; // Countdown timer
let damageMultiplier = 1;

export const gameState = {
  getUnits: () => liveUnits,
  getTeams: () => liveTeams,
  getGameEventsLog: () => gameEventsLog,
  getTeamResourceData: () => teamResourceData,
  getUnitCompositionData: () => unitCompositionData,
  isGameStarted: () => isGameStarted,
  getGameTime: () => gameTime,
  getDamageMultiplier: () => damageMultiplier,

  startGame: () => {
    if (isGameStarted) return;
    isGameStarted = true;
    gameTime = GAME_DURATION_SECONDS;
    console.log("Game has been started.");
  },

  addPlayerSquad: (input: JoinGameInput) => {
    console.log(`Player ${input.pseudo} is joining team ${input.teamId} as ${input.squadType}`);
    
    // Remove existing units for this player to prevent duplicates on reconnect/rejoin
    liveUnits = liveUnits.filter(u => u.control.controllerPlayerId !== input.pseudo);

    const newUnits: Unit[] = input.squad.map((squadUnit, index) => {
        const heroData = HEROES_DATA.find(h => h.id === squadUnit.id);
        if (!heroData) {
            console.error(`Could not find hero data for id ${squadUnit.id}`);
            return null;
        }

        // Define spawn areas (percentages)
        const spawnX = input.teamId === 'blue' ? 10 : 90;
        const spawnY = input.teamId === 'blue' ? 90 : 10;

        const newUnit: Unit = {
            id: `${input.pseudo}-${heroData.id}-${index}`,
            name: heroData.name,
            type: heroData.class,
            heroId: heroData.id,
            teamId: input.teamId,
            composition: input.squadType,
            position: { 
                // Randomize spawn position slightly around the base
                x: spawnX + (Math.random() - 0.5) * 8, 
                y: spawnY + (Math.random() - 0.5) * 8
            },
            stats: {
                ...heroData.stats,
                hp: heroData.stats.maxHp,
            },
            progression: {
                xp: 0,
                level: 1,
                xpToNextLevel: 100,
                respawnTimeRemaining: 0,
            },
            combat: {
                cooldowns: {},
                buffs: [],
                debuffs: [],
                status: 'alive',
            },
            control: {
                controllerPlayerId: input.pseudo,
            },
        };
        return newUnit;
    }).filter((u): u is Unit => u !== null);

    liveUnits.push(...newUnits);
    console.log(`Added ${newUnits.length} new units for player ${input.pseudo}. Total units: ${liveUnits.length}`);
  },
  
  updateUnitPosition: (unitId: string, x: number, y: number): Unit | undefined => {
    let updatedUnit: Unit | undefined;
    liveUnits = liveUnits.map(unit => {
      if (unit.id === unitId) {
        // Clamp position between 0 and 100
        const clampedX = Math.max(0, Math.min(100, x));
        const clampedY = Math.max(0, Math.min(100, y));
        updatedUnit = { ...unit, position: { x: clampedX, y: clampedY } };
        return updatedUnit;
      }
      return unit;
    });
    return updatedUnit;
  },

  grantXp: (unitId: string, amount: number) => {
    liveUnits = liveUnits.map(unit => {
      if (unit.id === unitId) {
        const newProgression = { ...unit.progression };
        newProgression.xp += amount;

        while (newProgression.xp >= newProgression.xpToNextLevel) {
          newProgression.level++;
          newProgression.xp -= newProgression.xpToNextLevel;
          newProgression.xpToNextLevel = Math.floor(newProgression.xpToNextLevel * 1.5); // Example: increase XP needed for next level
        }
        return { ...unit, progression: newProgression };
      }
      return unit;
    });
    return liveUnits.find(u => u.id === unitId);
  },
  
  useSkill: (unitId: string, skillId: string, ticks: number) => {
    const unit = liveUnits.find(u => u.id === unitId);
    if (!unit) {
      console.error(`useSkill: Unit with id ${unitId} not found.`);
      return false;
    }
    
    if (unit.combat.cooldowns[skillId] > 0) {
      console.log(`Skill ${skillId} is on cooldown for unit ${unitId}.`);
      return false;
    }
    
    console.log(`Unit ${unitId} used skill ${skillId}. Setting cooldown for ${ticks} ticks.`);
    unit.combat.cooldowns[skillId] = ticks;
    // Here you would apply the skill's effects (damage, healing, etc.)
    
    return true;
  },
  
  processCooldowns: () => {
    const TICK_INTERVAL_S = 1; // Corresponds to game-loop.ts TICK_RATE_MS
    liveUnits = liveUnits.map(unit => {
      const newCooldowns = { ...unit.combat.cooldowns };
      let hasChanged = false;
      for (const skillId in newCooldowns) {
        if (newCooldowns[skillId] > 0) {
          newCooldowns[skillId] = Math.max(0, newCooldowns[skillId] - TICK_INTERVAL_S);
          hasChanged = true;
        }
      }
      if (hasChanged) {
        return { ...unit, combat: { ...unit.combat, cooldowns: newCooldowns } };
      }
      return unit;
    });
  },

  processGameTick: () => {
    if (!isGameStarted) return;

    gameTime = Math.max(0, gameTime - 1);
    
    const elapsedTime = GAME_DURATION_SECONDS - gameTime;
    
    // After 25 mins (i.e. timer is at 0 and goes into negative)
    if (elapsedTime >= (25 * 60) && elapsedTime < (30 * 60)) {
        if (damageMultiplier !== 2) {
            console.log("Game time > 25 mins. Damage multiplier is now x2.");
            damageMultiplier = 2;
        }
    } 
    // After 30 mins
    else if (elapsedTime >= (30 * 60)) {
        if (damageMultiplier !== 5) {
            console.log("Game time > 30 mins. Damage multiplier is now x5.");
            damageMultiplier = 5;
        }
    }
  },

  reset: () => {
    // Deep copy to avoid mutation issues on subsequent resets
    liveUnits = [...initialUnits.map(u => ({...u, combat: { ...u.combat, cooldowns: {} }, progression: {...u.progression}}))];
    liveTeams = {...teams};
    isGameStarted = false;
    gameTime = GAME_DURATION_SECONDS;
    damageMultiplier = 1;
    console.log('Game state has been reset.');
  }
};
