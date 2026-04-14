export type TrainType = "talgo" | "standard";
export type RouteType = "social" | "commercial";
export type UserRole = "manager" | "analyst" | "director";

export interface TrainInfo {
  number: string;
  route: string;
  from: string;
  to: string;
  duration: string;
  durationHours: number;
  nightHours: number;
  distanceKm: number;
  stations: { name: string; arrival: string; departure: string; stop: string }[];
}

function calcNightHours(stations: TrainInfo["stations"]): number {
  const dep = stations[0]?.departure;
  const arr = stations[stations.length - 1]?.arrival;
  if (!dep || dep === "—" || !arr || arr === "—") return 0;
  const depH = parseInt(dep.split(":")[0]);
  const arrH = parseInt(arr.split(":")[0]);
  let night = 0;
  const nightStart = 22, nightEnd = 6;
  const totalH = depH > arrH ? (24 - depH + arrH) : (arrH - depH);
  for (let i = 0; i < totalH; i++) {
    const cur = (depH + i) % 24;
    if (cur >= nightStart || cur < nightEnd) night++;
  }
  return night;
}

export const TRAINS: TrainInfo[] = [
  {
    number: "T009", route: "Астана → Алматы", from: "Астана", to: "Алматы",
    duration: "15ч 20мин", durationHours: 15, nightHours: 0, distanceKm: 1291,
    stations: [
      { name: "Астана", arrival: "—", departure: "18:00", stop: "—" },
      { name: "Караганда", arrival: "21:15", departure: "21:25", stop: "10 мин" },
      { name: "Балхаш", arrival: "02:40", departure: "02:50", stop: "10 мин" },
      { name: "Шу", arrival: "06:10", departure: "06:15", stop: "5 мин" },
      { name: "Алматы", arrival: "09:20", departure: "—", stop: "—" },
    ],
  },
  {
    number: "T001", route: "Астана → Атырау", from: "Астана", to: "Атырау",
    duration: "28ч 00мин", durationHours: 28, nightHours: 0, distanceKm: 2150,
    stations: [
      { name: "Астана", arrival: "—", departure: "14:00", stop: "—" },
      { name: "Кызылорда", arrival: "04:30", departure: "04:45", stop: "15 мин" },
      { name: "Актобе", arrival: "12:00", departure: "12:20", stop: "20 мин" },
      { name: "Атырау", arrival: "18:00", departure: "—", stop: "—" },
    ],
  },
  {
    number: "T005", route: "Алматы → Шымкент", from: "Алматы", to: "Шымкент",
    duration: "11ч 30мин", durationHours: 11, nightHours: 0, distanceKm: 725,
    stations: [
      { name: "Алматы", arrival: "—", departure: "20:00", stop: "—" },
      { name: "Тараз", arrival: "04:00", departure: "04:10", stop: "10 мин" },
      { name: "Шымкент", arrival: "07:30", departure: "—", stop: "—" },
    ],
  },
];

TRAINS.forEach((t) => { t.nightHours = calcNightHours(t.stations); });

export function findTrain(query: string): TrainInfo | undefined {
  const q = query.trim().toLowerCase();
  return TRAINS.find(
    (t) =>
      t.number.toLowerCase() === q ||
      t.route.toLowerCase().includes(q) ||
      t.from.toLowerCase().includes(q) ||
      t.to.toLowerCase().includes(q)
  );
}

// ===== WAGON TYPES & PRODUCTION =====

export interface WagonTypeRow {
  id: string;
  type: string;
  seats: number;
  count: number;
}

export const DEFAULT_WAGON_TYPES: WagonTypeRow[] = [
  { id: "sv", type: "СВ", seats: 18, count: 1 },
  { id: "kupe", type: "Купе", seats: 36, count: 5 },
  { id: "plats", type: "Плацкарт", seats: 54, count: 4 },
];

export interface ProductionMetrics {
  totalWagons: number;
  totalSeats: number;
  mileageThousKm: number;      // тыс. ваг.км
  seatTurnover: number;         // тыс. мест.км
  occupancyPercent: number;     // вместимость %
  passengerTurnover: number;    // пассажирооборот
  avgDistance: number;           // средняя дальность
}

export function calcProductionMetrics(
  wagonTypes: WagonTypeRow[],
  distanceKm: number,
  occupancy: number // 0-100
): ProductionMetrics {
  const totalWagons = wagonTypes.reduce((s, w) => s + w.count, 0);
  const totalSeats = wagonTypes.reduce((s, w) => s + w.seats * w.count, 0);
  const mileageThousKm = (totalWagons * distanceKm) / 1000;
  const seatTurnover = (totalSeats * distanceKm) / 1000;
  const occupancyPercent = occupancy;
  const passengerTurnover = seatTurnover * (occupancy / 100);
  const avgDistance = distanceKm;
  return { totalWagons, totalSeats, mileageThousKm, seatTurnover, occupancyPercent, passengerTurnover, avgDistance };
}

// ===== REVENUE =====

export interface RevenueData {
  ticketPrice: number;
  passengers: number;
  linenPrice: number;
  linenPassengers: number;
  subsidy: number;
}

export function calcRevenue(rev: RevenueData) {
  const ticketRevenue = rev.ticketPrice * rev.passengers;
  const linenRevenue = rev.linenPrice * rev.linenPassengers;
  const totalRevenue = ticketRevenue + linenRevenue + rev.subsidy;
  return { ticketRevenue, linenRevenue, totalRevenue };
}

// ===== TARIFFS =====

export interface TariffSettings {
  mzs: number;
  water: number;
  fuel: number;
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
  drinkWater: number;
  uniformSummer: number;
  uniformWinter: number;
  staffPerWagon: number;
  nightCoefficient: number;
}

export const DEFAULT_TARIFFS: TariffSettings = {
  mzs: 50000,
  water: 3000,
  fuel: 15000,
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
  drinkWater: 500,
  uniformSummer: 35000,
  uniformWinter: 45000,
  staffPerWagon: 2,
  nightCoefficient: 1.5,
};

// ===== EXPENSES =====

export interface ExpenseItem {
  id: string;
  label: string;
  enabled: boolean;
  tariff: number;
  quantity: number;
  group: string;
  unit: string;
  auto: boolean;
}

export interface CalculationParams {
  wagons: number;
  routeType: RouteType;
  trainType: TrainType;
  passengers: number;
  rollingStockMode: "rent" | "depreciation";
  train: TrainInfo;
  tariffs: TariffSettings;
}

export function createDefaultExpenses(params: CalculationParams): ExpenseItem[] {
  const { wagons, trainType, passengers, rollingStockMode, train, tariffs } = params;
  const staff = tariffs.staffPerWagon * wagons;
  const trainMultiplier = trainType === "talgo" ? 1.3 : 1.0;

  return [
    { id: "mzs", label: "МЖС", enabled: true, tariff: Math.round(tariffs.mzs * trainMultiplier), quantity: 1, group: "МЖС", unit: "рейс", auto: true },
    { id: "water", label: "Вода (техническая)", enabled: true, tariff: tariffs.water, quantity: wagons, group: "Станционные", unit: "вагон", auto: true },
    { id: "fuel", label: "Топливо", enabled: true, tariff: Math.round(tariffs.fuel * (train.durationHours / 10)), quantity: 1, group: "Станционные", unit: "рейс", auto: true },
    { id: "cleaning", label: "Клининг", enabled: true, tariff: tariffs.cleaning, quantity: wagons, group: "Станционные", unit: "вагон", auto: true },
    { id: "sanitation", label: "Ассенизация", enabled: true, tariff: tariffs.sanitation, quantity: wagons, group: "Станционные", unit: "вагон", auto: true },
    { id: "disinfection", label: "Дезинфекция", enabled: true, tariff: tariffs.disinfection, quantity: wagons, group: "Станционные", unit: "вагон", auto: true },
    { id: "deratization", label: "Дератизация", enabled: true, tariff: tariffs.deratization, quantity: wagons, group: "Станционные", unit: "вагон", auto: true },
    { id: "disinsection", label: "Дезинсекция", enabled: true, tariff: tariffs.disinsection, quantity: wagons, group: "Станционные", unit: "вагон", auto: true },
    ...(rollingStockMode === "rent"
      ? [{ id: "rent", label: "Аренда вагонов", enabled: true, tariff: tariffs.rent, quantity: wagons, group: "Подвижной состав", unit: "вагон", auto: true }]
      : [{ id: "depreciation", label: "Амортизация", enabled: true, tariff: tariffs.depreciation, quantity: wagons, group: "Подвижной состав", unit: "вагон", auto: true }]),
    { id: "uniform_summer", label: "Форма (летняя)", enabled: true, tariff: Math.round(tariffs.uniformSummer / 24), quantity: staff, group: "Форма персонала", unit: "чел./мес", auto: true },
    { id: "uniform_winter", label: "Форма (зимняя)", enabled: true, tariff: Math.round(tariffs.uniformWinter / 24), quantity: staff, group: "Форма персонала", unit: "чел./мес", auto: true },
    { id: "linen", label: "Бельё", enabled: true, tariff: tariffs.linen, quantity: passengers, group: "Расходники", unit: "пасс.", auto: true },
    { id: "drinkwater", label: "Вода (питьевая)", enabled: true, tariff: tariffs.drinkWater, quantity: passengers, group: "Расходники", unit: "пасс.", auto: true },
    { id: "supplies", label: "Расходные материалы", enabled: true, tariff: tariffs.supplies, quantity: wagons, group: "Расходники", unit: "вагон", auto: true },
    { id: "inventory_item", label: "Инвентарь", enabled: true, tariff: tariffs.inventory, quantity: wagons, group: "Расходники", unit: "вагон", auto: true },
  ];
}

// ===== ANOMALIES & NORMS =====

export interface Norms {
  maxCostPerWagon: number;
  maxStationShare: number;
}

export const DEFAULT_NORMS: Norms = {
  maxCostPerWagon: 500000,
  maxStationShare: 0.3,
};

export interface Anomaly {
  type: "warning" | "critical";
  message: string;
  group?: string;
}

export interface CalculationResult {
  byGroup: Record<string, number>;
  total: number;
  costPerWagon: number;
  costPerPassenger: number;
  anomalies: Anomaly[];
  planVsFact: { group: string; plan: number; fact: number; deviation: number }[];
}

export function calculateExpenses(
  expenses: ExpenseItem[],
  params: CalculationParams,
  norms: Norms = DEFAULT_NORMS
): CalculationResult {
  const results: Record<string, number> = {};
  let total = 0;

  for (const exp of expenses) {
    if (!exp.enabled) continue;
    let cost = exp.tariff * exp.quantity;

    if (exp.id === "mzs") {
      cost = params.routeType === "social" ? exp.tariff * 0.01 : exp.tariff;
    }

    if (!results[exp.group]) results[exp.group] = 0;
    results[exp.group] += cost;
    total += cost;
  }

  const anomalies: Anomaly[] = [];
  const costPerWagon = total / params.wagons;
  const costPerPassenger = total / params.passengers;

  if (costPerWagon > norms.maxCostPerWagon) {
    anomalies.push({ type: "warning", message: `Расходы на вагон (${Math.round(costPerWagon).toLocaleString("ru-RU")} ₸) превышают норматив (${norms.maxCostPerWagon.toLocaleString("ru-RU")} ₸)` });
  }

  const stationShare = (results["Станционные"] || 0) / total;
  if (stationShare > norms.maxStationShare) {
    anomalies.push({ type: "warning", message: `Доля станционных (${Math.round(stationShare * 100)}%) превышает норматив (${Math.round(norms.maxStationShare * 100)}%)`, group: "Станционные" });
  }

  const planMultiplier = params.trainType === "talgo" ? 1.15 : 1.0;
  const planVsFact = Object.entries(results).map(([group, fact]) => {
    const plan = Math.round(fact * planMultiplier * 0.95);
    return { group, plan, fact, deviation: fact - plan };
  });

  return { byGroup: results, total, costPerWagon, costPerPassenger, anomalies, planVsFact };
}

// ===== FINANCIAL RESULT =====

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  financialResult: number;
  profitMargin: number;
}

export function calcFinancialResult(totalRevenue: number, totalExpenses: number): FinancialSummary {
  const financialResult = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (financialResult / totalRevenue) * 100 : 0;
  return { totalRevenue, totalExpenses, financialResult, profitMargin };
}

export const ROLE_LABELS: Record<UserRole, string> = {
  manager: "Менеджер",
  analyst: "Аналитик",
  director: "Руководство",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  manager: "Ввод данных и расчёт расходов",
  analyst: "Анализ и формирование отчётов",
  director: "Просмотр итогов и отчётов",
};
