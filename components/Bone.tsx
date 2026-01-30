
import React, { useMemo } from 'react';
import { Vector2D, PartName } from '../types';
// ANATOMY is no longer directly imported here; dimensions come from props.
// No longer need adjustBrightness

// Exported for use in Mannequin.tsx cloneElement
export interface BoneProps { 
  rotation: number;
  length: number; // Final scaled length
  width?: number; // Final scaled width
  variant?: 'diamond' | 'waist-teardrop-pointy-up' | 'torso-teardrop-pointy-down' | 'collar-horizontal-oval-shape' | 'deltoid-shape' | 'limb-tapered' | 'head-tall-oval' | 'hand-foot-arrowhead-shape';
  showPivots: boolean;
  visible?: boolean;
  offset?: Vector2D;
  children?: React.ReactNode;
  drawsUpwards?: boolean;
  colorClass?: string;
  showLabel?: boolean;
  label?: string;
}

export const COLORS = {
  ANCHOR_RED: "#F87171", // Anchor dots explicitly red
  SELECTION: "#D1D5DB", // Light monochrome shade
  RIDGE: "#333333", // For wireframe stroke - kept dark
  PIN_HIGHLIGHT: "#D1D5DB", // Light monochrome for active pin
  DEFAULT_FILL: "#000000", // Fallback / solid black for silhouette
};

// COLORS_BY_CATEGORY is no longer used for dynamic fill, as colorClass is passed directly.
export const COLORS_BY_CATEGORY: { [category: string]: string } = { 
  head: "#5A5A5A",
  hand: "#5A5A5A",
  foot: "#5A5A5A",
  
  bicep: "#3A3A3A",
  forearm: "#3A3A3A",
  collar: "#3A3A3A",
  torso: "#3A3A3A",
  waist: "#3A3A3A",
  thigh: "#3A3A3A",
  shin: "#3A3A3A",

  default: COLORS.DEFAULT_FILL,
};

export const Bone: React.FC<BoneProps> = ({
  rotation,
  length, // This is now the final scaled kinematic length
  width = 15, // This is now the final scaled kinematic width
  variant = 'diamond',
  showPivots = true,
  visible = true,
  offset = { x: 0, y: 0 },
  children,
  drawsUpwards = false,
  colorClass = "fill-mono-dark",
  showLabel = false,
  label,
}) => {
  const getBonePath = (boneLength: number, boneWidth: number, variant: string, drawsUpwards: boolean): string => {
    const effectiveLength = drawsUpwards ? -boneLength : boneLength;
    const halfWidth = boneWidth / 2;

    switch (variant) {
      case 'head-tall-oval':
        const hH = boneLength * 0.75;    
        const bW = boneWidth * 0.3; 
        const tW = boneWidth * 0.6; 
        return `M ${-bW / 2},0 L ${bW / 2},0 C ${bW / 2 + 10},0 ${tW / 2},${-hH * 0.4} ${tW / 2},${-hH} L ${-tW / 2},${-hH} C ${-tW / 2},${-hH * 0.4} ${-bW / 2 - 10},0 ${-bW / 2},0 Z`;

      case 'collar-horizontal-oval-shape':
        const collarVisHeight = boneLength;
        const collarBaseWidth = boneWidth;
        const collarTopWidth = collarBaseWidth * 0.5; 
        return `M ${collarBaseWidth / 2},0 C ${collarBaseWidth * 0.3},${-collarVisHeight * 0.3} ${collarTopWidth * 0.7},${-collarVisHeight * 0.6} ${collarTopWidth / 2},${-collarVisHeight} L ${-collarTopWidth / 2},${-collarVisHeight} C ${-collarTopWidth * 0.7},${-collarVisHeight * 0.6} ${-collarBaseWidth * 0.3},${-collarVisHeight * 0.3} ${-collarBaseWidth / 2},0 Z`;

      case 'waist-teardrop-pointy-up':
        const wHeight = boneLength;
        const wWidth = boneWidth;
        return `M ${wWidth / 2},0 L ${wWidth * 0.15},${-wHeight} L ${-wWidth * 0.15},${-wHeight} L ${-wWidth / 2},0 Z`;

      case 'torso-teardrop-pointy-down':
        const tHeight = boneLength;
        const tWidth = boneWidth;
        return `M ${tWidth * 0.3},0 C ${tWidth * 0.3},${-tHeight * 0.3} ${tWidth / 2},${-tHeight * 0.7} ${tWidth / 2},${-tHeight} L ${-tWidth / 2},${-tHeight} C ${-tWidth / 2},${-tHeight * 0.7} ${-tWidth * 0.3},${-tHeight * 0.3} ${-tWidth * 0.3},0 Z`;

      case 'deltoid-shape':
        const dHeight = boneLength;
        const shoulderWidth = boneWidth; 
        return `M ${shoulderWidth / 2} 0
                C ${shoulderWidth / 2} ${dHeight * 0.2} ${shoulderWidth * 1.2 / 2} ${dHeight * 0.4} ${shoulderWidth * 1.2 / 2} ${dHeight * 0.7}
                L 0 ${dHeight}
                L ${-shoulderWidth * 1.2 / 2} ${dHeight * 0.7}
                C ${-shoulderWidth * 1.2 / 2} ${dHeight * 0.4} ${-shoulderWidth / 2} ${dHeight * 0.2} ${-shoulderWidth / 2} 0 Z`;

      case 'limb-tapered':
        const taperedWidth = boneWidth;
        const taperedEndWidth = taperedWidth * 0.65;
        return `M ${taperedWidth / 2},0 L ${taperedEndWidth / 2},${effectiveLength} L ${-taperedEndWidth / 2},${effectiveLength} L ${-taperedWidth / 2},0 Z`;

      case 'hand-foot-arrowhead-shape':
        const handFootWidth = boneWidth;
        const hBaseWidth = handFootWidth * 0.4; 
        const hMaxWidth = handFootWidth;
        const flareY = effectiveLength * 0.2; 
        return `M ${-hBaseWidth / 2},0 L ${hBaseWidth / 2},0 L ${hMaxWidth / 2},${flareY} L 0,${effectiveLength} L ${-hMaxWidth / 2},${flareY} Z`;

      default:
        const defaultWidth = boneWidth;
        const split = effectiveLength * 0.4;
        return `M 0 0 L ${defaultWidth / 2} ${split} L 0 ${effectiveLength} L ${-defaultWidth / 2} ${split} Z`;
    }
  };

  const visualEndPoint = drawsUpwards ? -length : length;
  const transform = (offset.x !== 0 || offset.y !== 0)
    ? `translate(${offset.x}, ${offset.y}) rotate(${rotation})`
    : `rotate(${rotation})`;

  return (
    <g transform={transform} className={colorClass}> {/* Apply fill class directly to the group */}
      {visible && (
        <React.Fragment>
          <path
            d={getBonePath(length, width, variant, drawsUpwards)}
            fill="currentColor" // Use currentColor from the group's class
            stroke={COLORS.RIDGE} // Fixed stroke for all bones
            strokeWidth={0.5}
            paintOrder="stroke"
          />
          {/* Overlay line for axis */}
          {showPivots && (
            <line x1="0" y1="0" x2="0" y2={visualEndPoint} stroke="rgba(150, 150, 150, 0.15)" strokeWidth="1" opacity={0.5} strokeLinecap="round" />
          )}
           {showLabel && label && (
            <text x={width / 2 + 5} y={visualEndPoint / 2} 
                  className="fill-mono-mid text-[7px] font-mono select-none opacity-40 tracking-tighter uppercase pointer-events-none">
              {label}
            </text>
          )}
        </React.Fragment>
      )}

      <g transform={`translate(0, ${visualEndPoint})`}>{children}</g>

      {/* Anchor (red dot) at the start of the bone, always visible if showPivots */}
      {showPivots && visible && (
        <circle 
          cx="0" cy="0" r={5} 
          fill={COLORS.ANCHOR_RED} 
          className="pointer-events-none drop-shadow-md" 
          data-no-export={true} 
        />
      )}
    </g>
  );
};
