import SpectatorView from "@/components/game-master/spectator-view";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bot } from "lucide-react";
import Link from "next/link";

export default function SpectatorPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b shrink-0 bg-background/90 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary">
              <Bot className="w-6 h-6" />
            </div>
          <h1 className="text-xl font-bold md:text-2xl font-headline text-primary-foreground">
            Strategic Squads
            <span className="hidden ml-3 text-sm font-medium sm:inline-block text-muted-foreground">
              Mode Spectateur
            </span>
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link href="/lobby">
            <ArrowLeft className="mr-2" />
            Retour au Salon
          </Link>
        </Button>
      </header>
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <SpectatorView />
      </main>
    </div>
  );
}
