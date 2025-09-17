import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Map, MonitorPlay, SlidersHorizontal } from "lucide-react";
import StrategicMapView from "./strategic-map-view";
import SpectatorView from "./spectator-view";
import TechnicalDashboard from "./technical-dashboard";

export default function GameMasterDashboard() {
  return (
    <Tabs defaultValue="map" className="w-full">
      <TabsList className="grid w-full grid-cols-1 h-auto mb-6 sm:w-fit sm:grid-cols-3">
        <TabsTrigger value="map" className="gap-2">
          <Map className="w-4 h-4" />
          Strategic Map
        </TabsTrigger>
        <TabsTrigger value="spectator" className="gap-2">
          <MonitorPlay className="w-4 h-4" />
          Spectator
        </TabsTrigger>
        <TabsTrigger value="dashboard" className="gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Dashboard
        </TabsTrigger>
      </TabsList>
      <TabsContent value="map">
        <StrategicMapView />
      </TabsContent>
      <TabsContent value="spectator">
        <SpectatorView />
      </TabsContent>
      <TabsContent value="dashboard">
        <TechnicalDashboard />
      </TabsContent>
    </Tabs>
  );
}
