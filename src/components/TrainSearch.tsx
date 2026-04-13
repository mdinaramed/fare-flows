import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Train, Clock, MapPin, Moon } from "lucide-react";
import { findTrain, type TrainInfo } from "@/lib/train-data";

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
      if (value.trim().length >= 3) setNotFound(true);
    }
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Train className="h-5 w-5 text-primary" />
          Поиск поезда
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Номер поезда или направление (T009, Алматы...)"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

        {notFound && (
          <p className="text-sm text-destructive">Поезд не найден. Попробуйте: T009, T001, T005 или название города</p>
        )}

        {train && (
          <div className="space-y-4 animate-in fade-in-50 slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xl font-bold text-foreground">{train.route}</p>
                <p className="text-sm text-muted-foreground">Поезд №{train.number}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {train.duration}
                </Badge>
                {train.nightHours > 0 && (
                  <Badge variant="outline" className="gap-1">
                    <Moon className="h-3 w-3" />
                    {train.nightHours}ч ночных
                  </Badge>
                )}
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Маршрут следования</p>
              <div className="space-y-2">
                {train.stations.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="flex flex-col items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${i === 0 || i === train.stations.length - 1 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                      {i < train.stations.length - 1 && <div className="w-px h-4 bg-border" />}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{s.name}</span>
                      </div>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        {s.arrival !== "—" && <span>Приб: {s.arrival}</span>}
                        {s.departure !== "—" && <span>Отпр: {s.departure}</span>}
                        {s.stop !== "—" && <span className="text-primary">⏱ {s.stop}</span>}
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
