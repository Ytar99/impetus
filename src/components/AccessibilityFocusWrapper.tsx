import { ReactNode } from "react";

interface AccessibilityFocusWrapperProps {
  children: ReactNode;
}

export default function AccessibilityFocusWrapper({
  children,
}: AccessibilityFocusWrapperProps) {
  return <div className="focus-visible:outline-none">{children}</div>;
}
