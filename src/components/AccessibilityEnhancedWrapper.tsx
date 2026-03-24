import { ReactNode } from "react";

interface AccessibilityEnhancedWrapperProps {
  children: ReactNode;
}

export default function AccessibilityEnhancedWrapper({
  children,
}: AccessibilityEnhancedWrapperProps) {
  return <div className="sr-only">{children}</div>;
}
