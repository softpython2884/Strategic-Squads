
import { v4 as uuidv4 } from 'uuid';

export interface Position {
    x: number;
    y: number;
}

export abstract class Entity {
    public id: string;
    public position: Position;
    public name: string;
    public type: string;

    constructor(name: string, type: string, position: Position = { x: 0, y: 0 }) {
        this.id = uuidv4();
        this.name = name;
        this.type = type;
        this.position = position;
    }

    // Common methods like distanceTo, etc.
    public distanceTo(other: Entity | Position): number {
        const otherPos = 'position' in other ? other.position : other;
        const dx = this.position.x - otherPos.x;
        const dy = this.position.y - otherPos.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
