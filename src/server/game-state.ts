
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

// Function to calculate distance between two units
const calculateDistance = (unitA: Unit, unitB: Unit): number => {
    // A simple approximation for distance calculation
    const dx = unitA.position.x - unitB.position.x;
    const dy = unitA.position.y - unitB.position.y;
    return Math.sqrt(dx * dx + dy * dy);
};

// Function to apply damage from an attacker to a defender
const applyDamage = (attacker: Unit, defender: Unit) => {
    const totalDamage = Math.max(0, (attacker.stats.atk * damageMultiplier) - defender.stats.def);
    defender.stats.hp = Math.max(0, defender.stats.hp - totalDamage);
    
    // console.log(`${attacker.name} attacked ${defender.name} for ${totalDamage} damage. ${defender.name} HP: ${defender.stats.hp}`);

    if (defender.stats.hp <= 0) {
        defender.combat.status = 'down';
        defender.control.focus = undefined; // Stop attacking when down
        console.log(`${defender.name} has been defeated.`);
        // Here you could grant XP to the attacker
        gameState.grantXp(attacker.id, 50); // Grant 50 xp for a kill
    }
}


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
                attackCooldown: 0,
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

  setPlayerAttackFocus: (playerId: string, targetId: string | null, position: {x: number, y: number}) => {
    const playerUnits = liveUnits.filter(u => u.control.controllerPlayerId === playerId);

    if (playerUnits.length === 0) return;

    for (const unit of playerUnits) {
        if (unit.combat.status !== 'alive') continue; // Dead units can't attack
        // Update the focus to the new target ID
        unit.control.focus = targetId || undefined;
    }

    console.log(`Player ${playerId} assigned focus to ${targetId || 'a position'}.`);
  },

  grantXp: (unitId: string, amount: number) => {
    liveUnits = liveUnits.map(unit => {
      if (unit.id === unitId) {
        if (unit.combat.status !== 'alive') return unit; // Don't grant XP to dead units
        const newProgression = { ...unit.progression };
        newProgression.xp += amount;

        while (newProgression.xp >= newProgression.xpToNextLevel) {
          newProgression.level++;
          newProgression.xp -= newProgression.xpToNextLevel;
          newProgression.xpToNextLevel = Math.floor(newProgression.xpToNextLevel * 1.5); // Example: increase XP needed for next level
           // Also increase stats on level up
            unit.stats.maxHp = Math.floor(unit.stats.maxHp * 1.1);
            unit.stats.hp = unit.stats.maxHp; // Heal to full on level up
            unit.stats.atk = Math.floor(unit.stats.atk * 1.1);
            unit.stats.def = Math.floor(unit.stats.def * 1.1);
        }
        return { ...unit, progression: newProgression };
      }
      return unit;
    });
    return liveUnits.find(u => u.id === unitId);
  },
  
  useSkill: (unitId: string, skillId: string) => {
    const unitIndex = liveUnits.findIndex(u => u.id === unitId);
    if (unitIndex === -1) {
      console.error(`useSkill: Unit with id ${unitId} not found.`);
      return false;
    }
    
    let unit = liveUnits[unitIndex];

    if (unit.combat.status !== 'alive') {
        console.log(`Unit ${unitId} is not alive and cannot use skills.`);
        return false;
    }

    if (unit.combat.cooldowns[skillId] > 0) {
      console.log(`Skill ${skillId} is on cooldown for unit ${unitId}.`);
      return false;
    }

    const hero = HEROES_DATA.find(h => h.id === unit.heroId);
    const skill = hero?.skills.find(s => s.id.toString() === skillId);

    if (!skill) {
      console.error(`Skill ${skillId} not found for hero ${unit.heroId}.`);
      return false;
    }
    
    if (unit.progression.level < (skill.level || 1)) {
        console.log(`Unit ${unitId} is level ${unit.progression.level} but skill requires level ${skill.level || 1}.`);
        return false;
    }

    // Apply skill logic here (damage, buffs, etc.)
    // For now, just put it on cooldown.
    console.log(`Unit ${unitId} used skill ${skill.name}. Putting on cooldown for ${skill.cooldown} seconds.`);
    unit.combat.cooldowns[skillId] = skill.cooldown;
    
    liveUnits[unitIndex] = unit;

    return true;
  },
  
  processCooldowns: () => {
    const TICK_INTERVAL_S = 1; // Corresponds to game-loop.ts, runs once per second
    liveUnits = liveUnits.map(unit => {
        let hasChanged = false;

        // Process skill cooldowns
        const newCooldowns = { ...unit.combat.cooldowns };
        for (const skillId in newCooldowns) {
            if (newCooldowns[skillId] > 0) {
                newCooldowns[skillId] = Math.max(0, newCooldowns[skillId] - TICK_INTERVAL_S);
                if(newCooldowns[skillId] === 0) {
                    delete newCooldowns[skillId];
                }
                hasChanged = true;
            }
        }
        
        // Process attack cooldown
        let newAttackCooldown = unit.combat.attackCooldown;
        if (newAttackCooldown > 0) {
            newAttackCooldown = Math.max(0, newAttackCooldown - TICK_INTERVAL_S);
            hasChanged = true;
        }

        if (hasChanged) {
            return { ...unit, combat: { ...unit.combat, cooldowns: newCooldowns, attackCooldown: newAttackCooldown } };
        }
        return unit;
    });
  },

  processUnitActions: () => {
    if (!isGameStarted) return;
    
    liveUnits = liveUnits.map(unit => {
      if (unit.combat.status !== 'alive') return unit; // Skip dead/down units
      
      if (unit.control.focus) {
        const target = liveUnits.find(u => u.id === unit.control.focus);
        if (target && target.combat.status === 'alive') {
            const distance = calculateDistance(unit, target);
            const attackRange = 10; // Simplified attack range for all units
            const attackSpeed = unit.stats.spd; // Attacks per second

            if (distance > attackRange) {
                // Move towards target
                const speed = 1; // Simplified speed (units per tick)
                const dx = target.position.x - unit.position.x;
                const dy = target.position.y - unit.position.y;
                const newX = unit.position.x + (dx / distance) * speed;
                const newY = unit.position.y + (dy / distance) * speed;
                
                return {
                    ...unit,
                    position: {
                        x: Math.max(0, Math.min(100, newX)),
                        y: Math.max(0, Math.min(100, newY))
                    }
                }
            } else {
                // In range, let's attack
                if (unit.combat.attackCooldown <= 0) {
                    applyDamage(unit, target);
                    // Reset attack cooldown based on attack speed
                    unit.combat.attackCooldown = 1 / attackSpeed;
                }
            }
        } else {
            // Target is gone or dead, clear focus
            return { ...unit, control: { ...unit.control, focus: undefined } };
        }
      }
      return unit;
    })

  },

  processGameTick: () => {
    if (!isGameStarted) return;

    gameTime = Math.max(0, gameTime - 1);
    
    const elapsedTime = GAME_DURATION_SECONDS - gameTime;
    
    // After 25 mins
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
    liveUnits = [...initialUnits.map(u => ({...u, combat: { ...u.combat, cooldowns: {}, attackCooldown: 0 }, progression: {...u.progression}}))];
    liveTeams = {...teams};
    isGameStarted = false;
    gameTime = GAME_DURATION_SECONDS;
    damageMultiplier = 1;
    console.log('Game state has been reset.');
  }
};
