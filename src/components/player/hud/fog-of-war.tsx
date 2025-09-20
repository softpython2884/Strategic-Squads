
'use client';

import React, { useRef, useEffect } from 'react';

type FogOfWarProps = {
  visionSources: { x: number; y: number }[]; // Positions in percentages
  visionRadius: number; // Radius in percentage of map dimension
  mapDimensions: { width: number; height: number };
  zoom: number;
  cameraPosition: { x: number; y: number };
};

const FogOfWar = ({ visionSources, visionRadius, mapDimensions, zoom, cameraPosition }: FogOfWarProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match the container (the entire screen)
    const { clientWidth, clientHeight } = container;
    canvas.width = clientWidth;
    canvas.height = clientHeight;

    // 1. Fill the entire canvas with solid black (the fog)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. "Cut out" the visible areas
    ctx.globalCompositeOperation = 'destination-out';

    // This radius needs to be based on a consistent world dimension, like map width
    const radiusInPixels = (visionRadius / 100) * mapDimensions.width * zoom;

    visionSources.forEach(source => {
      // Convert world position (percentage) to screen position (pixels)
      const worldX = (source.x / 100) * mapDimensions.width;
      const worldY = (source.y / 100) * mapDimensions.height;
      
      // Calculate screen position based on camera
      const screenX = (worldX - cameraPosition.x) * zoom + clientWidth / 2;
      const screenY = (worldY - cameraPosition.y) * zoom + clientHeight / 2;
      
      // Create a radial gradient for a soft edge
      const gradient = ctx.createRadialGradient(screenX, screenY, radiusInPixels * 0.7, screenX, screenY, radiusInPixels);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radiusInPixels, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Reset composite operation for next render
    ctx.globalCompositeOperation = 'source-over';

  }, [visionSources, visionRadius, mapDimensions, zoom, cameraPosition]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-screen h-screen pointer-events-none"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default FogOfWar;
