
'use client'

import React from 'react';

export default function PlayerGameLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: Removed useSearchParams to fix build error.
  // The player's specific info will be shown within the game UI itself, not the layout.
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
