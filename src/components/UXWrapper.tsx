import { ReactNode } from "react";

interface UXWrapperProps {
  children: ReactNode;
}

export default function UXWrapper({ children }: UXWrapperProps) {
  return <div className="focus:outline-none">{children}</div>;
}
