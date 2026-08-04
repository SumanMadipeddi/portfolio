import { Dithering, type DitheringProps } from "@paper-design/shaders-react";
import { cn } from "@/lib/utils";

export type DitheringShaderProps = DitheringProps & {
  className?: string;
};

export function DitheringShader({
  className,
  shape = "sphere",
  type = "4x4",
  colorBack = "#000000",
  colorFront = "#2997ff",
  size,
  pxSize = 1.25,
  speed = 1.5,
  fit = "cover",
  scale = 1.05,
  offsetY = 0,
  style,
  ...props
}: DitheringShaderProps) {
  return (
    <Dithering
      className={cn("h-full w-full", className)}
      shape={shape}
      type={type}
      colorBack={colorBack}
      colorFront={colorFront}
      size={size ?? pxSize}
      speed={speed}
      fit={fit}
      scale={scale}
      offsetY={offsetY}
      style={{ width: "100%", height: "100%", ...style }}
      {...props}
    />
  );
}
