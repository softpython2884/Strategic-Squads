
'use-client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Unit, Team, Ping } from '@/lib/types';
import { cn } from '@/lib/utils';
import { TowerControl, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PingDisplay from './ping-display';
import { objectives } from '@/lib/objectives';


type StrategicMapOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  units: Unit[];
  teams: { [key: string]: Team };
  pings: Ping[];
  onPing: (coords: { x: number; y: number }) => void;
};


const StrategicMapOverlay = ({ isOpen, onClose, units, teams, pings, onPing }: StrategicMapOverlayProps) => {
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.altKey) {
      const mapRect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - mapRect.left;
      const clickY = event.clientY - mapRect.top;

      const targetX = (clickX / mapRect.width) * 100;
      const targetY = (clickY / mapRect.height) * 100;

      onPing({ x: targetX, y: targetY });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <div
            className="relative w-[90vw] h-[90vh] max-w-[1200px] max-h-[1200px] aspect-square bg-gray-900/80 border-2 border-primary/50 rounded-lg shadow-2xl p-4"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the map
          >
            <div className="absolute top-2 right-2">
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10">
                    <X />
                </Button>
            </div>
            
            <h2 className="absolute text-2xl font-bold text-center text-white top-4 left-1/2 -translate-x-1/2 font-headline">
              Carte Stratégique <span className="text-sm font-light text-muted-foreground">(appuyez sur Échap pour fermer)</span>
            </h2>

            <div
              className="relative w-full h-full overflow-hidden"
              onClick={handleMapClick}
            >
              {/* Map rendering logic */}
              <div className="absolute inset-0 bg-gray-800/30">
                {/* Display objectives */}
                {objectives.map(obj => (
                    <div
                        key={obj.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${obj.position.x}%`, top: `${obj.position.y}%` }}
                    >
                        <TowerControl className={cn(
                            "w-8 h-8",
                            obj.teamId === 'blue' ? 'text-blue-500' : 'text-red-500'
                        )} />
                    </div>
                ))}
              </div>

              {/* Display units */}
              {units.map(unit => (
                <div
                  key={unit.id}
                  className="absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-2"
                  style={{
                    left: `${unit.position.x}%`,
                    top: `${unit.position.y}%`,
                    backgroundColor: teams[unit.teamId]?.color,
                    borderColor: '#000',
                  }}
                />
              ))}

              {/* Display pings */}
              <AnimatePresence>
                {pings.map((ping) => (
                    <div 
                        key={ping.id} 
                        className="absolute"
                        style={{
                            left: `${ping.x}%`,
                            top: `${ping.y}%`,
                        }}
                    >
                        <PingDisplay />
                    </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StrategicMapOverlay;
