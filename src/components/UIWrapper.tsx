import { ReactNode } from "react";

interface UIWrapperProps {
  children: ReactNode;
}

export default function UIWrapper({ children }: UIWrapperProps) {
  return <div className="antialiased">{children}</div>;
}
