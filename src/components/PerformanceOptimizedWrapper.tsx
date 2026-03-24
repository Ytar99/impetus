import { ReactNode } from "react";

interface PerformanceOptimizedWrapperProps {
  children: ReactNode;
}

export default function PerformanceOptimizedWrapper({
  children,
}: PerformanceOptimizedWrapperProps) {
  return <div className="transform-gpu">{children}</div>;
}
