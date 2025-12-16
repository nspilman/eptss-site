import { HelpCircle } from "lucide-react";
import { Tooltip } from "@eptss/ui";

export function LabelWithTooltip({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1">
      <label className="block text-sm font-medium">{label}</label>
      <Tooltip content={<div className="max-w-xs">{tooltip}</div>} side="right">
        <HelpCircle className="h-3.5 w-3.5 text-secondary hover:text-primary cursor-help transition-colors" />
      </Tooltip>
    </div>
  );
}
