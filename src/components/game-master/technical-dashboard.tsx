import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AiBehaviorTester from "./ai-behavior-tester";
import EventLog from "./event-log";
import TeamStatsChart from "./team-stats-chart";
import UnitCompositionChart from "./unit-composition-chart";
import { teamResourceData, unitCompositionData } from "@/lib/data";

export default function TechnicalDashboard() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Behavior Simulation</CardTitle>
            <CardDescription>Test and verify AI unit responses based on game state.</CardDescription>
          </CardHeader>
          <CardContent>
            <AiBehaviorTester />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Resource Rate</CardTitle>
            <CardDescription>Resources gathered per minute by each team.</CardDescription>
          </CardHeader>
          <CardContent>
            <TeamStatsChart data={teamResourceData} />
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Game Event Log</CardTitle>
            <CardDescription>Live feed of significant game events with AI-powered summaries.</CardDescription>
          </CardHeader>
          <CardContent>
            <EventLog />
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Unit Composition</CardTitle>
            <CardDescription>Current unit distribution across both teams.</CardDescription>
          </CardHeader>
          <CardContent>
            <UnitCompositionChart data={unitCompositionData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
