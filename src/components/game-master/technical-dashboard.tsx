
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AiBehaviorTester from "./ai-behavior-tester";
import EventLog from "./event-log";
import TeamStatsChart from "./team-stats-chart";
import UnitCompositionChart from "./unit-composition-chart";
import { gameState } from "@/server/game-state";

export default function TechnicalDashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Simulation de Comportement IA</CardTitle>
            <CardDescription>Testez et vérifiez les réponses des unités IA en fonction de l'état du jeu.</CardDescription>
          </CardHeader>
          <CardContent>
            <AiBehaviorTester />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Taux de Ressources par Équipe</CardTitle>
            <CardDescription>Ressources collectées par minute par chaque équipe.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamStatsChart data={gameState.getTeamResourceData()} />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Journal des Événements du Jeu</CardTitle>
            <CardDescription>Flux en direct des événements importants du jeu avec des résumés par IA.</CardDescription>
          </CardHeader>
          <CardContent>
            <EventLog />
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Composition des Unités</CardTitle>
            <CardDescription>Distribution actuelle des unités dans les deux équipes.</CardDescription>
          </CardHeader>
          <CardContent>
            <UnitCompositionChart data={gameState.getUnitCompositionData()} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
