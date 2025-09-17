
import type { Unit, Team, UnitComposition } from '@/lib/types';
import type { JoinGameInput, SquadUnit } from '@/app/actions';

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

const initialUnits: Unit[] = [
  // No initial units, the game will be populated by players joining.
];

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
    { composition: "Attaque", blue: 2, red: 3 },
    { composition: "Défense", blue: 1, red: 1 },
    { composition: "Capture", blue: 1, red: 1 },
    { composition: "Recherche", blue: 1, red: 1 },
];


// =================================================================
// In-Memory Game State Manager
// This will act as our "live" database for the game state.
// In a real scenario, this would be a more robust class or module.
// =================================================================

let liveUnits: Unit[] = [...initialUnits.map(u => ({...u, combat: { ...u.combat, cooldowns: {} }, progression: {...u.progression}}))];
let liveTeams = {...teams};

const getBaseStatsForUnitType = (type: string) => {
    switch (type.toLowerCase()) {
        case 'mage':
            return { maxHp: 60, maxResource: 100, atk: 18, def: 3, spd: 6 };
        case 'valkyrie':
            return { maxHp: 85, maxResource: 50, atk: 15, def: 8, spd: 7 };
        case 'armored':
            return { maxHp: 120, maxResource: 30, atk: 10, def: 15, spd: 4 };
        case 'archer':
            return { maxHp: 70, maxResource: 60, atk: 12, def: 5, spd: 8 };
        default:
            return { maxHp: 100, maxResource: 50, atk: 10, def: 10, spd: 5 };
    }
}

export const gameState = {
  getUnits: () => liveUnits,
  getTeams: () => liveTeams,
  getGameEventsLog: () => gameEventsLog,
  getTeamResourceData: () => teamResourceData,
  getUnitCompositionData: () => unitCompositionData,

  addPlayerSquad: (input: JoinGameInput) => {
    console.log(`Player ${input.pseudo} is joining team ${input.teamId} as ${input.squadType}`);
    
    // Remove existing units for this player to prevent duplicates on reconnect/rejoin
    liveUnits = liveUnits.filter(u => u.control.controllerPlayerId !== input.pseudo);

    const newUnits: Unit[] = input.squad.map((squadUnit, index) => {
        const baseStats = getBaseStatsForUnitType(squadUnit.type);
        const newUnit: Unit = {
            id: `${input.pseudo}-${index}`,
            name: squadUnit.name,
            type: squadUnit.type,
            teamId: input.teamId,
            composition: input.squadType,
            position: { x: Math.floor(Math.random() * 10) + 1, y: Math.floor(Math.random() * 10) + 1 }, // Random position for now
            stats: {
                ...baseStats,
                hp: baseStats.maxHp,
                resource: baseStats.maxResource,
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
    });

    liveUnits.push(...newUnits);
    console.log(`Added ${newUnits.length} new units for player ${input.pseudo}. Total units: ${liveUnits.length}`);
  },
  
  updateUnitPosition: (unitId: string, x: number, y: number): Unit | undefined => {
    let updatedUnit: Unit | undefined;
    liveUnits = liveUnits.map(unit => {
      if (unit.id === unitId) {
        updatedUnit = { ...unit, position: { x, y } };
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
    liveUnits = liveUnits.map(unit => {
      const newCooldowns = { ...unit.combat.cooldowns };
      let hasChanged = false;
      for (const skillId in newCooldowns) {
        if (newCooldowns[skillId] > 0) {
          newCooldowns[skillId]--;
          hasChanged = true;
        }
      }
      if (hasChanged) {
        return { ...unit, combat: { ...unit.combat, cooldowns: newCooldowns } };
      }
      return unit;
    });
  },

  reset: () => {
    // Deep copy to avoid mutation issues on subsequent resets
    liveUnits = [...initialUnits.map(u => ({...u, combat: { ...u.combat, cooldowns: {} }, progression: {...u.progression}}))];
    liveTeams = {...teams};
    console.log('Game state has been reset.');
  }
};
