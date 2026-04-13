import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2 } from "lucide-react";
import type { RouteType, TrainType } from "@/lib/train-data";

interface TrainParamsProps {
  wagons: number;
  passengers: number;
  routeType: RouteType;
  trainType: TrainType;
  rollingStockMode: "rent" | "depreciation";
  onWagonsChange: (v: number) => void;
  onPassengersChange: (v: number) => void;
  onRouteTypeChange: (v: RouteType) => void;
  onTrainTypeChange: (v: TrainType) => void;
  onRollingStockModeChange: (v: "rent" | "depreciation") => void;
  disabled?: boolean;
}

export function TrainParams({
  wagons, passengers, routeType, trainType, rollingStockMode,
  onWagonsChange, onPassengersChange, onRouteTypeChange, onTrainTypeChange, onRollingStockModeChange,
  disabled,
}: TrainParamsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-5 w-5 text-primary" />
          Параметры расчёта
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Вагонов</Label>
            <Input
              type="number" min={1} max={30} value={wagons}
              onChange={(e) => onWagonsChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-12 text-base" disabled={disabled}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-1.5 block">Пассажиров</Label>
            <Input
              type="number" min={1} max={2000} value={passengers}
              onChange={(e) => onPassengersChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-12 text-base" disabled={disabled}
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Тип маршрута</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["social", "commercial"] as const).map((type) => (
              <button key={type} onClick={() => onRouteTypeChange(type)} disabled={disabled}
                className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                  routeType === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30"
                }`}
              >
                {type === "social" ? "Социальный" : "Коммерческий"}
              </button>
            ))}
          </div>
          {routeType === "social" && (
            <p className="text-xs text-muted-foreground mt-1">МЖС: скидка 99%</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Тип поезда</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["standard", "talgo"] as const).map((type) => (
              <button key={type} onClick={() => onTrainTypeChange(type)} disabled={disabled}
                className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                  trainType === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30"
                }`}
              >
                {type === "standard" ? "Стандарт" : "Тальго"}
              </button>
            ))}
          </div>
          {trainType === "talgo" && (
            <p className="text-xs text-muted-foreground mt-1">Повышающий коэффициент ×1.3 для МЖС</p>
          )}
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Подвижной состав</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["rent", "depreciation"] as const).map((mode) => (
              <button key={mode} onClick={() => onRollingStockModeChange(mode)} disabled={disabled}
                className={`h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                  rollingStockMode === mode
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30"
                }`}
              >
                {mode === "rent" ? "Аренда" : "Амортизация"}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
