"use client";

import { Rectangle } from "recharts";

interface CustomCursorProps {
  fill: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  [key: string]: any;
}

export function CustomCursor({ fill, x, y, width, height, ...props }: CustomCursorProps) {
  return (
    <>
      <Rectangle
        x={x ? x - 12 : 0}
        y={y || 0}
        fill={fill}
        fillOpacity={0.1}
        width={24}
        height={height || 0}
        {...props}
      />
      <Rectangle
        x={x ? x - 1 : 0}
        y={y || 0}
        fill={fill || "white"}
        fillOpacity={0.2}
        width={1}
        height={height || 0}
        {...props}
      />
    </>
  );
}