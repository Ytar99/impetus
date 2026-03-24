import { ReactNode } from "react";

interface VisualWrapperProps {
  children: ReactNode;
}

export default function VisualWrapper({ children }: VisualWrapperProps) {
  return <div className="will-change-auto">{children}</div>;
}
