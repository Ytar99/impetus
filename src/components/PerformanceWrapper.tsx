import { ReactNode } from "react";

interface PerformanceWrapperProps {
  children: ReactNode;
}

export default function PerformanceWrapper({
  children,
}: PerformanceWrapperProps) {
  return <div className="will-change-auto">{children}</div>;
}
