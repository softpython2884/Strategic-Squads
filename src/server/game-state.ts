
import type { Unit, Team, UnitComposition, Objective } from '@/lib/types';
import type { JoinGameInput, SquadUnit } from '@/app/actions';
import { HEROES_DATA } from '@/lib/heroes';
import * as fs from 'fs';
import * as path from 'path';
import { Grid, AStarFinder } from 'pathfinding';


// =================================================================
// Pathfinding & Map Loading
// =================================================================
let grid: Grid;
let mapWidth: number;
let mapHeight: number;
let tileWidth: number;
let tileHeight: number;

let mapObjectives: Objective[] = [];
const spawnPoints: { [key: string]: { x: number, y: number } } = {
    blue: { x: 10, y: 85 },
    red: { x: 90, y: 15 },
};


function initializeMapAndPathfinding() {
    const tempObjectives: Objective[] = [];
    try {
        const mapPath = path.join(process.cwd(), 'public', 'map.json');
        const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

        mapWidth = mapData.width;
        mapHeight = mapData.height;
        tileWidth = mapData.tilewidth;
        tileHeight = mapData.tileheight;
        grid = new Grid(mapWidth, mapHeight);

        // --- Find Layers ---
        const wallLayer = mapData.layers.find((l: any) => l.name === 'admin'); // Walls
        const objectivesLayer = mapData.layers.find((l: any) => l.name === 'dev' || l.name === 'helper'); // Towers, Idols, Spawns

        // --- Process Walls for Pathfinding ---
        if (wallLayer && wallLayer.type === 'tilelayer') {
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                    const tileIndex = y * mapWidth + x;
                    if (wallLayer.data[tileIndex] !== 0) {
                        grid.setWalkableAt(x, y, false);
                    }
                }
            }
            console.log('Pathfinding grid initialized with walls from "admin" layer.');
        } else {
            console.warn("Could not find a 'admin' tile layer for walls in map.json. All tiles are walkable.");
        }

        // --- Process Objectives & Spawns from Tile Layers ---
        const devLayer = mapData.layers.find((l: any) => l.name === 'dev'); // Towers/Idols
        const helperLayer = mapData.layers.find((l: any) => l.name === 'helper'); // Spawns
        
        // Find tilesets by name
        const tilesets: {[key: string]: any} = {};
        mapData.tilesets.forEach((ts: any) => {
            tilesets[ts.name] = ts;
        });

        // Parse Towers/Idols from 'dev' layer
        if (devLayer && devLayer.type === 'tilelayer') {
             for (let y = 0; y < mapHeight -1; y++) {
                for (let x = 0; x < mapWidth -1; x++) {
                    const tileIndex = y * mapWidth + x;
                    const gid = devLayer.data[tileIndex];
                    if (gid === 0) continue;

                    let team: 'blue' | 'red' | null = null;
                    let type: 'tower' | 'idol' | null = null;
                    
                    if (tilesets.blue_tower && gid >= tilesets.blue_tower.firstgid && gid < tilesets.blue_tower.firstgid + tilesets.blue_tower.tilecount) {
                        team = 'blue';
                        type = 'tower';
                    } else if (tilesets.red_tower && gid >= tilesets.red_tower.firstgid && gid < tilesets.red_tower.firstgid + tilesets.red_tower.tilecount) {
                        team = 'red';
                        type = 'tower';
                    }
                    
                    if (team && type) {
                         tempObjectives.push({
                            id: `${type}-${team}-${x}-${y}`,
                            name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${team.charAt(0).toUpperCase() + team.slice(1)}`,
                            position: { x: ((x + 1) / mapWidth) * 100, y: ((y + 1) / mapHeight) * 100 }, // Center of the 2x2 structure
                            teamId: team,
                            type: type,
                            stats: { hp: 5000, maxHp: 5000 }
                        });
                        // Mark the 2x2 area as unwalkable
                        grid.setWalkableAt(x, y, false);
                        grid.setWalkableAt(x+1, y, false);
                        grid.setWalkableAt(x, y+1, false);
                        grid.setWalkableAt(x+1, y+1, false);
                        // Skip the next tile to avoid double counting
                        x++; 
                    }
                }
            }
        }
        
        // Parse Spawns from 'helper' layer
         if (helperLayer && helperLayer.type === 'tilelayer') {
            for (let y = 0; y < mapHeight; y++) {
                for (let x = 0; x < mapWidth; x++) {
                     const tileIndex = y * mapWidth + x;
                     const gid = helperLayer.data[tileIndex];
                     if (gid === 0) continue;
                     
                      if (tilesets.blue_spawn && gid >= tilesets.blue_spawn.firstgid) {
                         spawnPoints.blue = { x: (x / mapWidth) * 100, y: (y / mapHeight) * 100 };
                      } else if (tilesets.red_spawn && gid >= tilesets.red_spawn.firstgid) {
                         spawnPoints.red = { x: (x / mapWidth) * 100, y: (y / mapHeight) * 100 };
                      }
                }
            }
            console.log("Updated spawn points from 'helper' layer:", spawnPoints);
         }


    } catch (error) {
        console.error('Failed to initialize map data:', error);
        // Fallback to a default grid if map loading fails
        mapWidth = 64; mapHeight = 64; tileWidth = 32; tileHeight = 32;
        grid = new Grid(mapWidth, mapHeight);
    }
    mapObjectives = tempObjectives;
    console.log(`Loaded ${mapObjectives.length} objectives from map file.`);
}

// Call this once on server startup
initializeMapAndPathfinding();


// =================================================================
// Game State
// =================================================================

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
// =================================================================

const GAME_DURATION_SECONDS = 25 * 60;
const SKILL_RANGE = 15; // Generic skill range for now

let liveUnits: Unit[] = [];
let liveTeams = {...teams};
let isGameStarted = false;
let gameTime = GAME_DURATION_SECONDS; // Countdown timer
let damageMultiplier = 1;


function getInitialUnitsFromObjectives(): Unit[] {
    return mapObjectives.map(obj => {
        const unit: Unit = {
            id: obj.id,
            name: obj.name,
            type: obj.type,
            heroId: `objective_${obj.type}`,
            teamId: obj.teamId as 'blue' | 'red',
            composition: 'défense', // Objectives are defensive
            position: obj.position,
            stats: {
                hp: obj.stats?.hp ?? 5000,
                maxHp: obj.stats?.maxHp ?? 5000,
                resource: 0,
                maxResource: 0,
                atk: 50, // Towers can attack
                def: 200,
                spd: 1,
            },
            progression: {
                xp: 0,
                level: 1,
                xpToNextLevel: 99999,
                respawnTimeRemaining: 0,
            },
            combat: {
                cooldowns: {},
                attackCooldown: 0,
                buffs: [],
                debuffs: [],
                status: 'alive',
            },
            control: {}
        };
        return unit;
    });
}


// Function to calculate distance between two units or a unit and a point
const calculateDistance = (posA: {x: number, y: number}, posB: {x: number, y: number}): number => {
    const dx = posA.x - posB.x;
    const dy = posA.y - posB.y;
    return Math.sqrt(dx * dx + dy * dy);
};

// Function to apply damage from an attacker to a defender
const applyDamage = (attacker: Unit | null, defender: Unit, baseDamage: number) => {
    // If there's an attacker, factor in their stats. Otherwise, just use base damage.
    const attackerAtk = attacker ? attacker.stats.atk * damageMultiplier : 0;
    const totalDamage = Math.max(0, baseDamage + attackerAtk - defender.stats.def);
    
    defender.stats.hp = Math.max(0, defender.stats.hp - totalDamage);
    
    // console.log(`${attacker?.name || 'Skill'} damaged ${defender.name} for ${totalDamage}. HP: ${defender.stats.hp}`);

    if (defender.stats.hp <= 0) {
        defender.combat.status = 'down';
        defender.control.focus = undefined; // Stop attacking when down
        defender.control.moveTarget = undefined;
        console.log(`${defender.name} has been defeated.`);
        if (attacker) {
            gameState.grantXp(attacker.id, 50); // Grant 50 xp for a kill
        }
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

        const spawnArea = spawnPoints[input.teamId];

        const newUnit: Unit = {
            id: `${input.pseudo}-${heroData.id}-${index}`,
            name: heroData.name,
            type: heroData.class,
            heroId: heroData.id,
            teamId: input.teamId,
            composition: input.squadType,
            position: { 
                // Randomize spawn position slightly around the base
                x: spawnArea.x + (Math.random() - 0.5) * 8, 
                y: spawnArea.y + (Math.random() - 0.5) * 8
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
  
  setPlayerMoveTarget: (unitIds: string[], position: { x: number, y: number }) => {
     liveUnits = liveUnits.map(unit => {
      if (unitIds.includes(unit.id)) {
        if (unit.combat.status !== 'alive') return unit;
        
        // Convert world % to grid coordinates
        const startX = Math.floor(unit.position.x / 100 * mapWidth);
        const startY = Math.floor(unit.position.y / 100 * mapHeight);
        const endX = Math.floor(position.x / 100 * mapWidth);
        const endY = Math.floor(position.y / 100 * mapHeight);

        const gridClone = grid.clone();
        const finder = new AStarFinder();
        
        // Ensure start and end nodes are walkable for the finder
        gridClone.setWalkableAt(startX, startY, true);
        gridClone.setWalkableAt(endX, endY, true);

        const path = finder.findPath(startX, startY, endX, endY, gridClone);

        if (path && path.length > 0) {
             // Convert path back to world coordinates
            const worldPath = path.map(p => [(p[0] / mapWidth * 100), (p[1] / mapHeight * 100)]);
            return {
                ...unit,
                control: {
                    ...unit.control,
                    moveTarget: position, // Keep final destination
                    focus: undefined,
                    path: worldPath,
                }
            }
        } else {
            console.log(`No path found for unit ${unit.id} from (${startX},${startY}) to (${endX},${endY})`);
        }
      }
      return unit;
    });
  },

  setPlayerAttackFocus: (unitIds: string[], targetId: string | null, position: {x: number, y: number}) => {
    liveUnits = liveUnits.map(unit => {
        if (unitIds.includes(unit.id)) {
            if (unit.combat.status !== 'alive') return unit;
            return {
                ...unit,
                control: {
                    ...unit.control,
                    focus: targetId || undefined,
                    moveTarget: targetId ? undefined : position,
                    path: undefined, // Clear path when attacking
                }
            }
        }
        return unit;
    })
    console.log(`Units ${unitIds.join(', ')} assigned focus to ${targetId || 'a position'}.`);
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
  
  useSkill: (unitId: string, skillId: string, targetId?: string) => {
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

    // --- Apply skill logic here ---
    // If the skill does damage and has a target
    if (skill.damage > 0 && targetId) {
        const targetIndex = liveUnits.findIndex(u => u.id === targetId);
        if (targetIndex === -1) {
            console.log(`Skill target ${targetId} not found.`);
            return false;
        }
        let target = liveUnits[targetIndex];

        // Check range
        const distance = calculateDistance(unit.position, target.position);
        if (distance > SKILL_RANGE) {
            console.log(`Target ${targetId} is out of range for skill ${skill.name}.`);
            // In the future, we could make the unit move into range here.
            return false;
        }

        // Apply damage
        console.log(`Unit ${unit.name} uses ${skill.name} on ${target.name} for ${skill.damage} base damage.`);
        applyDamage(unit, target, skill.damage);
        liveUnits[targetIndex] = target; // Update target in liveUnits
    }
    
    // --- End skill logic ---
    
    console.log(`Putting skill ${skill.name} on cooldown for ${skill.cooldown} seconds.`);
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
            newAttackCooldown = Math.max(0, newAttackCooldown - (TICK_INTERVAL_S / 4)); // attack cooldown is faster
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

    const speed = 1; // Simplified speed (units per tick)
    const attackRange = 10;

    liveUnits = liveUnits.map(unit => {
      if (unit.combat.status !== 'alive') return unit;
      
      // 1. Pathfinding Movement
      if (unit.control.path && unit.control.path.length > 0) {
        const nextNode = unit.control.path[0];
        const targetPos = {
            x: nextNode[0],
            y: nextNode[1],
        };

        const dist = calculateDistance(unit.position, targetPos);

        if (dist > speed) {
            const dx = targetPos.x - unit.position.x;
            const dy = targetPos.y - unit.position.y;
            unit.position.x += (dx / dist) * speed;
            unit.position.y += (dy / dist) * speed;
        } else {
            // Reached the node, remove it from path
            unit.control.path.shift();
            if (unit.control.path.length === 0) {
                unit.control.path = undefined; // Path completed
                unit.control.moveTarget = undefined;
            }
        }
      }
      // 2. Handle explicit attack orders
      else if (unit.control.focus) {
        const target = liveUnits.find(u => u.id === unit.control.focus);
        if (target && target.combat.status === 'alive') {
            const dist = calculateDistance(unit.position, target.position);
            
            if (dist > attackRange) {
                // Move towards target (no pathfinding for attacks yet)
                const dx = target.position.x - unit.position.x;
                const dy = target.position.y - unit.position.y;
                unit.position.x += (dx / dist) * speed;
                unit.position.y += (dy / dist) * speed;
            } else {
                // In range, attack
                if (unit.combat.attackCooldown <= 0) {
                    applyDamage(unit, target, 0);
                    unit.combat.attackCooldown = 1 / unit.stats.spd;
                }
                unit.control.moveTarget = undefined;
            }
        } else {
            unit.control.focus = undefined;
        }
      } 
      // 3. Handle old move orders (if path failed or not used)
      else if (unit.control.moveTarget) {
          const dist = calculateDistance(unit.position, unit.control.moveTarget);
          if (dist > speed) {
            const dx = unit.control.moveTarget.x - unit.position.x;
            const dy = unit.control.moveTarget.y - unit.position.y;
            unit.position.x += (dx / dist) * speed;
            unit.position.y += (dy / dist) * speed;
          } else {
            unit.position.x = unit.control.moveTarget.x;
            unit.position.y = unit.control.moveTarget.y;
            unit.control.moveTarget = undefined;
          }
      }

      // Clamp position between 0 and 100
      unit.position.x = Math.max(0, Math.min(100, unit.position.x));
      unit.position.y = Math.max(0, Math.min(100, unit.position.y));
      
      return unit;
    })
  },

  processGameTick: () => {
    if (!isGameStarted) return;

    gameTime = Math.max(0, gameTime - 1);
    
    const elapsedTime = GAME_DURATION_SECONDS - gameTime;
    
    if (elapsedTime >= (25 * 60) && elapsedTime < (30 * 60)) {
        if (damageMultiplier !== 2) {
            console.log("Game time > 25 mins. Damage multiplier is now x2.");
            damageMultiplier = 2;
        }
    } 
    else if (elapsedTime >= (30 * 60)) {
        if (damageMultiplier !== 5) {
            console.log("Game time > 30 mins. Damage multiplier is now x5.");
            damageMultiplier = 5;
        }
    }
  },

  reset: () => {
    initializeMapAndPathfinding();
    liveUnits = getInitialUnitsFromObjectives();
    liveTeams = {...teams};
    isGameStarted = false;
    gameTime = GAME_DURATION_SECONDS;
    damageMultiplier = 1;
    console.log('Game state has been reset.');
  }
};
