
import { Bot } from 'lucide-react';
import { MainMenu } from '@/components/game/MainMenu';

export default function LobbyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <header className="sticky top-0 z-20 flex items-center h-16 px-4 border-b border-white/5 shrink-0 bg-background/50 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20 text-primary ring-1 ring-primary/50">
            <Bot className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold md:text-2xl font-headline text-primary-foreground tracking-tight">
            Strategic Squads
            <span className="hidden ml-3 text-sm font-medium sm:inline-block text-muted-foreground font-body">
              Salon
            </span>
          </h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 relative z-10">
        <MainMenu />
      </main>
    </div>
  );
}
