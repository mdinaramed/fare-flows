export interface TrainInfo {
  number: string;
  route: string;
  from: string;
  to: string;
  duration: string;
  stations: { name: string; arrival: string; departure: string; stop: string }[];
}

export const TRAINS: TrainInfo[] = [
  {
    number: "T009",
    route: "Астана → Алматы",
    from: "Астана",
    to: "Алматы",
    duration: "15ч 20мин",
    stations: [
      { name: "Астана", arrival: "—", departure: "18:00", stop: "—" },
      { name: "Караганда", arrival: "21:15", departure: "21:25", stop: "10 мин" },
      { name: "Балхаш", arrival: "02:40", departure: "02:50", stop: "10 мин" },
      { name: "Шу", arrival: "06:10", departure: "06:15", stop: "5 мин" },
      { name: "Алматы", arrival: "09:20", departure: "—", stop: "—" },
    ],
  },
  {
    number: "T001",
    route: "Астана → Атырау",
    from: "Астана",
    to: "Атырау",
    duration: "28ч 00мин",
    stations: [
      { name: "Астана", arrival: "—", departure: "14:00", stop: "—" },
      { name: "Кызылорда", arrival: "04:30", departure: "04:45", stop: "15 мин" },
      { name: "Актобе", arrival: "12:00", departure: "12:20", stop: "20 мин" },
      { name: "Атырау", arrival: "18:00", departure: "—", stop: "—" },
    ],
  },
  {
    number: "T005",
    route: "Алматы → Шымкент",
    from: "Алматы",
    to: "Шымкент",
    duration: "11ч 30мин",
    stations: [
      { name: "Алматы", arrival: "—", departure: "20:00", stop: "—" },
      { name: "Тараз", arrival: "04:00", departure: "04:10", stop: "10 мин" },
      { name: "Шымкент", arrival: "07:30", departure: "—", stop: "—" },
    ],
  },
];

export function findTrain(number: string): TrainInfo | undefined {
  return TRAINS.find((t) => t.number.toLowerCase() === number.trim().toLowerCase());
}

export interface TariffSettings {
  mzs: number;
  water: number;
  fuel: number;
  fot: number;
  cleaning: number;
  sanitation: number;
  disinfection: number;
  deratization: number;
  disinsection: number;
  rent: number;
  depreciation: number;
  linen: number;
  supplies: number;
  inventory: number;
}

export const DEFAULT_TARIFFS: TariffSettings = {
  mzs: 50000,
  water: 3000,
  fuel: 15000,
  fot: 120000,
  cleaning: 5000,
  sanitation: 4000,
  disinfection: 3500,
  deratization: 2000,
  disinsection: 2500,
  rent: 80000,
  depreciation: 60000,
  linen: 1500,
  supplies: 2000,
  inventory: 5000,
};

export interface ExpenseItem {
  id: string;
  label: string;
  enabled: boolean;
  tariff: number;
  quantity: number;
  group: string;
}

export function createDefaultExpenses(tariffs: TariffSettings, wagons: number): ExpenseItem[] {
  return [
    { id: "mzs", label: "МЖС", enabled: true, tariff: tariffs.mzs, quantity: 1, group: "МЖС" },
    { id: "water", label: "Вода", enabled: true, tariff: tariffs.water, quantity: wagons, group: "Станционные" },
    { id: "fuel", label: "Топливо", enabled: true, tariff: tariffs.fuel, quantity: 1, group: "Станционные" },
    { id: "cleaning", label: "Клининг", enabled: true, tariff: tariffs.cleaning, quantity: wagons, group: "Станционные" },
    { id: "sanitation", label: "Ассенизация", enabled: true, tariff: tariffs.sanitation, quantity: wagons, group: "Станционные" },
    { id: "disinfection", label: "Дезинфекция", enabled: true, tariff: tariffs.disinfection, quantity: wagons, group: "Станционные" },
    { id: "deratization", label: "Дератизация", enabled: true, tariff: tariffs.deratization, quantity: wagons, group: "Станционные" },
    { id: "disinsection", label: "Дезинсекция", enabled: true, tariff: tariffs.disinsection, quantity: wagons, group: "Станционные" },
    { id: "rent", label: "Аренда", enabled: true, tariff: tariffs.rent, quantity: wagons, group: "Подвижной состав" },
    { id: "depreciation", label: "Амортизация", enabled: true, tariff: tariffs.depreciation, quantity: wagons, group: "Подвижной состав" },
    { id: "fot", label: "ФОТ", enabled: true, tariff: tariffs.fot, quantity: 2 * wagons, group: "ФОТ" },
    { id: "linen", label: "Бельё", enabled: true, tariff: tariffs.linen, quantity: wagons * 36, group: "Расходники" },
    { id: "drinkwater", label: "Вода (питьевая)", enabled: true, tariff: 500, quantity: wagons * 36, group: "Расходники" },
    { id: "supplies", label: "Расходные материалы", enabled: true, tariff: tariffs.supplies, quantity: wagons, group: "Расходники" },
    { id: "inventory_item", label: "Инвентарь", enabled: true, tariff: tariffs.inventory, quantity: wagons, group: "Расходники" },
  ];
}

export type RouteType = "social" | "commercial";

export function calculateExpenses(
  expenses: ExpenseItem[],
  routeType: RouteType,
  nightHours: number
) {
  const results: Record<string, number> = {};
  let total = 0;

  for (const exp of expenses) {
    if (!exp.enabled) continue;
    let cost = exp.tariff * exp.quantity;

    if (exp.id === "mzs") {
      cost = routeType === "social" ? exp.tariff * 0.01 : exp.tariff;
    }

    if (exp.id === "fot" && nightHours > 0) {
      cost += exp.tariff * exp.quantity * (nightHours / 8) * 0.5;
    }

    if (!results[exp.group]) results[exp.group] = 0;
    results[exp.group] += cost;
    total += cost;
  }

  return { byGroup: results, total };
}
