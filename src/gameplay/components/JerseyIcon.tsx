/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface JerseyIconProps {
  primaryColor: string;
  secondaryColor?: string;
  number?: number;
  className?: string;
}

export const JerseyIcon: React.FC<JerseyIconProps> = ({
  primaryColor,
  secondaryColor = '#ffffff',
  number,
  className = 'w-7 h-7 sm:w-8 sm:h-8',
}) => (
  <div className={`relative shrink-0 flex items-center justify-center select-none ${className}`}>
    <svg
      viewBox="0 0 24 24"
      className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]"
      shapeRendering="crispEdges"
    >
      <path d="M7 2h10l5 3v5l-4 1v9H6v-9l-4-1V5l5-3z" fill="#000000" opacity={0.5} />
      <path d="M8 3l-5 2v4l3 1v9h12v-9l3-1V5l-5-2H8z" fill={primaryColor} />
      <path d="M10 3h4l-2 3-2-3z" fill={secondaryColor} />
      <path d="M3 8l3 1v-1l-3-1v1z" fill={secondaryColor} />
      <path d="M21 8l-3 1v-1l3-1v1z" fill={secondaryColor} />
      <path d="M6 18h12v1H6z" fill={secondaryColor} opacity={0.7} />
      <path d="M6 10h1v8H6z" fill="#000000" opacity={0.18} />
      <path d="M17 10h1v8h-1z" fill="#ffffff" opacity={0.2} />
    </svg>
    {number !== undefined && (
      <span className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-black text-white drop-shadow-[0_1px_3px_rgba(0,0,0,1)] pt-0.5">
        {number}
      </span>
    )}
  </div>
);
