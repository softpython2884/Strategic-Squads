
import { Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import PlayerDashboardContent from '@/components/player/player-dashboard-content';

function PlayerDashboardLoading() {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <h1 className="mb-4 text-3xl font-bold font-headline">Tableau de Bord de l'Escouade</h1>
            <p className="mb-8 text-lg text-muted-foreground">
                Chargement des informations du Commandant...
            </p>
            <Card>
                <CardHeader>
                    <CardTitle>Gestion de l'Escouade</CardTitle>
                    <CardDescription>
                        Chargement de la configuration de l'escouade...
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[300px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        </main>
    );
}


export default function PlayerDashboardPage() {
  return (
    <Suspense fallback={<PlayerDashboardLoading />}>
      <PlayerDashboardContent />
    </Suspense>
  );
}
