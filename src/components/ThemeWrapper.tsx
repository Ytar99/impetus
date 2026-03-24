import { ReactNode } from "react";

interface ThemeWrapperProps {
  children: ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  return <div className="font-sans antialiased">{children}</div>;
}
