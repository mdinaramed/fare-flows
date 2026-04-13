import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Receipt } from "lucide-react";
import type { ExpenseItem } from "@/lib/train-data";

const GROUP_ICONS: Record<string, string> = {
  "МЖС": "🏛️",
  "Станционные": "🚉",
  "Подвижной состав": "🚃",
  "ФОТ": "👷",
  "Расходники": "📦",
};

interface ExpenseTrackerProps {
  expenses: ExpenseItem[];
  nightHours: number;
  onExpenseChange: (id: string, field: keyof ExpenseItem, value: unknown) => void;
  onNightHoursChange: (v: number) => void;
}

export function ExpenseTracker({ expenses, nightHours, onExpenseChange, onNightHoursChange }: ExpenseTrackerProps) {
  const groups = [...new Set(expenses.map((e) => e.group))];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Receipt className="h-5 w-5 text-primary" />
          Трекер расходов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {groups.map((group) => (
          <div key={group}>
            <p className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
              <span>{GROUP_ICONS[group] || "📋"}</span>
              {group}
            </p>
            <div className="space-y-2">
              {expenses
                .filter((e) => e.group === group)
                .map((exp) => (
                  <div
                    key={exp.id}
                    className={`rounded-lg border p-3 transition-all ${
                      exp.enabled ? "bg-card border-border" : "bg-muted/30 border-transparent opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={exp.enabled}
                        onCheckedChange={(v) => onExpenseChange(exp.id, "enabled", !!v)}
                      />
                      <span className="text-sm font-medium flex-1">{exp.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-28">
                          <Input
                            type="number"
                            value={exp.tariff}
                            onChange={(e) => onExpenseChange(exp.id, "tariff", parseFloat(e.target.value) || 0)}
                            disabled={!exp.enabled}
                            className="h-8 text-xs text-right"
                            placeholder="Тариф"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">×</span>
                        <div className="w-20">
                          <Input
                            type="number"
                            value={exp.quantity}
                            onChange={(e) => onExpenseChange(exp.id, "quantity", parseFloat(e.target.value) || 0)}
                            disabled={!exp.enabled}
                            className="h-8 text-xs text-right"
                            placeholder="Кол-во"
                          />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground w-24 text-right">
                          = {exp.enabled ? (exp.tariff * exp.quantity).toLocaleString("ru-RU") : "—"} ₸
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            {group === "ФОТ" && (
              <div className="mt-2 pl-7">
                <Label className="text-xs text-muted-foreground">Ночные часы</Label>
                <Input
                  type="number"
                  min={0}
                  max={12}
                  value={nightHours}
                  onChange={(e) => onNightHoursChange(Math.max(0, parseInt(e.target.value) || 0))}
                  className="h-8 w-24 text-xs mt-1"
                />
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
