import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Shield, Swords, FlaskConical, Crosshair, TowerControl } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Unit, Team } from "@/lib/types";

const unitIcons: { [key in Unit["composition"]]: React.ReactNode } = {
  attack: <Swords className="w-4 h-4" />,
  defense: <Shield className="w-4 h-4" />,
  capture: <Crosshair className="w-4 h-4" />,
  research: <FlaskConical className="w-4 h-4" />,
};

const objectives = [
  { id: 1, name: "Tour Nord", position: { x: 5, y: 1 }, type: 'tower' },
  { id: 2, name: "Idole Sud", position: { x: 4, y: 8 }, type: 'idol' },
];

type StrategicMapViewProps = {
  units: Unit[];
  teams: { [key: string]: Team };
}

export default function StrategicMapView({ units, teams }: StrategicMapViewProps) {
  const mapUnits = units.slice(0, 10); // Show a subset of units on the map

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Carte Stratégique</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="relative w-full overflow-auto bg-card aspect-video">
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
                             {unitIcons[unit.composition]}
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
      </CardContent>
    </Card>
  );
}