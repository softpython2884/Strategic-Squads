
'use client';

import React, { useEffect, useRef } from 'react';
import { MAP_DATA, MAP_WIDTH_IN_TILES, MAP_HEIGHT_IN_TILES, TILE_SIZE } from '@/lib/map-data';

// Define colors for different tile types
const tileColors: { [key: number]: string } = {
  366: '#555555', // Wall
  360: '#2a9d8f', // Bush
  332: '#0077b6', // Blue Spawn
  334: '#d00000', // Red Spawn
  347: '#4895ef', // Blue Tower
  348: '#4895ef', // Blue Tower
  351: '#f00', // Red Tower
  352: '#f00', // Red Tower
  349: '#ade8f4', // Blue Idol
  350: '#ff7900', // Neutral Idol
  353: '#ff4d6d', // Red Idol
};

const SimpleMapRenderer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = MAP_WIDTH_IN_TILES * TILE_SIZE;
    canvas.height = MAP_HEIGHT_IN_TILES * TILE_SIZE;

    // Base background color
    ctx.fillStyle = '#333338'; // Grayish background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the map from data
    for (let y = 0; y < MAP_HEIGHT_IN_TILES; y++) {
      for (let x = 0; x < MAP_WIDTH_IN_TILES; x++) {
        const tileIndex = y * MAP_WIDTH_IN_TILES + x;
        const tileId = MAP_DATA[tileIndex];

        if (tileId !== 0 && tileColors[tileId]) {
          ctx.fillStyle = tileColors[tileId];
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0"
    />
  );
};

