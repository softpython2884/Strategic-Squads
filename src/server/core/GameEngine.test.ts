
// Mock MapManager before importing GameEngine
jest.mock('@/server/core/MapManager');

import { GameEngine } from '@/server/core/GameEngine';
import type { JoinGameInput } from '@/app/actions';

describe('GameEngine Core Logic', () => {
    let engine: GameEngine;

    beforeEach(() => {
        engine = new GameEngine();
        engine.startGame();
    });

    it('should initialize with default state', () => {
        expect(engine.gameTime).toBeGreaterThan(0);
        expect(engine.isGameStarted).toBe(true);
        expect(engine.units).toEqual([]);
    });

    it('should add player squad correctly', () => {
        const input: JoinGameInput = {
            pseudo: 'TestPlayer',
            teamId: 'blue',
            squadType: 'attaque',
            squad: [
                { id: 'hero_001', name: 'Rokgar', type: 'Blindé' },
                { id: 'hero_002', name: 'Kaelith', type: 'Assassin' },
            ]
        };

        engine.addPlayerSquad(input);
        expect(engine.units.length).toBe(2);
        expect(engine.units[0].teamId).toBe('blue');
        expect(engine.units[0].control.controllerPlayerId).toBe('TestPlayer');
    });

    it('should process movement logic', () => {
        engine.addPlayerSquad({
            pseudo: 'Mover',
            teamId: 'blue',
            squadType: 'attaque',
            squad: [{ id: 'hero_001', name: 'Rokgar', type: 'Blindé' }]
        });
        const unit = engine.units[0];

        unit.position = { x: 10, y: 10 };
        const target = { x: 20, y: 10 };

        engine.setPlayerMoveTarget([unit.id], target);
        engine.processUnitActions();

        expect(unit.position.x).toBeGreaterThan(10);
        expect(unit.position.y).toBe(10);
    });

    it('should calculate damage with defense mitigation', () => {
        engine.addPlayerSquad({
            pseudo: 'Attacker',
            teamId: 'blue',
            squadType: 'attaque',
            squad: [{ id: 'hero_001', name: 'Rokgar', type: 'Blindé' }]
        });
        engine.addPlayerSquad({
            pseudo: 'Defender',
            teamId: 'red',
            squadType: 'défense',
            squad: [{ id: 'hero_006', name: 'Korrvak', type: 'Blindé' }]
        });

        const attacker = engine.units.find(u => u.teamId === 'blue');
        const defender = engine.units.find(u => u.teamId === 'red');

        if (!attacker || !defender) throw new Error('Units not found');

        const initialHp = defender.stats.hp;
        const damage = 100;

        engine.applyDamage(attacker, defender, damage);

        expect(defender.stats.hp).toBeLessThan(initialHp);
        const damageDealt = initialHp - defender.stats.hp;
        expect(damageDealt).toBeGreaterThan(0);
        expect(damageDealt).toBeLessThan(damage); // Should be mitigated
    });

    it('should handle skill cooldowns', () => {
        engine.addPlayerSquad({
            pseudo: 'Caster',
            teamId: 'blue',
            squadType: 'attaque',
            squad: [{ id: 'hero_003', name: 'Solthar', type: 'Mage' }]
        });
        engine.addPlayerSquad({
            pseudo: 'Target',
            teamId: 'red',
            squadType: 'défense',
            squad: [{ id: 'hero_006', name: 'Korrvak', type: 'Blindé' }]
        });

        const unit = engine.units.find(u => u.teamId === 'blue');
        const target = engine.units.find(u => u.teamId === 'red');

        if (!unit || !target) throw new Error('Units not found');

        unit.position = { x: 10, y: 10 };
        target.position = { x: 12, y: 10 };

        const skillId = "1";
        const success = engine.useSkill(unit.id, skillId, target.id);

        expect(success).toBe(true);
        expect(unit.combat.cooldowns[skillId]).toBeGreaterThan(0);

        engine.processCooldowns();
        expect(unit.combat.cooldowns[skillId]).toBeLessThan(5);
    });

    it('should apply status effects correctly', () => {
        engine.addPlayerSquad({
            pseudo: 'Shielder',
            teamId: 'blue',
            squadType: 'défense',
            squad: [{ id: 'hero_006', name: 'Korrvak', type: 'Blindé' }]
        });

        const unit = engine.units[0];

        engine.applyStatus(unit, 'shield', 3);
        expect(unit.combat.buffs).toContain('shield');
    });

    it('should handle HP regeneration for defense units', () => {
        engine.addPlayerSquad({
            pseudo: 'Defender',
            teamId: 'blue',
            squadType: 'défense',
            squad: [{ id: 'hero_006', name: 'Korrvak', type: 'Blindé' }]
        });

        const unit = engine.units[0];
        const maxHp = unit.stats.maxHp;
        unit.stats.hp = Math.floor(maxHp * 0.5);
        const hpBefore = unit.stats.hp;

        engine.processGameTick();

        expect(unit.stats.hp).toBeGreaterThan(hpBefore);
    });
});
