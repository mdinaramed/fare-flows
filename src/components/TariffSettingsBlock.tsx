import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench } from "lucide-react";
import type { TariffSettings } from "@/lib/train-data";

interface TariffSettingsProps {
  tariffs: TariffSettings;
  onTariffChange: (key: keyof TariffSettings, value: number) => void;
}

const TARIFF_LABELS: { key: keyof TariffSettings; label: string }[] = [
  { key: "mzs", label: "МЖС" },
  { key: "water", label: "Вода" },
  { key: "fuel", label: "Топливо" },
  { key: "fot", label: "ФОТ (за сотрудника)" },
  { key: "cleaning", label: "Клининг" },
  { key: "sanitation", label: "Ассенизация" },
  { key: "rent", label: "Аренда вагона" },
  { key: "depreciation", label: "Амортизация" },
  { key: "linen", label: "Бельё" },
];

export function TariffSettingsBlock({ tariffs, onTariffChange }: TariffSettingsProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wrench className="h-5 w-5 text-muted-foreground" />
          Настройки тарифов
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {TARIFF_LABELS.map(({ key, label }) => (
            <div key={key}>
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                type="number"
                value={tariffs[key]}
                onChange={(e) => onTariffChange(key, parseFloat(e.target.value) || 0)}
                className="h-9 text-sm mt-1"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
