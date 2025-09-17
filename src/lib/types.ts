
export type UnitComposition = 'attaque' | 'défense' | 'capture' | 'recherche';

export type UnitStatus = 'alive' | 'down' | 'dead';

export type Unit = {
  // Identity
  id: string;
  name: string;
  type: string; // e.g., 'Knight', 'Archer', 'Tower', 'Idol'
  teamId: 'blue' | 'red';
  
  // Role
  composition: UnitComposition;
  
  // Position
  position: {
    x: number;
    y: number;
  };
  
  // Base Stats
  stats: {
    hp: number;
    maxHp: number;
    resource: number; // mana, energy, etc.
    maxResource: number;
    atk: number;
    def: number;
    spd: number;
  };

  // Progression
  progression: {
    xp: number;
    level: number;
    xpToNextLevel: number;
    respawnTimeRemaining: number;
  };

  // Combat State
  combat: {
    cooldowns: { [skillId: string]: number };
    buffs: string[];
    debuffs: string[];
    status: UnitStatus;
  };

  // Control
  control: {
    controllerPlayerId?: string;
    focus?: string; // target entity id
  };
  
};

export type Team = {
  name: string;
  color: string;
  bgClass: string;
  textClass: string;
};
