import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface ResultsBlockProps {
  byGroup: Record<string, number>;
  total: number;
}

const GROUP_COLORS: Record<string, string> = {
  "МЖС": "bg-chart-1",
  "Станционные": "bg-chart-2",
  "Подвижной состав": "bg-chart-3",
  "ФОТ": "bg-chart-4",
  "Расходники": "bg-chart-5",
};

export function ResultsBlock({ byGroup, total }: ResultsBlockProps) {
  const maxVal = Math.max(...Object.values(byGroup), 1);

  return (
    <Card className="border-2 border-success/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BarChart3 className="h-5 w-5 text-success" />
          Результат расчёта
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {Object.entries(byGroup).map(([group, amount]) => (
            <div key={group}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium">{group}</span>
                <span className="font-mono">{amount.toLocaleString("ru-RU")} ₸</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${GROUP_COLORS[group] || "bg-primary"}`}
                  style={{ width: `${(amount / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl bg-primary/10 p-4 mt-4">
          <p className="text-sm text-muted-foreground">Итого расходов</p>
          <p className="text-3xl font-bold text-primary">
            {total.toLocaleString("ru-RU")} ₸
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
