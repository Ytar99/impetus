import { ReactNode } from "react";

interface ExperienceWrapperProps {
  children: ReactNode;
}

export default function ExperienceWrapper({
  children,
}: ExperienceWrapperProps) {
  return (
    <div className="transition-all duration-300 ease-in-out">{children}</div>
  );
}
