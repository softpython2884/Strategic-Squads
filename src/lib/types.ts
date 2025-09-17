export type UnitComposition = 'attack' | 'defense' | 'capture' | 'research';

export type Unit = {
  id: string;
  name: string;
  teamId: 'blue' | 'red';
  composition: UnitComposition;
  position: {
    x: number;
    y: number;
  };
  stats: {
    health: number;
    mana: number;
  };
  status: string[];
};

export type Team = {
  name: string;
  color: string;
  bgClass: string;
  textClass: string;
};
