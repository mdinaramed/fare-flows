import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { ExpenseItem } from "@/lib/train-data";

const GROUP_CONFIG: Record<string, { icon: string; color: string }> = {
  "МЖС": { icon: "🏛️", color: "border-chart-1/30 bg-chart-1/5" },
  "Станционные": { icon: "🚉", color: "border-chart-2/30 bg-chart-2/5" },
  "Подвижной состав": { icon: "🚃", color: "border-chart-3/30 bg-chart-3/5" },
  "ФОТ": { icon: "👷", color: "border-chart-4/30 bg-chart-4/5" },
  "Расходники": { icon: "📦", color: "border-chart-5/30 bg-chart-5/5" },
};

interface ExpenseTrackerProps {
  expenses: ExpenseItem[];
  onExpenseChange: (id: string, field: keyof ExpenseItem, value: unknown) => void;
  disabled?: boolean;
}

export function ExpenseTracker({ expenses, onExpenseChange, disabled }: ExpenseTrackerProps) {
  const groups = [...new Set(expenses.map((e) => e.group))];

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const items = expenses.filter((e) => e.group === group);
        const groupTotal = items.reduce((sum, e) => sum + (e.enabled ? e.tariff * e.quantity : 0), 0);
        const config = GROUP_CONFIG[group] || { icon: "📋", color: "border-border bg-card" };

        return (
          <Card key={group} className={`border-2 ${config.color}`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-base">
                  <span>{config.icon}</span>
                  {group}
                </span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {groupTotal.toLocaleString("ru-RU")} ₸
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map((exp) => (
                <div
                  key={exp.id}
                  className={`rounded-lg border p-3 transition-all ${
                    exp.enabled ? "bg-card/80 border-border" : "bg-muted/20 border-transparent opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={exp.enabled}
                      onCheckedChange={(v) => onExpenseChange(exp.id, "enabled", !!v)}
                      disabled={disabled}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{exp.label}</span>
                      {exp.auto && (
                        <span className="text-[10px] text-muted-foreground ml-1.5">авто</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Input
                        type="number" value={exp.tariff}
                        onChange={(e) => onExpenseChange(exp.id, "tariff", parseFloat(e.target.value) || 0)}
                        disabled={!exp.enabled || disabled}
                        className="h-8 w-24 text-xs text-right" placeholder="Тариф"
                      />
                      <span className="text-[10px] text-muted-foreground">×</span>
                      <Input
                        type="number" value={exp.quantity}
                        onChange={(e) => onExpenseChange(exp.id, "quantity", parseFloat(e.target.value) || 0)}
                        disabled={!exp.enabled || disabled}
                        className="h-8 w-16 text-xs text-right" placeholder="Кол."
                      />
                      <span className="text-[10px] text-muted-foreground">{exp.unit}</span>
                      <span className="text-xs font-mono text-muted-foreground w-20 text-right">
                        {exp.enabled ? `${(exp.tariff * exp.quantity).toLocaleString("ru-RU")} ₸` : "—"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
