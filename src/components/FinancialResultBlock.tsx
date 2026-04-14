import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Scale, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import type { FinancialSummary } from "@/lib/train-data";

interface FinancialResultBlockProps {
  summary: FinancialSummary;
}

export function FinancialResultBlock({ summary }: FinancialResultBlockProps) {
  const isProfit = summary.financialResult >= 0;

  return (
    <Card className={`border-2 ${isProfit ? "border-success/40 bg-success/5" : "border-destructive/40 bg-destructive/5"}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scale className="h-5 w-5" />
          Финансовый результат
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex-1 rounded-xl bg-success/10 p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">Доходы</p>
            <p className="text-xl font-bold text-success">{summary.totalRevenue.toLocaleString("ru-RU")} ₸</p>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
          <div className="flex-1 rounded-xl bg-destructive/10 p-4 text-center">
            <p className="text-xs text-muted-foreground uppercase mb-1">Расходы</p>
            <p className="text-xl font-bold text-destructive">{summary.totalExpenses.toLocaleString("ru-RU")} ₸</p>
          </div>
        </div>

        <div className={`rounded-xl p-5 text-center ${isProfit ? "bg-success/15" : "bg-destructive/15"}`}>
          <div className="flex items-center justify-center gap-2 mb-1">
            {isProfit ? <TrendingUp className="h-5 w-5 text-success" /> : <TrendingDown className="h-5 w-5 text-destructive" />}
            <p className="text-xs text-muted-foreground uppercase">{isProfit ? "Прибыль" : "Убыток"}</p>
          </div>
          <p className={`text-3xl font-bold ${isProfit ? "text-success" : "text-destructive"}`}>
            {summary.financialResult.toLocaleString("ru-RU")} ₸
          </p>
          <Badge variant="secondary" className="mt-2 text-xs">
            Маржа: {summary.profitMargin.toFixed(1)}%
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
