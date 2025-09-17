
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Swords, FlaskConical, Crosshair, TowerControl, Users, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Unit, Team } from "@/lib/types";
import { Progress } from "../ui/progress";

const compositionIcons: { [key in Unit['composition']]: React.ReactNode } = {
  attaque: <Swords className="w-4 h-4" />,
  défense: <Shield className="w-4 h-4" />,
  capture: <Crosshair className="w-4 h-4" />,
  recherche: <FlaskConical className="w-4 h-4" />,
};

const objectives = [
  { id: 1, name: "Tour Nord", position: { x: 5, y: 1 }, type: 'tower' },
  { id: 2, name: "Idole Sud", position: { x: 4, y: 8 }, type: 'idol' },
];

type StrategicMapViewProps = {
  units: Unit[];
  teams: { [key: string]: Team };
}

// Helper to group units by player
const groupUnitsByPlayer = (units: Unit[]) => {
  const playerGroups: { [key: string]: Unit[] } = {};
  units.forEach(unit => {
    if (unit.control.controllerPlayerId) {
      if (!playerGroups[unit.control.controllerPlayerId]) {
        playerGroups[unit.control.controllerPlayerId] = [];
      }
      playerGroups[unit.control.controllerPlayerId].push(unit);
    }
  });
  return playerGroups;
}

export default function StrategicMapView({ units, teams }: StrategicMapViewProps) {
  const mapUnits = units.slice(0, 10); // Show a subset of units on the map
  const playerGroups = groupUnitsByPlayer(units);

  const getTeamCommanders = (teamId: 'blue' | 'red') => {
    const teamPlayerIds = new Set<string>();
    units.filter(u => u.teamId === teamId && u.control.controllerPlayerId).forEach(u => teamPlayerIds.add(u.control.controllerPlayerId!));
    
    // Sort to have a consistent order
    return Array.from(teamPlayerIds).sort().map(playerId => {
      const playerUnits = playerGroups[playerId] || [];
      const squadComposition = playerUnits[0]?.composition || 'attaque';
      const avgHp = playerUnits.reduce((acc, u) => acc + (u.stats.hp / u.stats.maxHp), 0) / (playerUnits.length || 1) * 100;

      return {
        id: playerId,
        name: `Cmdr ${playerId.replace('player', '')}`,
        composition: squadComposition,
        avgHp: Math.round(avgHp),
        units: playerUnits
      }
    });
  }

  const blueCommanders = getTeamCommanders('blue');
  const redCommanders = getTeamCommanders('red');

  const CommanderCard = ({ commander, team }: { commander: ReturnType<typeof getTeamCommanders>[0], team: Team }) => (
    <div className="p-3 rounded-lg bg-muted/30">
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold">{commander.name}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {compositionIcons[commander.composition]}
          <span className="capitalize">{commander.composition}</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs">
          <Heart className="w-3 h-3 text-red-500" />
          <Progress value={commander.avgHp} className="h-2" indicatorClassName={team.bgClass} />
          <span className="w-8 text-right">{commander.avgHp}%</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Users className="w-3 h-3" />
          <span>{commander.units.length} Unités vivantes</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Carte Stratégique</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* Blue Team Commanders */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="text-xl font-bold text-center" style={{ color: teams.blue.color }}>{teams.blue.name}</h3>
            {blueCommanders.map(c => <CommanderCard key={c.id} commander={c} team={teams.blue} />)}
          </div>
          
          {/* Map */}
          <div className="lg:col-span-3">
            <TooltipProvider>
              <div className="relative w-full overflow-auto bg-card aspect-square">
                <div className="grid grid-cols-10 grid-rows-10 gap-px p-2 bg-border">
                  {Array.from({ length: 100 }).map((_, i) => {
                    const x = (i % 10) + 1;
                    const y = Math.floor(i / 10) + 1;

                    const unit = mapUnits.find(u => u.position.x === x && u.position.y === y);
                    const objective = objectives.find(o => o.position.x === x && o.position.y === y);

                    return (
                      <div key={i} className="relative flex items-center justify-center w-full h-full bg-background aspect-square">
                        {unit && (
                          <Tooltip>
                            <TooltipTrigger>
                              <div
                                className={cn(
                                  "flex items-center justify-center w-8 h-8 rounded-full z-10 animate-pulse",
                                  teams[unit.teamId]?.bgClass,
                                  teams[unit.teamId]?.textClass
                                )}
                              >
                                {compositionIcons[unit.composition]}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-bold">{unit.name}</p>
                              <p>Équipe: {teams[unit.teamId]?.name}</p>
                              <p>Santé: {unit.stats.hp}</p>
                              <p>Rôle: {unit.composition}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {objective && (
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="absolute z-0 text-accent">
                                <TowerControl className="w-10 h-10" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-bold">{objective.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </TooltipProvider>
          </div>

          {/* Red Team Commanders */}
          <div className="space-y-3 lg:col-span-1">
             <h3 className="text-xl font-bold text-center" style={{ color: teams.red.color }}>{teams.red.name}</h3>
             {redCommanders.map(c => <CommanderCard key={c.id} commander={c} team={teams.red} />)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
