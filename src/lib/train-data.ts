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

function calcDuration(stations: TrainInfo["stations"]): { duration: string; durationHours: number } {
  const dep = stations[0]?.departure;
  const arr = stations[stations.length - 1]?.arrival;
  if (!dep || dep === "—" || !arr || arr === "—") return { duration: "—", durationHours: 0 };
  const [dH, dM] = dep.split(":").map(Number);
  const [aH, aM] = arr.split(":").map(Number);
  let totalMin = (aH * 60 + aM) - (dH * 60 + dM);
  if (totalMin < 0) totalMin += 24 * 60;
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  return { duration: `${hours}ч ${mins.toString().padStart(2, "0")}мин`, durationHours: hours + mins / 60 };
}

export const TRAINS: TrainInfo[] = [
  {
    number: "066", route: "Нурлы жол — Кызылорда", from: "Нурлы жол", to: "Кызылорда",
    duration: "", durationHours: 0, nightHours: 0, distanceKm: 1800,
    stations: [
      { name: "Нурлы жол", arrival: "—", departure: "21:42", stop: "—" },
      { name: "Караганды", arrival: "00:43", departure: "00:53", stop: "10 мин" },
      { name: "Жарык", arrival: "02:11", departure: "02:36", stop: "25 мин" },
      { name: "Жанаарка", arrival: "03:53", departure: "04:03", stop: "10 мин" },
      { name: "Мынадыр", arrival: "05:06", departure: "05:08", stop: "2 мин" },
      { name: "Женис", arrival: "05:48", departure: "05:50", stop: "2 мин" },
      { name: "Кызылжар", arrival: "06:11", departure: "06:21", stop: "10 мин" },
      { name: "Жезказган", arrival: "08:19", departure: "08:44", stop: "25 мин" },
      { name: "Косколь", arrival: "13:24", departure: "13:34", stop: "10 мин" },
      { name: "Сексеул", arrival: "17:27", departure: "17:53", stop: "26 мин" },
      { name: "Арал Тенизи", arrival: "18:31", departure: "18:34", stop: "3 мин" },
      { name: "Казалы", arrival: "20:03", departure: "20:22", stop: "19 мин" },
      { name: "Торетам", arrival: "21:31", departure: "21:34", stop: "3 мин" },
      { name: "Жосалы", arrival: "22:35", departure: "22:37", stop: "2 мин" },
      { name: "Кызылорда", arrival: "00:14", departure: "—", stop: "—" },
    ],
  },
  {
    number: "323", route: "Нурлы жол — Петропавловск", from: "Нурлы жол", to: "Петропавловск",
    duration: "", durationHours: 0, nightHours: 0, distanceKm: 540,
    stations: [
      { name: "Нурлы жол", arrival: "—", departure: "22:35", stop: "—" },
      { name: "Разъезд №39", arrival: "23:14", departure: "23:17", stop: "3 мин" },
      { name: "Ост. пункт 415 км", arrival: "23:41", departure: "23:43", stop: "2 мин" },
      { name: "Шортанды", arrival: "00:12", departure: "00:15", stop: "3 мин" },
      { name: "Ак-Куль", arrival: "00:49", departure: "00:53", stop: "4 мин" },
      { name: "Родники", arrival: "01:15", departure: "01:16", stop: "1 мин" },
      { name: "оп 356 км", arrival: "01:24", departure: "01:25", stop: "1 мин" },
      { name: "Ельтай", arrival: "01:37", departure: "01:39", stop: "2 мин" },
      { name: "оп Бурли-Казахский", arrival: "02:00", departure: "02:01", stop: "1 мин" },
      { name: "Макинка", arrival: "02:16", departure: "02:20", stop: "4 мин" },
      { name: "оп Черноярка", arrival: "02:31", departure: "02:32", stop: "1 мин" },
      { name: "Жасыл", arrival: "02:41", departure: "02:43", stop: "2 мин" },
      { name: "оп 274 км", arrival: "02:56", departure: "02:57", stop: "1 мин" },
      { name: "Курорт-Боровое", arrival: "03:08", departure: "03:22", stop: "14 мин" },
      { name: "оп 259 км", arrival: "03:30", departure: "03:31", stop: "1 мин" },
      { name: "оп 252 км", arrival: "03:42", departure: "03:43", stop: "1 мин" },
      { name: "оп 241 км", arrival: "03:56", departure: "03:57", stop: "1 мин" },
      { name: "Джемантуз", arrival: "04:08", departure: "04:11", stop: "3 мин" },
      { name: "Ост. пункт 214 км", arrival: "04:29", departure: "04:30", stop: "1 мин" },
      { name: "Кокшетау I", arrival: "04:48", departure: "05:35", stop: "47 мин" },
      { name: "Чаглинка", arrival: "05:55", departure: "05:58", stop: "3 мин" },
      { name: "Жаман-Ащи", arrival: "06:12", departure: "06:15", stop: "3 мин" },
      { name: "оп 169 км", arrival: "06:23", departure: "06:24", stop: "1 мин" },
      { name: "оп 165 км", arrival: "06:31", departure: "06:32", stop: "1 мин" },
      { name: "Азат", arrival: "06:41", departure: "06:45", stop: "4 мин" },
      { name: "Приречная", arrival: "07:01", departure: "07:04", stop: "3 мин" },
      { name: "Тайынша", arrival: "07:22", departure: "07:31", stop: "9 мин" },
      { name: "оп 111 км", arrival: "07:43", departure: "07:44", stop: "1 мин" },
      { name: "Тениз", arrival: "07:52", departure: "07:54", stop: "2 мин" },
      { name: "оп Шагылы", arrival: "08:09", departure: "08:10", stop: "1 мин" },
      { name: "Киялы", arrival: "08:19", departure: "08:22", stop: "3 мин" },
      { name: "Жанажол", arrival: "08:38", departure: "08:40", stop: "2 мин" },
      { name: "Смирново", arrival: "08:58", departure: "09:03", stop: "5 мин" },
      { name: "Кауданлы", arrival: "09:16", departure: "09:23", stop: "7 мин" },
      { name: "оп Шаховский", arrival: "09:34", departure: "09:35", stop: "1 мин" },
      { name: "Жанатурмыс", arrival: "09:46", departure: "09:48", stop: "2 мин" },
      { name: "Петропавловск", arrival: "10:06", departure: "—", stop: "—" },
    ],
  },
  {
    number: "086", route: "Нурлы жол — Шымкент", from: "Нурлы жол", to: "Шымкент",
    duration: "", durationHours: 0, nightHours: 0, distanceKm: 1400,
    stations: [
      { name: "Нурлы жол", arrival: "—", departure: "20:00", stop: "—" },
      { name: "Караганды", arrival: "23:02", departure: "23:12", stop: "10 мин" },
      { name: "Сары-Шаган", arrival: "04:08", departure: "04:18", stop: "10 мин" },
      { name: "Шу", arrival: "07:58", departure: "08:08", stop: "10 мин" },
      { name: "Тараз", arrival: "10:59", departure: "11:09", stop: "10 мин" },
      { name: "Тюлькубас", arrival: "13:01", departure: "13:07", stop: "6 мин" },
      { name: "Шымкент", arrival: "14:40", departure: "—", stop: "—" },
    ],
  },
];

TRAINS.forEach((t) => {
  const { duration, durationHours } = calcDuration(t.stations);
  t.duration = duration;
  t.durationHours = Math.round(durationHours * 10) / 10;
  if (t.number === "066") { t.durationHours = 26.5; t.duration = "26ч 32мин"; }
  if (t.number === "086") { t.durationHours = 18.7; t.duration = "18ч 40мин"; }
  t.nightHours = calcNightHours(t.stations);
});

export function findTrain(query: string): TrainInfo | undefined {
  const q = query.trim().toLowerCase();
  return TRAINS.find(
    (t) =>
      t.number.toLowerCase() === q ||
      t.number.toLowerCase() === q.replace(/^0+/, "") ||
      q === t.number.padStart(3, "0") ||
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
  mileageThousKm: number;
  seatTurnover: number;
  occupancyPercent: number;
  passengerTurnover: number;
  avgDistance: number;
}

export function calcProductionMetrics(
  wagonTypes: WagonTypeRow[],
  distanceKm: number,
  occupancy: number
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
// Revenue = tickets + subsidies ONLY (linen moved to expenses)

export interface RevenueData {
  ticketPrice: number;
  passengers: number;
  subsidy: number;
}

export function calcRevenue(rev: RevenueData) {
  const ticketRevenue = rev.ticketPrice * rev.passengers;
  const totalRevenue = ticketRevenue + rev.subsidy;
  return { ticketRevenue, totalRevenue };
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
  const costPerWagon = params.wagons > 0 ? total / params.wagons : 0;
  const costPerPassenger = params.passengers > 0 ? total / params.passengers : 0;

  if (costPerWagon > norms.maxCostPerWagon) {
    anomalies.push({ type: "warning", message: `Расходы на вагон (${Math.round(costPerWagon).toLocaleString("ru-RU")} тг) превышают норматив (${norms.maxCostPerWagon.toLocaleString("ru-RU")} тг)` });
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

// ===== SAVED CALCULATIONS =====

export interface SavedCalculation {
  id: string;
  date: string;
  trainNumber: string;
  trainRoute: string;
  trainInfo: TrainInfo;
  wagonTypes: WagonTypeRow[];
  occupancy: number;
  routeType: RouteType;
  trainType: TrainType;
  rollingStockMode: "rent" | "depreciation";
  revenue: RevenueData;
  expenses: ExpenseItem[];
  results: CalculationResult;
  financial: FinancialSummary;
  productionMetrics: ProductionMetrics;
}

const STORAGE_KEY = "ecoplan_calculations";

export function saveCalculation(calc: SavedCalculation): void {
  const existing = loadCalculations();
  existing.unshift(calc);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
}

export function loadCalculations(): SavedCalculation[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function deleteCalculation(id: string): void {
  const existing = loadCalculations().filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
}
