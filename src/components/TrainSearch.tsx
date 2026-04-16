import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";
import { findTrain, TRAINS, type TrainInfo } from "@/lib/train-data";

interface TrainSearchProps {
  onTrainFound: (train: TrainInfo) => void;
}

export function TrainSearch({ onTrainFound }: TrainSearchProps) {
  const [query, setQuery] = useState("");
  const [train, setTrain] = useState<TrainInfo | null>(null);
  const [notFound, setNotFound] = useState(false);

  function handleSearch(value: string) {
    setQuery(value);
    setNotFound(false);
    const found = findTrain(value);
    if (found) {
      setTrain(found);
      setNotFound(false);
      onTrainFound(found);
    } else {
      setTrain(null);
      if (value.trim().length >= 2) setNotFound(true);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold uppercase tracking-wide">
          Поиск поезда
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Номер поезда или направление (066, 323, 086)"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {!train && !notFound && (
          <div className="flex gap-2">
            {TRAINS.map((t) => (
              <button
                key={t.number}
                onClick={() => { setQuery(t.number); handleSearch(t.number); }}
                className="text-xs rounded border px-3 py-1.5 hover:bg-accent transition-colors"
              >
                {t.number} — {t.to}
              </button>
            ))}
          </div>
        )}

        {notFound && (
          <p className="text-xs text-destructive">
            Поезд не найден. Доступны: {TRAINS.map((t) => t.number).join(", ")}
          </p>
        )}

        {train && (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-base font-bold">{train.route}</p>
                <p className="text-xs text-muted-foreground">Поезд {train.number} · {train.duration} · {train.distanceKm} км</p>
              </div>
            </div>

            <div className="rounded border p-3 max-h-48 overflow-y-auto">
              <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Маршрут</p>
              <div className="space-y-0.5">
                {train.stations.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="flex flex-col items-center">
                      <div className={`h-1.5 w-1.5 rounded-full ${i === 0 || i === train.stations.length - 1 ? "bg-primary" : "bg-muted-foreground/30"}`} />
                      {i < train.stations.length - 1 && <div className="w-px h-3 bg-border" />}
                    </div>
                    <div className="flex-1 flex items-center justify-between min-w-0">
                      <span className="truncate">{s.name}</span>
                      <div className="flex gap-2 text-muted-foreground shrink-0">
                        {s.arrival !== "—" && <span>{s.arrival}</span>}
                        {s.departure !== "—" && <span>{s.departure}</span>}
                        {s.stop !== "—" && <span className="text-primary">{s.stop}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
