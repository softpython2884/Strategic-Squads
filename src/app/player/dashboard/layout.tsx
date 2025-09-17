
'use client'

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { gameState } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowLeft, Bot, Shield, User } from 'lucide-react';


export default function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const pseudo = searchParams.get('pseudo');
  const teamId = searchParams.get('teamId');
  const squadType = searchParams.get('squadType');

  const teams = gameState.getTeams();
  const team = teamId ? teams[teamId as keyof typeof teams] : undefined;
  
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
              Tableau de Bord
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-4">
            {pseudo && team && squadType && (
                 <div className={cn("flex items-center gap-4 rounded-md p-2 text-sm", team.bgClass, team.textClass)}>
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className='font-bold'>{pseudo}</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <Shield className="w-4 h-4" />
                        <span className='font-bold capitalize'>{squadType}</span>
                    </div>
                 </div>
            )}
             <Button asChild variant="outline">
              <Link href="/team-selection">
                <ArrowLeft className="mr-2" />
                Changer d'escouade
              </Link>
            </Button>
        </div>
      </header>
      {children}
    </div>
  );
}
