import * as React from "react";
import { cn } from "@/lib/utils";

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
};

function findTriggerClassName(children: React.ReactNode): string | undefined {
  const nodes = React.Children.toArray(children) as React.ReactElement[];
  for (const node of nodes) {
    if (!React.isValidElement(node)) continue;
    if (node.type === SelectTrigger) {
      return node.props.className;
    }
    if (node.props?.children) {
      const nested = findTriggerClassName(node.props.children);
      if (nested) return nested;
    }
  }
  return undefined;
}

function findItems(children: React.ReactNode) {
  const items: Array<{ value: string; label: React.ReactNode }> = [];
  const nodes = React.Children.toArray(children) as React.ReactElement[];
  for (const node of nodes) {
    if (!React.isValidElement(node)) continue;
    if (node.type === SelectItem) {
      items.push({ value: node.props.value, label: node.props.children });
      continue;
    }
    if (node.props?.children) {
      items.push(...findItems(node.props.children));
    }
  }
  return items;
}

function Select({ value, defaultValue, onValueChange, children }: SelectProps) {
  const triggerClassName = findTriggerClassName(children);
  const items = findItems(children);

  return (
    <select
      className={cn(
        "flex h-10 w-full rounded-lg border bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        triggerClassName
      )}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      {items.map((item) => (
        <option key={item.value} value={item.value}>
          {item.label}
        </option>
      ))}
    </select>
  );
}

function SelectTrigger({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
SelectTrigger.displayName = "SelectTrigger";

function SelectValue({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
SelectValue.displayName = "SelectValue";

function SelectContent({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
SelectContent.displayName = "SelectContent";

function SelectItem({ children }: { children?: React.ReactNode; value: string }) {
  return <>{children}</>;
}
SelectItem.displayName = "SelectItem";

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
