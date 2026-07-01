import type { ReactNode } from "react";
import { SectionHeader } from "./SectionHeader";
import type { FeatureName } from "../types/domain";

// Presentation-only wrapper for one feature section (header + content). Shared
// so every mode's page lays out its three sections identically; only the
// `children` (the mode-specific data component) differ.
export function FeatureSection({
  feature,
  title,
  icon,
  children,
}: {
  feature: FeatureName;
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <section>
      <SectionHeader feature={feature} title={title} icon={icon} />
      {children}
    </section>
  );
}
