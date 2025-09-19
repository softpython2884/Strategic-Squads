
import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import WaitingRoomContent from '@/components/player/waiting-room-content';

function WaitingRoomLoading() {
    return (
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Card className="mb-8 bg-card/50">
                    <CardHeader>
                        <CardTitle className="text-3xl text-center font-headline">Salle d'attente</CardTitle>
                        <CardDescription className="text-center">Chargement des informations sur la partie...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}

export default function WaitingRoomPage() {
  return (
    <Suspense fallback={<WaitingRoomLoading />}>
      <WaitingRoomContent />
    </Suspense>
  );
}
