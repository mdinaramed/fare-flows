import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench } from "lucide-react";
import type { TariffSettings } from "@/lib/train-data";

interface TariffSettingsProps {
  tariffs: TariffSettings;
  onTariffChange: (key: keyof TariffSettings, value: number) => void;
}

const TARIFF_GROUPS = [
  {
    title: "Основные тарифы",
    items: [
      { key: "mzs" as const, label: "МЖС" },
      { key: "water" as const, label: "Вода (техническая)" },
      { key: "fuel" as const, label: "Топливо" },
      { key: "drinkWater" as const, label: "Вода (питьевая)" },
    ],
  },
  {
    title: "Станционные",
    items: [
      { key: "cleaning" as const, label: "Клининг" },
      { key: "sanitation" as const, label: "Ассенизация" },
      { key: "disinfection" as const, label: "Дезинфекция" },
      { key: "deratization" as const, label: "Дератизация" },
      { key: "disinsection" as const, label: "Дезинсекция" },
    ],
  },
  {
    title: "Подвижной состав",
    items: [
      { key: "rent" as const, label: "Аренда вагона" },
      { key: "depreciation" as const, label: "Амортизация" },
    ],
  },
  {
    title: "Форма персонала",
    items: [
      { key: "uniformSummer" as const, label: "Форма (летняя)" },
      { key: "uniformWinter" as const, label: "Форма (зимняя)" },
    ],
  },
  {
    title: "Расходники",
    items: [
      { key: "linen" as const, label: "Бельё" },
      { key: "supplies" as const, label: "Расходные материалы" },
      { key: "inventory" as const, label: "Инвентарь" },
    ],
  },
  {
    title: "Нормативы",
    items: [
      { key: "staffPerWagon" as const, label: "Проводников на вагон" },
      { key: "nightCoefficient" as const, label: "Ночной коэффициент" },
    ],
  },
];

export function TariffSettingsBlock({ tariffs, onTariffChange }: TariffSettingsProps) {
  return (
    <div className="space-y-6">
      {TARIFF_GROUPS.map((group) => (
        <Card key={group.title}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              {group.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {group.items.map(({ key, label }) => (
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
      ))}
    </div>
  );
}
