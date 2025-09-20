
'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match the map world size
    canvas.width = mapDimensions.width;
    canvas.height = mapDimensions.height;

    // 1. Fill the entire canvas with solid black (the fog)
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. "Cut out" the visible areas
    ctx.globalCompositeOperation = 'destination-out';

    const radiusInPixels = (visionRadius / 100) * mapDimensions.width;

    visionSources.forEach(source => {
      const x = (source.x / 100) * canvas.width;
      const y = (source.y / 100) * canvas.height;
      
      // Create a radial gradient for a soft edge
      const gradient = ctx.createRadialGradient(x, y, radiusInPixels * 0.7, x, y, radiusInPixels);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radiusInPixels, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Reset composite operation for next render
    ctx.globalCompositeOperation = 'source-over';

  }, [visionSources, visionRadius, mapDimensions]);

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{
        width: mapDimensions.width,
        height: mapDimensions.height,
        originX: 0,
        originY: 0,
      }}
      animate={{
        scale: zoom,
        x: -cameraPosition.x * zoom + (containerRef.current?.parentElement?.clientWidth ?? 0) / 2,
        y: -cameraPosition.y * zoom + (containerRef.current?.parentElement?.clientHeight ?? 0) / 2,
      }}
      transition={{ duration: 0.2, ease: "linear" }}
    >
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-80"
        />
    </motion.div>
  );
};

export default FogOfWar;
