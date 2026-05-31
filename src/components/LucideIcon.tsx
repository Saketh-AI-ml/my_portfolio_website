import React, { createElement } from "react";
import * as LucideRange from "lucide-react";

interface LucideIconProps extends Omit<React.ComponentProps<"svg">, "ref"> {
  name: string;
  className?: string;
  size?: number;
}

export function LucideIcon({ name, className, size = 18, ...props }: LucideIconProps) {
  // Safe lookup with robust fallback to a generic placeholder icon (Code2 or Shield)
  const IconComponent = (LucideRange as any)[name] || LucideRange.Code2;
  
  return createElement(IconComponent, {
    className,
    size,
    ...props
  });
}
