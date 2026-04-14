import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import type { RevenueData } from "@/lib/train-data";
import { calcRevenue } from "@/lib/train-data";

interface RevenueBlockProps {
  revenue: RevenueData;
  onRevenueChange: (field: keyof RevenueData, value: number) => void;
  disabled?: boolean;
}

const FIELDS: { key: keyof RevenueData; label: string; icon: string }[] = [
  { key: "ticketPrice", label: "Стоимость билета (₸)", icon: "🎫" },
  { key: "passengers", label: "Кол-во пассажиров", icon: "👥" },
  { key: "linenPrice", label: "Стоимость белья (₸)", icon: "🛏️" },
  { key: "linenPassengers", label: "Пассажиров с бельём", icon: "📋" },
  { key: "subsidy", label: "Субсидии (₸)", icon: "🏦" },
];

export function RevenueBlock({ revenue, onRevenueChange, disabled }: RevenueBlockProps) {
  const { ticketRevenue, linenRevenue, totalRevenue } = calcRevenue(revenue);

  return (
    <Card className="border-2 border-success/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Доходы
          </span>
          <Badge className="bg-success text-success-foreground font-mono text-sm">
            {totalRevenue.toLocaleString("ru-RU")} ₸
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.key === "subsidy" ? "col-span-2" : ""}>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <span>{f.icon}</span> {f.label}
              </Label>
              <Input
                type="number" value={revenue[f.key]}
                onChange={(e) => onRevenueChange(f.key, parseFloat(e.target.value) || 0)}
                className="h-10 text-sm mt-1" disabled={disabled}
              />
            </div>
          ))}
        </div>

        {/* Revenue breakdown */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-success/10 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Билеты</p>
            <p className="text-sm font-bold text-success">{ticketRevenue.toLocaleString("ru-RU")} ₸</p>
          </div>
          <div className="rounded-lg bg-success/10 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Бельё</p>
            <p className="text-sm font-bold text-success">{linenRevenue.toLocaleString("ru-RU")} ₸</p>
          </div>
          <div className="rounded-lg bg-success/10 p-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase">Субсидии</p>
            <p className="text-sm font-bold text-success">{revenue.subsidy.toLocaleString("ru-RU")} ₸</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
