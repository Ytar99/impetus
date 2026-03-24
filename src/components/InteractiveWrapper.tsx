import { ReactNode } from "react";

interface InteractiveWrapperProps {
  children: ReactNode;
}

export default function InteractiveWrapper({
  children,
}: InteractiveWrapperProps) {
  return <div className="cursor-default">{children}</div>;
}
