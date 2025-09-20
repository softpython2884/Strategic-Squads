
'use client'

import React, { useRef, useEffect, useState } from 'react';

// Define types based on Tiled JSON format
interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: TiledLayer[];
  tilesets: TiledTileset[];
}

interface TiledLayer {
  data: number[];
  width: number;
  height: number;
  name: string;
  type: 'tilelayer';
  visible: boolean;
}

interface TiledTileset {
  firstgid: number;
  image: string;
  imagewidth: number;
  imageheight: number;
  tilewidth: number;
  tileheight: number;
  tilecount: number;
  columns: number;
  name: string;
  tiles?: { id: number; animation?: { duration: number; tileid: number; }[] }[];
}

const TiledMapRenderer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapData, setMapData] = useState<TiledMap | null>(null);
  const [tilesetImages, setTilesetImages] = useState<{ [key: string]: HTMLImageElement }>({});
  const animationFrameId = useRef<number>();
  const lastFrameTime = useRef<number>(0);
  const animatedTiles = useRef<any[]>([]);

  // Load map data and tilesets
  useEffect(() => {
    fetch('/map.json')
      .then(res => res.json())
      .then((data: TiledMap) => {
        setMapData(data);
        const imagePromises = data.tilesets.map(tileset => {
          return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.src = `/${tileset.image}`; // Assumes tileset images are in public folder
            img.onload = () => {
              setTilesetImages(prev => ({ ...prev, [tileset.name]: img }));
              resolve(img);
            };
            img.onerror = reject;
          });
        });
        
        Promise.all(imagePromises).then(() => {
            // Prepare animated tiles data
            const animTiles = [];
            for (const tileset of data.tilesets) {
                if (tileset.tiles) {
                    for (const tile of tileset.tiles) {
                        if (tile.animation) {
                            animTiles.push({
                                tileset,
                                tileId: tile.id,
                                animation: tile.animation,
                                currentFrame: 0,
                                lastFrameChange: 0,
                            });
                        }
                    }
                }
            }
            animatedTiles.current = animTiles;
        });
      });
  }, []);

  const draw = (time: number) => {
    if (!canvasRef.current || !mapData || Object.keys(tilesetImages).length === 0) {
        return;
    }
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update animations
    const delta = time - lastFrameTime.current;
    for (const animTile of animatedTiles.current) {
        animTile.lastFrameChange += delta;
        if (animTile.lastFrameChange >= animTile.animation[animTile.currentFrame].duration) {
            animTile.lastFrameChange = 0;
            animTile.currentFrame = (animTile.currentFrame + 1) % animTile.animation.length;
        }
    }
    lastFrameTime.current = time;

    // Draw map layers
    for (const layer of mapData.layers) {
      if (layer.type !== 'tilelayer' || !layer.visible) continue;
      for (let y = 0; y < layer.height; y++) {
        for (let x = 0; x < layer.width; x++) {
          const tileIndex = y * layer.width + x;
          const tileGid = layer.data[tileIndex];

          if (tileGid === 0) continue;

          // Find the correct tileset for this tile GID
          const tileset = mapData.tilesets.find(ts => tileGid >= ts.firstgid && tileGid < ts.firstgid + ts.tilecount);
          if (!tileset) continue;

          const localTileId = tileGid - tileset.firstgid;
          let animatedFrameId = localTileId;

          // Check if this tile is animated
          const animInfo = animatedTiles.current.find(at => at.tileset.name === tileset.name && at.tileId === localTileId);
          if (animInfo) {
              animatedFrameId = animInfo.animation[animInfo.currentFrame].tileid;
          }

          const tilesetImage = tilesetImages[tileset.name];
          if (!tilesetImage) continue;

          const sx = (animatedFrameId % tileset.columns) * tileset.tilewidth;
          const sy = Math.floor(animatedFrameId / tileset.columns) * tileset.tileheight;

          ctx.drawImage(
            tilesetImage,
            sx,
            sy,
            tileset.tilewidth,
            tileset.tileheight,
            x * mapData.tilewidth,
            y * mapData.tileheight,
            mapData.tilewidth,
            mapData.tileheight
          );
        }
      }
    }
    
    animationFrameId.current = requestAnimationFrame(draw);
  }

  // Effect to handle drawing
  useEffect(() => {
    if (mapData && Object.keys(tilesetImages).length > 0) {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = mapData.width * mapData.tilewidth;
            canvas.height = mapData.height * mapData.tileheight;
        }
      animationFrameId.current = requestAnimationFrame(draw);
    }
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [mapData, tilesetImages]);

  return <canvas ref={canvasRef} className="absolute inset-0 object-cover w-full h-full pointer-events-none" />;
};

export default TiledMapRenderer;
