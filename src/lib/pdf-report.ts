import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SavedCalculation } from "./train-data";
import { calcRevenue } from "./train-data";
import { ROBOTO_REGULAR_BASE64, ROBOTO_BOLD_BASE64 } from "./roboto-fonts";

let fontsRegistered = false;

function ensureFonts(doc: jsPDF) {
  if (!fontsRegistered) {
    // Register fonts globally on jsPDF API once
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (jsPDF as any).API.events.push([
      "addFonts",
      function (this: jsPDF) {
        this.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR_BASE64);
        this.addFont("Roboto-Regular.ttf", "Roboto", "normal");
        this.addFileToVFS("Roboto-Bold.ttf", ROBOTO_BOLD_BASE64);
        this.addFont("Roboto-Bold.ttf", "Roboto", "bold");
      },
    ]);
    fontsRegistered = true;
  }
  // Apply to current doc
  doc.addFileToVFS("Roboto-Regular.ttf", ROBOTO_REGULAR_BASE64);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.addFileToVFS("Roboto-Bold.ttf", ROBOTO_BOLD_BASE64);
  doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");
  doc.setFont("Roboto", "normal");
}

function fmtMoney(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ")} ₸`;
}

function fmtNum(n: number, digits = 0): string {
  return n.toLocaleString("ru-RU", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function genReportNumber(calc: SavedCalculation): string {
  const d = new Date(calc.date);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const idShort = calc.id.slice(-4).toUpperCase();
  return `№ ${yy}${mm}${dd}-${calc.trainNumber}-${idShort}`;
}

export function generatePdfReport(
  calc: SavedCalculation,
  type: "full" | "cost" | "executive" = "full",
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  ensureFonts(doc);

  const pageWidth = doc.internal.pageSize.width;
  const margin = 18;
  let y = 18;

  // === HEADER ===
  doc.setFont("Roboto", "bold");
  doc.setFontSize(15);
  doc.setTextColor(15, 30, 60);
  const title = "Отчёт по экономической эффективности рейса";
  doc.text(title, pageWidth / 2, y, { align: "center" });
  y += 6;

  doc.setFont("Roboto", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text("EcoPlan Hub — Система планирования расходов пассажирских поездов", pageWidth / 2, y, { align: "center" });
  y += 7;

  // Report meta line
  const formationDate = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  const calcDate = new Date(calc.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  doc.text(`Номер отчёта: ${genReportNumber(calc)}`, margin, y);
  doc.text(`Дата формирования: ${formationDate}`, pageWidth - margin, y, { align: "right" });
  y += 4;
  doc.text(`Дата расчёта: ${calcDate}`, margin, y);
  y += 5;

  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 7;

  // === SECTION 1: ОБЩАЯ ИНФОРМАЦИЯ ===
  y = sectionTitle(doc, "Раздел 1. Общая информация", y, margin);

  const routeTypeLabel = calc.routeType === "social" ? "Социальный" : "Коммерческий";
  const trainTypeLabel = calc.trainType === "talgo" ? "Talgo" : "Стандартный";
  autoTable(doc, {
    startY: y,
    body: [
      ["Номер поезда", calc.trainNumber],
      ["Маршрут", calc.trainRoute],
      ["Время в пути", calc.trainInfo.duration],
      ["Расстояние", `${calc.trainInfo.distanceKm} км`],
      ["Количество вагонов", String(calc.productionMetrics.totalWagons)],
      ["Количество мест", String(calc.productionMetrics.totalSeats)],
      ["Тип поезда", trainTypeLabel],
      ["Тип маршрута", routeTypeLabel],
    ],
    theme: "plain",
    styles: { font: "Roboto", fontStyle: "normal", fontSize: 10, cellPadding: 1.8, textColor: [40, 40, 40] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60, textColor: [60, 60, 60] },
      1: { cellWidth: "auto" },
    },
    margin: { left: margin, right: margin },
  });
  y = getY(doc, y, 60) + 6;

  // === SECTION 2: ДОХОДЫ ===
  y = sectionTitle(doc, "Раздел 2. Доходы", y, margin);
  const { ticketRevenue, totalRevenue } = calcRevenue(calc.revenue);

  const revenueRows: (string | number)[][] = [
    ["Доход от перевозок (билеты)", fmtMoney(ticketRevenue)],
  ];
  if (calc.revenue.subsidy > 0) {
    revenueRows.push(["Государственные субсидии", fmtMoney(calc.revenue.subsidy)]);
  } else {
    revenueRows.push(["Государственные субсидии", fmtMoney(0)]);
  }

  autoTable(doc, {
    startY: y,
    head: [["Статья дохода", "Сумма"]],
    body: revenueRows,
    foot: [["ИТОГО ДОХОДЫ", fmtMoney(totalRevenue)]],
    theme: "grid",
    styles: { font: "Roboto", fontStyle: "normal", fontSize: 9.5, cellPadding: 2.5, textColor: [40, 40, 40] },
    headStyles: { font: "Roboto", fontStyle: "bold", fillColor: [30, 50, 90], textColor: [255, 255, 255], halign: "left" },
    footStyles: { font: "Roboto", fontStyle: "bold", fillColor: [235, 240, 250], textColor: [15, 30, 60] },
    columnStyles: { 1: { halign: "right", cellWidth: 55 } },
    margin: { left: margin, right: margin },
  });
  y = getY(doc, y, 35) + 6;

  // === SECTION 3: РАСХОДЫ ===
  y = sectionTitle(doc, "Раздел 3. Расходы", y, margin);

  const expenseGroupOrder = ["МЖС", "Станционные", "Подвижной состав", "Расходники"];
  const expenseRows: (string | number)[][] = [];
  for (const group of expenseGroupOrder) {
    if (calc.results.byGroup[group] !== undefined) {
      expenseRows.push([group, fmtMoney(calc.results.byGroup[group])]);
    }
  }
  // Add any other groups not in standard order
  for (const [group, amount] of Object.entries(calc.results.byGroup)) {
    if (!expenseGroupOrder.includes(group)) {
      expenseRows.push([group, fmtMoney(amount)]);
    }
  }

  autoTable(doc, {
    startY: y,
    head: [["Категория расходов", "Сумма"]],
    body: expenseRows,
    foot: [["ИТОГО РАСХОДЫ", fmtMoney(calc.results.total)]],
    theme: "grid",
    styles: { font: "Roboto", fontStyle: "normal", fontSize: 9.5, cellPadding: 2.5, textColor: [40, 40, 40] },
    headStyles: { font: "Roboto", fontStyle: "bold", fillColor: [30, 50, 90], textColor: [255, 255, 255], halign: "left" },
    footStyles: { font: "Roboto", fontStyle: "bold", fillColor: [250, 240, 240], textColor: [120, 30, 30] },
    columnStyles: { 1: { halign: "right", cellWidth: 55 } },
    margin: { left: margin, right: margin },
  });
  y = getY(doc, y, 50) + 6;

  // Page break check
  if (y > 230) { doc.addPage(); y = 20; }

  // === SECTION 4: ФИНАНСОВЫЙ РЕЗУЛЬТАТ ===
  y = sectionTitle(doc, "Раздел 4. Финансовый результат", y, margin);
  const isProfit = calc.financial.financialResult >= 0;
  const resultLabel = isProfit ? "ПРИБЫЛЬ" : "УБЫТОК";

  autoTable(doc, {
    startY: y,
    body: [
      ["Доходы всего", fmtMoney(calc.financial.totalRevenue)],
      ["Расходы всего", fmtMoney(calc.financial.totalExpenses)],
      [resultLabel, fmtMoney(calc.financial.financialResult)],
    ],
    theme: "grid",
    styles: { font: "Roboto", fontStyle: "normal", fontSize: 10.5, cellPadding: 3, textColor: [40, 40, 40] },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 90 },
      1: { halign: "right" },
    },
    didParseCell: (data) => {
      if (data.row.index === 2) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fontSize = 11.5;
        data.cell.styles.fillColor = isProfit ? [225, 240, 225] : [250, 225, 225];
        data.cell.styles.textColor = isProfit ? [25, 90, 30] : [140, 25, 25];
      }
    },
    margin: { left: margin, right: margin },
  });
  y = getY(doc, y, 30) + 6;

  // === SECTION 5: АНАЛИТИКА ===
  if (y > 220) { doc.addPage(); y = 20; }
  y = sectionTitle(doc, "Раздел 5. Аналитика", y, margin);

  const passengers = calc.revenue.passengers;
  const wagons = calc.productionMetrics.totalWagons;
  const costPerWagon = wagons > 0 ? calc.results.total / wagons : 0;
  const costPerPassenger = passengers > 0 ? calc.results.total / passengers : 0;
  const revenuePerPassenger = passengers > 0 ? calc.financial.totalRevenue / passengers : 0;

  autoTable(doc, {
    startY: y,
    head: [["Показатель", "Значение"]],
    body: [
      ["Рентабельность", `${fmtNum(calc.financial.profitMargin, 1)} %`],
      ["Расход на 1 вагон", fmtMoney(costPerWagon)],
      ["Расход на 1 пассажира", fmtMoney(costPerPassenger)],
      ["Доход на 1 пассажира", fmtMoney(revenuePerPassenger)],
      ["Пробег", `${fmtNum(calc.productionMetrics.mileageThousKm, 1)} тыс. ваг-км`],
      ["Пассажирооборот", `${fmtNum(calc.productionMetrics.passengerTurnover, 1)} тыс. пасс-км`],
      ["Вместимость", `${calc.productionMetrics.occupancyPercent} %`],
    ],
    theme: "grid",
    styles: { font: "Roboto", fontStyle: "normal", fontSize: 9.5, cellPadding: 2.5, textColor: [40, 40, 40] },
    headStyles: { font: "Roboto", fontStyle: "bold", fillColor: [30, 50, 90], textColor: [255, 255, 255] },
    columnStyles: { 1: { halign: "right", cellWidth: 60 } },
    margin: { left: margin, right: margin },
  });
  y = getY(doc, y, 50) + 6;

  // === ЗАКЛЮЧЕНИЕ ===
  if (y > 245) { doc.addPage(); y = 20; }
  y = sectionTitle(doc, "Заключение", y, margin);

  let conclusion: string;
  if (isProfit && calc.financial.profitMargin >= 15) {
    conclusion = "Рейс является прибыльным с высокой рентабельностью. Рекомендуется к сохранению в текущей конфигурации.";
  } else if (isProfit) {
    conclusion = "Рейс прибыльный, рекомендуется к сохранению. Возможна оптимизация структуры расходов для повышения рентабельности.";
  } else if (calc.financial.profitMargin > -10) {
    conclusion = "Рейс убыточный. Требуется оптимизация расходов и пересмотр тарифной политики.";
  } else {
    conclusion = "Рейс глубоко убыточный. Требуется срочная оптимизация расходов либо увеличение государственного субсидирования.";
  }

  doc.setFont("Roboto", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
  const lines = doc.splitTextToSize(conclusion, pageWidth - 2 * margin - 4);
  // Background box
  const boxH = lines.length * 5 + 6;
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(200, 210, 225);
  doc.roundedRect(margin, y, pageWidth - 2 * margin, boxH, 1.5, 1.5, "FD");
  doc.text(lines, margin + 3, y + 5);
  y += boxH + 4;

  // === FOOTER on every page ===
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    const ph = doc.internal.pageSize.height;
    doc.setFont("Roboto", "normal");
    doc.setFontSize(8);
    doc.setTextColor(140, 140, 140);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, ph - 12, pageWidth - margin, ph - 12);
    doc.text("EcoPlan Hub — Конфиденциально", margin, ph - 7);
    doc.text(`Страница ${p} из ${pageCount}`, pageWidth - margin, ph - 7, { align: "right" });
  }

  // mark unused variable as intentionally referenced
  void type;

  doc.save(`EcoPlan_${calc.trainNumber}_${calc.id.slice(-6)}.pdf`);
}

function sectionTitle(doc: jsPDF, text: string, y: number, margin: number): number {
  doc.setFont("Roboto", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 30, 60);
  doc.text(text, margin, y);
  doc.setDrawColor(30, 50, 90);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 1.5, margin + 50, y + 1.5);
  doc.setFont("Roboto", "normal");
  return y + 5;
}

function getY(doc: jsPDF, fallback: number, addIfMissing: number): number {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).lastAutoTable?.finalY ?? fallback + addIfMissing;
}
