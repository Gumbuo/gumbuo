"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  ArmorySaveState,
  StationId,
  EquippedItems,
  ArmoryItem,
} from "./types";
import { STATIONS } from "./data/stations";
import { getItem } from "./data/items";

interface ArmoryMapProps {
  saveState: ArmorySaveState;
  onStationSelect: (stationId: StationId) => void;
  onUpdatePosition: (position: { x: number; currentStation: StationId | null }) => void;
}

// Station positions on the map (straight line layout)
const STATION_POSITIONS: Record<StationId, { x: number; y: number; unlockLevel: number }> = {
  plasmaRefinery: { x: 80, y: 150, unlockLevel: 1 },
  assemblyBay: { x: 220, y: 150, unlockLevel: 1 },
  voidForge: { x: 360, y: 150, unlockLevel: 2 },
  bioLab: { x: 500, y: 150, unlockLevel: 3 },
  quantumChamber: { x: 640, y: 150, unlockLevel: 5 },
};

const STATION_ORDER: StationId[] = [
  'plasmaRefinery',
  'assemblyBay',
  'voidForge',
  'bioLab',
  'quantumChamber'
];

const PLAYER_SPEED = 3;
const STATION_RADIUS = 35;

export default function ArmoryMap({ saveState, onStationSelect, onUpdatePosition }: ArmoryMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [playerX, setPlayerX] = useState(saveState.playerPosition?.x ?? 80);
  const [targetX, setTargetX] = useState<number | null>(null);
  const [targetStation, setTargetStation] = useState<StationId | null>(null);
  const [playerImage, setPlayerImage] = useState<HTMLImageElement | null>(null);
  const [playerImageFlipped, setPlayerImageFlipped] = useState<HTMLImageElement | null>(null);
  const [facingRight, setFacingRight] = useState(true);
  const animationRef = useRef<number | null>(null);

  // Load player sprite
  useEffect(() => {
    const img = new Image();
    img.src = "/images/armory/player/east.png";
    img.onload = () => setPlayerImage(img);

    const imgFlipped = new Image();
    imgFlipped.src = "/images/armory/player/west.png";
    imgFlipped.onload = () => setPlayerImageFlipped(imgFlipped);
  }, []);

  // Get equipped item info
  const equippedWeapon = saveState.equipped?.weapon ? getItem(saveState.equipped.weapon) : null;
  const equippedArmor = saveState.equipped?.armor ? getItem(saveState.equipped.armor) : null;

  // Calculate total stats
  const totalAttack = (equippedWeapon?.stats.attack || 0);
  const totalDefense = (equippedArmor?.stats.defense || 0);

  // Handle click on canvas to move player
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked on a station
    for (const stationId of STATION_ORDER) {
      const pos = STATION_POSITIONS[stationId];
      const station = STATIONS[stationId];
      const stationLevel = saveState.stationLevels[stationId];

      // Check if station is unlocked
      if (station && (stationLevel > 0 || saveState.progress.level >= station.unlockLevel)) {
        const dx = clickX - pos.x;
        const dy = clickY - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= STATION_RADIUS) {
          // Clicked on this station - move there
          setTargetX(pos.x);
          setTargetStation(stationId);
          setFacingRight(pos.x > playerX);
          return;
        }
      }
    }

    // Clicked empty space - just move horizontally
    setTargetX(Math.max(50, Math.min(670, clickX)));
    setTargetStation(null);
    setFacingRight(clickX > playerX);
  }, [playerX, saveState.stationLevels, saveState.progress.level]);

  // Animation loop for player movement
  useEffect(() => {
    if (targetX === null) return;

    const animate = () => {
      setPlayerX((currentX) => {
        const diff = targetX - currentX;

        if (Math.abs(diff) < PLAYER_SPEED) {
          // Arrived at destination
          setTargetX(null);

          // If we arrived at a station, select it
          if (targetStation) {
            onStationSelect(targetStation);
            onUpdatePosition({ x: targetX, currentStation: targetStation });
          } else {
            onUpdatePosition({ x: targetX, currentStation: null });
          }

          return targetX;
        }

        return currentX + (diff > 0 ? PLAYER_SPEED : -PLAYER_SPEED);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetX, targetStation, onStationSelect, onUpdatePosition]);

  // Draw the map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw floor/path line
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 40;
    ctx.beginPath();
    ctx.moveTo(30, 150);
    ctx.lineTo(690, 150);
    ctx.stroke();

    // Draw path decorations
    ctx.strokeStyle = "#66fcf1";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 10]);
    ctx.beginPath();
    ctx.moveTo(30, 150);
    ctx.lineTo(690, 150);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw stations
    for (const stationId of STATION_ORDER) {
      const pos = STATION_POSITIONS[stationId];
      const station = STATIONS[stationId];
      const stationLevel = saveState.stationLevels[stationId];
      const isUnlocked = stationLevel > 0 || (station && saveState.progress.level >= station.unlockLevel);
      const hasActiveJobs = saveState.craftingQueues[stationId]?.length > 0;

      // Station circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, STATION_RADIUS, 0, Math.PI * 2);

      if (!isUnlocked) {
        ctx.fillStyle = "#1a1a2e";
        ctx.strokeStyle = "#333";
      } else if (hasActiveJobs) {
        ctx.fillStyle = "#1a3a2e";
        ctx.strokeStyle = "#66fcf1";
      } else {
        ctx.fillStyle = "#1a2a3e";
        ctx.strokeStyle = "#45a29e";
      }

      ctx.fill();
      ctx.lineWidth = 3;
      ctx.stroke();

      // Station icon (emoji)
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (!isUnlocked) {
        ctx.fillStyle = "#555";
        ctx.fillText("🔒", pos.x, pos.y);
      } else {
        ctx.fillText(station?.icon || "⚙️", pos.x, pos.y);
      }

      // Station name below
      ctx.font = "10px Orbitron, monospace";
      ctx.fillStyle = isUnlocked ? "#66fcf1" : "#555";
      ctx.fillText(station?.name || stationId, pos.x, pos.y + 50);

      // Level indicator
      if (isUnlocked && stationLevel > 0) {
        ctx.font = "8px Orbitron, monospace";
        ctx.fillStyle = "#45a29e";
        ctx.fillText(`Lv.${stationLevel}`, pos.x, pos.y + 62);
      }

      // Active jobs indicator
      if (hasActiveJobs) {
        ctx.font = "12px Arial";
        ctx.fillStyle = "#66fcf1";
        ctx.fillText(`⏳${saveState.craftingQueues[stationId].length}`, pos.x + 30, pos.y - 25);
      }
    }

    // Draw player
    const playerY = 150;
    const playerImg = facingRight ? playerImage : playerImageFlipped;

    if (playerImg) {
      // Draw player sprite (scaled up from 48x48 to 64x64)
      const size = 64;
      ctx.drawImage(playerImg, playerX - size/2, playerY - size/2 - 10, size, size);
    } else {
      // Fallback circle if image not loaded
      ctx.beginPath();
      ctx.arc(playerX, playerY - 20, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#00ff99";
      ctx.fill();
      ctx.strokeStyle = "#66fcf1";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw equipped items on player
    if (equippedWeapon) {
      ctx.font = "16px Arial";
      ctx.fillText(equippedWeapon.icon, playerX + 20, playerY - 30);
    }
    if (equippedArmor) {
      ctx.font = "12px Arial";
      ctx.fillText(equippedArmor.icon, playerX - 25, playerY - 35);
    }

    // Draw stats display
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(10, 10, 120, 50);
    ctx.strokeStyle = "#66fcf1";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, 120, 50);

    ctx.font = "10px Orbitron, monospace";
    ctx.textAlign = "left";
    ctx.fillStyle = "#ff6b6b";
    ctx.fillText(`ATK: ${totalAttack}`, 20, 30);
    ctx.fillStyle = "#4ecdc4";
    ctx.fillText(`DEF: ${totalDefense}`, 20, 50);

    // Instructions
    ctx.font = "10px Orbitron, monospace";
    ctx.textAlign = "center";
    ctx.fillStyle = "#555";
    ctx.fillText("Click a station to move there", 360, 230);

  }, [playerX, playerImage, playerImageFlipped, facingRight, saveState, equippedWeapon, equippedArmor, totalAttack, totalDefense]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={720}
        height={250}
        onClick={handleCanvasClick}
        className="border border-cyan-800 rounded-lg cursor-pointer"
        style={{ imageRendering: "pixelated" }}
      />

      {/* Equipment display below map */}
      <div className="mt-3 flex justify-center gap-4">
        <div className="bg-gray-900/80 border border-cyan-800 rounded px-3 py-2 text-xs">
          <span className="text-gray-400">Weapon: </span>
          {equippedWeapon ? (
            <span className="text-cyan-400">{equippedWeapon.icon} {equippedWeapon.name}</span>
          ) : (
            <span className="text-gray-600">None</span>
          )}
        </div>
        <div className="bg-gray-900/80 border border-cyan-800 rounded px-3 py-2 text-xs">
          <span className="text-gray-400">Armor: </span>
          {equippedArmor ? (
            <span className="text-cyan-400">{equippedArmor.icon} {equippedArmor.name}</span>
          ) : (
            <span className="text-gray-600">None</span>
          )}
        </div>
      </div>
    </div>
  );
}
