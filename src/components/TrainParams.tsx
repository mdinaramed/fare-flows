import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import type { RouteType } from "@/lib/train-data";

interface TrainParamsProps {
  wagons: number;
  routeType: RouteType;
  onWagonsChange: (v: number) => void;
  onRouteTypeChange: (v: RouteType) => void;
}

export function TrainParams({ wagons, routeType, onWagonsChange, onRouteTypeChange }: TrainParamsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5 text-primary" />
          Основные параметры
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">Количество вагонов</Label>
          <Input
            type="number"
            min={1}
            max={30}
            value={wagons}
            onChange={(e) => onWagonsChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="h-12 text-base"
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Тип маршрута</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onRouteTypeChange("social")}
              className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                routeType === "social"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30"
              }`}
            >
              Социальный
            </button>
            <button
              onClick={() => onRouteTypeChange("commercial")}
              className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                routeType === "commercial"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:border-primary/30"
              }`}
            >
              Коммерческий
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
