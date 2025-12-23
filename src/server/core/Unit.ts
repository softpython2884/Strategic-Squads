
import { Entity, Position } from './Entity';
import type { Unit as IUnit, UnitComposition, UnitStatus, Skill } from '@/lib/types';

export class Unit extends Entity {
    public heroId: string;
    public teamId: 'blue' | 'red';
    public composition: UnitComposition;

    // Stats
    public stats: IUnit['stats'];
    public progression: IUnit['progression'];

    // Combat
    public combat: IUnit['combat'];

    // Control
    public control: IUnit['control'];

    constructor(data: IUnit) {
        super(data.name, data.type, data.position);
        this.id = data.id; // Override UUID if provided or keep it sync
        this.heroId = data.heroId;
        this.teamId = data.teamId;
        this.composition = data.composition;
        this.stats = { ...data.stats };
        this.progression = { ...data.progression };
        this.combat = { ...data.combat };
        this.control = { ...data.control };
    }

    public toJSON(): IUnit {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            heroId: this.heroId,
            teamId: this.teamId,
            composition: this.composition,
            position: this.position,
            stats: this.stats,
            progression: this.progression,
            combat: this.combat,
            control: this.control,
        };
    }

    public isAlive(): boolean {
        return this.combat.status === 'alive';
    }

    public takeDamage(amount: number): void {
        const finalDamage = Math.max(0, amount - this.stats.def);
        this.stats.hp = Math.max(0, this.stats.hp - finalDamage);
        if (this.stats.hp <= 0) {
            this.die();
        }
    }

    public die(): void {
        this.combat.status = 'down';
        this.control.focus = undefined;
        this.control.moveTarget = undefined;
        this.control.path = undefined;
    }
}
