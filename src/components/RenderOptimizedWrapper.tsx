import { ReactNode } from "react";

interface RenderOptimizedWrapperProps {
  children: ReactNode;
}

export default function RenderOptimizedWrapper({
  children,
}: RenderOptimizedWrapperProps) {
  return <div className="will-change-transform">{children}</div>;
}
