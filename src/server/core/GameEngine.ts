
import { Unit } from './Unit';
import { MapManager } from './MapManager';
import { HEROES_DATA } from '@/lib/heroes';
import type { JoinGameInput } from '@/app/actions';
import type { Team, Unit as IUnit } from '@/lib/types';

export class GameEngine {
    public units: Unit[] = [];
    public teams: { [key: string]: Team } = {
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

    // Placeholder legacy data
    public getGameEventsLog() {
        return `
        [00:15] Début de la partie. Les portes sont ouvertes.
        [01:30] Le Chevalier Bleu engage le Berserker Rouge près de la voie du milieu.
        [01:32] Santé du Chevalier Bleu : 75. Santé du Berserker Rouge : 60.
        [01:38] L'Archer Bleu soutient le Chevalier Bleu. Le Berserker Rouge bat en retraite.
        [02:10] Infiltrateur Rouge repéré près de la Tour Nord.
        `;
    }
    public getTeamResourceData() {
        return [
            { minute: "Min 1", blue: 150, red: 140 },
            { minute: "Min 2", blue: 320, red: 310 },
            { minute: "Min 3", blue: 500, red: 480 },
        ];
    }
    public getUnitCompositionData() {
        return [
            { composition: "attaque", blue: 2, red: 3 },
            { composition: "défense", blue: 1, red: 1 },
            { composition: "capture", blue: 1, red: 1 },
            { composition: "escarmouche", blue: 1, red: 1 },
        ];
    }

    public mapManager: MapManager;
    public isGameStarted: boolean = false;
    public gameTime: number = 25 * 60; // 25 mins
    public damageMultiplier: number = 1;

    // Constants
    private readonly GAME_DURATION_SECONDS = 25 * 60;
    private readonly SKILL_RANGE = 15;

    constructor() {
        this.mapManager = new MapManager();
        this.mapManager.initialize();
        this.reset();
    }

    public reset() {
        this.units = this.getInitialUnitsFromObjectives();
        this.gameTime = this.GAME_DURATION_SECONDS;
        this.damageMultiplier = 1;
        this.isGameStarted = false;
        console.log('GameEngine reset complete.');
    }

    public startGame() {
        if (this.isGameStarted) return;
        this.isGameStarted = true;
        this.gameTime = this.GAME_DURATION_SECONDS;
        console.log("Game started.");
    }

    private getInitialUnitsFromObjectives(): Unit[] {
        return this.mapManager.objectives.map(obj => {
            return new Unit({
                id: obj.id,
                name: obj.name,
                type: obj.type,
                heroId: `objective_${obj.type}`,
                teamId: obj.teamId as 'blue' | 'red',
                composition: 'défense',
                position: obj.position,
                stats: {
                    hp: obj.stats?.hp ?? 5000,
                    maxHp: obj.stats?.maxHp ?? 5000,
                    resource: 0,
                    maxResource: 0,
                    atk: 50,
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
            });
        });
    }

    public addPlayerSquad(input: JoinGameInput) {
        console.log(`Player ${input.pseudo} joining team ${input.teamId}`);
        // Remove existing
        this.units = this.units.filter(u => u.control.controllerPlayerId !== input.pseudo);

        const spawnArea = this.mapManager.spawnPoints[input.teamId];

        input.squad.forEach((squadUnit, index) => {
            const heroData = HEROES_DATA.find(h => h.id === squadUnit.id);
            if (!heroData) return;

            const newUnit = new Unit({
                id: `${input.pseudo}-${heroData.id}-${index}`,
                name: heroData.name,
                type: heroData.class,
                heroId: heroData.id,
                teamId: input.teamId,
                composition: input.squadType,
                position: {
                    x: spawnArea.x + (Math.random() - 0.5) * 8,
                    y: spawnArea.y + (Math.random() - 0.5) * 8
                },
                stats: {
                    ...heroData.stats,
                    hp: heroData.stats.maxHp,
                },
                progression: {
                    xp: 0, level: 1, xpToNextLevel: 100, respawnTimeRemaining: 0
                },
                combat: {
                    cooldowns: {}, attackCooldown: 0, buffs: [], debuffs: [], status: 'alive'
                },
                control: { controllerPlayerId: input.pseudo }
            });
            this.units.push(newUnit);
        });
    }


    public processGameTick() {
        if (!this.isGameStarted) return;
        this.gameTime = Math.max(0, this.gameTime - 1);

        // Damage multiplier logic
        const elapsedTime = this.GAME_DURATION_SECONDS - this.gameTime;
        if (elapsedTime >= (25 * 60)) this.damageMultiplier = 2;
        if (elapsedTime >= (30 * 60)) this.damageMultiplier = 5;

        // Process Status Effects (Buffs/Debuffs) & Regen
        this.units.forEach(unit => {
            if (!unit.isAlive()) return;

            // Regenerate Resource (Mana/Energy) - simplified 1 per tick
            if (unit.stats.resource < unit.stats.maxResource) {
                unit.stats.resource = Math.min(unit.stats.maxResource, unit.stats.resource + 1);
            }
            // Regenerate HP (0.1% max hp per tick? or just composition bonus?)
            if (unit.stats.hp < unit.stats.maxHp) {
                let regen = Math.floor(unit.stats.maxHp * 0.005); // 0.5% per sec
                if (unit.composition === 'défense') regen *= 2; // Defense units regen faster
                unit.stats.hp = Math.min(unit.stats.maxHp, unit.stats.hp + regen);
            }
        });
    }

    public processCooldowns() {
        const TICK_INTERVAL_S = 1;
        this.units.forEach(unit => {
            if (!unit.isAlive()) return;

            // Skill cooldowns
            for (const skillId in unit.combat.cooldowns) {
                if (unit.combat.cooldowns[skillId] > 0) {
                    unit.combat.cooldowns[skillId] = Math.max(0, unit.combat.cooldowns[skillId] - TICK_INTERVAL_S);
                    if (unit.combat.cooldowns[skillId] === 0) delete unit.combat.cooldowns[skillId];
                }
            }
            // Attack cooldown
            if (unit.combat.attackCooldown > 0) {
                unit.combat.attackCooldown = Math.max(0, unit.combat.attackCooldown - (TICK_INTERVAL_S / 4));
            }
        });
    }

    public processUnitActions() {
        if (!this.isGameStarted) return;
        const speed = 1;
        const attackRange = 10;

        this.units.forEach(unit => {
            if (!unit.isAlive()) return;

            // 1. Pathfinding (simplified for now, ideally use grid)
            if (unit.control.path && unit.control.path.length > 0) {
                const nextNode = unit.control.path[0];
                const targetPos = { x: nextNode[0], y: nextNode[1] };
                if (unit.distanceTo(targetPos) > speed) {
                    this.moveUnitTowards(unit, targetPos, speed);
                } else {
                    unit.control.path.shift();
                    if (unit.control.path.length === 0) {
                        unit.control.path = undefined;
                        unit.control.moveTarget = undefined;
                    }
                }
            }
            // 2. Attack Focus
            else if (unit.control.focus) {
                const target = this.units.find(u => u.id === unit.control.focus);
                if (target && target.isAlive()) {
                    if (unit.distanceTo(target) > attackRange) {
                        this.moveUnitTowards(unit, target.position, speed);
                    } else {
                        if (unit.combat.attackCooldown <= 0) {
                            this.applyDamage(unit, target, unit.stats.atk);
                            unit.combat.attackCooldown = 1 / unit.stats.spd;
                        }
                        unit.control.moveTarget = undefined;
                    }
                } else {
                    unit.control.focus = undefined;
                }
            }
            // 3. Simple Move Target
            else if (unit.control.moveTarget) {
                if (unit.distanceTo(unit.control.moveTarget) > speed) {
                    this.moveUnitTowards(unit, unit.control.moveTarget, speed);
                } else {
                    unit.position.x = unit.control.moveTarget.x;
                    unit.position.y = unit.control.moveTarget.y;
                    unit.control.moveTarget = undefined;
                }
            }

            // Clamp
            unit.position.x = Math.max(0, Math.min(100, unit.position.x));
            unit.position.y = Math.max(0, Math.min(100, unit.position.y));
        });
    }

    private moveUnitTowards(unit: Unit, target: { x: number, y: number }, speed: number) {
        const dist = unit.distanceTo(target);
        if (dist === 0) return;
        const dx = target.x - unit.position.x;
        const dy = target.y - unit.position.y;
        unit.position.x += (dx / dist) * speed;
        unit.position.y += (dy / dist) * speed;
    }


    public applyDamage(attacker: Unit | null, defender: Unit, rawDamage: number) {
        if (!defender.isAlive()) return;

        // 1. Damage Multiplier (Global)
        let amount = rawDamage * (attacker ? this.damageMultiplier : 1);

        // 2. Defense Mitigation
        // Formula: Damage = Raw * (100 / (100 + Defense))
        const mitigation = 100 / (100 + defender.stats.def);
        amount *= mitigation;

        // 3. Status Effect Modifiers
        if (this.hasStatus(defender, 'shield')) amount *= 0.5; // 50% reduction if shielded (simplified)
        if (this.hasStatus(defender, 'vulnerable')) amount *= 1.3; // +30% dmg taken

        // 4. Composition Bonuses
        if (attacker) {
            if (attacker.composition === 'attaque' && defender.composition === 'défense') {
                amount *= 1.2; // Attack breaks Defense
            }
            if (attacker.composition === 'escarmouche' && defender.composition === 'capture') {
                amount *= 1.2; // Skirmish hunts Catchers
            }
        }

        // Apply
        defender.takeDamage(Math.floor(amount));

        if (!defender.isAlive()) {
            console.log(`${defender.name} defeated.`);
            if (attacker) this.grantXp(attacker.id, 50);
        }
    }

    private hasStatus(unit: Unit, status: string): boolean {
        return unit.combat.buffs.includes(status) || unit.combat.debuffs.includes(status);
    }

    public applyStatus(unit: Unit, status: string, duration: number) {
        if (!this.hasStatus(unit, status)) {
            unit.combat.buffs.push(status);
            // In a real system we'd track duration per instance, for now we let it slide or handle in tick if we upgrade tick
            // We'll trust the game tick to eventually clear or use a timestamp approach later
            setTimeout(() => {
                unit.combat.buffs = unit.combat.buffs.filter(s => s !== status);
            }, duration * 1000);
        }
    }

    public grantXp(unitId: string, amount: number) {
        const unit = this.units.find(u => u.id === unitId);
        if (!unit || !unit.isAlive()) return;

        unit.progression.xp += amount;
        while (unit.progression.xp >= unit.progression.xpToNextLevel) {
            unit.progression.level++;
            unit.progression.xp -= unit.progression.xpToNextLevel;
            unit.progression.xpToNextLevel = Math.floor(unit.progression.xpToNextLevel * 1.5);

            // Scale stats
            unit.stats.maxHp = Math.floor(unit.stats.maxHp * 1.1);
            unit.stats.hp = unit.stats.maxHp;
            unit.stats.atk = Math.floor(unit.stats.atk * 1.1);
            unit.stats.def = Math.floor(unit.stats.def * 1.1);
        }
    }

    public setPlayerMoveTarget(unitIds: string[], position: { x: number, y: number }) {
        const unitsToMove = this.units.filter(u => unitIds.includes(u.id) && u.isAlive());
        if (unitsToMove.length === 0) return;

        const formationPositions = this.getFormationPositions(position, unitsToMove.length);
        unitsToMove.forEach((unit, index) => {
            unit.control.moveTarget = formationPositions[index];
            unit.control.focus = undefined;
            // TODO: Calculate Path using this.mapManager.grid
        });
    }

    public setPlayerAttackFocus(unitIds: string[], targetId: string | null, position: { x: number, y: number }) {
        this.units.forEach(unit => {
            if (unitIds.includes(unit.id) && unit.isAlive()) {
                unit.control.focus = targetId || undefined;
                unit.control.moveTarget = targetId ? undefined : position;
                unit.control.path = undefined;
            }
        });
    }


    public useSkill(unitId: string, skillId: string, targetId?: string): boolean {
        const unit = this.units.find(u => u.id === unitId);
        if (!unit || !unit.isAlive()) return false;

        if (unit.combat.cooldowns[skillId] > 0) return false;

        const hero = HEROES_DATA.find(h => h.id === unit.heroId);
        const skill = hero?.skills.find(s => s.id.toString() === skillId);

        if (!skill) return false;
        if (unit.progression.level < (skill.level || 1)) return false;

        // Resolve Skill Logic
        this.resolveSkillEffect(unit, skill, targetId);

        unit.combat.cooldowns[skillId] = skill.cooldown;
        return true;
    }

    private resolveSkillEffect(user: Unit, skill: any, targetId?: string) {
        const target = targetId ? this.units.find(u => u.id === targetId) : null;

        // Generic Damage Handler
        if (skill.damage > 0 && target) {
            if (user.distanceTo(target) <= this.SKILL_RANGE) {
                this.applyDamage(user, target, skill.damage);
            }
        }

        // Specific Skill Implementations (Hardcoded for "Wow" factor in prototype)
        // Ideally this would be a data-driven system or scriptable
        switch (skill.name) {
            case "Charge Bestiale": // Rokgar
                if (target) {
                    this.moveUnitTowards(user, target.position, 5); // Dash effect
                    this.applyStatus(target, 'stun', 1);
                }
                break;
            case "Cri de Fureur": // Rokgar
                this.applyStatus(user, 'buff_atk', 5);
                break;
            case "Barrière de Glace": // Ezmyrion
                // Create a wall unit? Or just self buff for now
                this.applyStatus(user, 'shield', 4);
                break;
            case "Soin Rapide": // Hypothetical
                if (target) target.stats.hp = Math.min(target.stats.maxHp, target.stats.hp + 200);
                break;
        }

        // General AoE Handling if skill has "Zone" or "zone" in description (naive parsing)
        if (skill.description.toLowerCase().includes('zone')) {
            const range = 5;
            const center = target ? target.position : user.position;
            this.units.forEach(u => {
                if (u.id !== user.id && u.teamId !== user.teamId && u.isAlive()) {
                    if (Math.hypot(u.position.x - center.x, u.position.y - center.y) < range) {
                        this.applyDamage(user, u, skill.damage * 0.8); // AoE splash damage
                    }
                }
            });
        }
    }

    private getFormationPositions(center: { x: number, y: number }, count: number): { x: number, y: number }[] {
        if (count === 1) return [center];
        const positions: { x: number, y: number }[] = [];
        const separation = 5;
        const numPerRow = Math.ceil(Math.sqrt(count));
        const startOffset = (numPerRow - 1) * separation / 2;

        for (let i = 0; i < count; i++) {
            const row = Math.floor(i / numPerRow);
            const col = i % numPerRow;
            positions.push({
                x: center.x - startOffset + col * separation,
                y: center.y - startOffset + row * separation,
            });
        }
        return positions;
    }
}
