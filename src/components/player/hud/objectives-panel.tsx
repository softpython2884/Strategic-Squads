
'use client';

import React from 'react';
import { Check, Target } from 'lucide-react';

const ObjectivesPanel = () => {
    return (
        <div className="absolute top-4 left-4 p-3 bg-black/50 text-white rounded-lg max-w-sm pointer-events-auto">
            <h3 className="font-headline text-lg mb-2">Objectifs</h3>
            <div className="space-y-2 text-sm">
                 <div className="flex items-center gap-2 text-white/80">
                    <Target className="w-4 h-4 text-yellow-400" />
                    <span>Rôle : <span className="font-bold">Assaut</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="line-through text-white/60">Détruire la tour frontale</span>
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-yellow-400 rounded-full animate-pulse"></div>
                    <span>Capturer l'Idole du Sud (50%)</span>
                </div>
            </div>
        </div>
    );
};

export default ObjectivesPanel;
