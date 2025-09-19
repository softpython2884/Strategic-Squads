
'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowLeft, Bot, Shield, User } from 'lucide-react';


export default function PlayerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: Removed useSearchParams to fix build error.
  // This layout is now static and doesn't display dynamic player info.
  
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
