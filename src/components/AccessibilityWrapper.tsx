import { ReactNode } from "react";

interface AccessibilityWrapperProps {
  children: ReactNode;
}

export default function AccessibilityWrapper({
  children,
}: AccessibilityWrapperProps) {
  return (
    <div
      className="focus:outline-none"
      role="application"
      aria-label="Habit tracking application"
    >
      {children}
    </div>
  );
}
