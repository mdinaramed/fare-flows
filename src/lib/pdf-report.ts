import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SavedCalculation } from "./train-data";
import { calcRevenue } from "./train-data";

export function generatePdfReport(calc: SavedCalculation, type: "full" | "cost" | "executive"): void {
  const doc = new jsPDF();
  const titles = {
    full: "Отчёт по экономической эффективности рейса",
    cost: "Отчёт по себестоимости рейса",
    executive: "Сводный отчёт для руководства",
  };
  let y = 15;

  // Header
  doc.setFontSize(16);
  doc.setTextColor(25, 50, 100);
  doc.text(titles[type], 14, y);
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Dата формирования: ${new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`, 14, y);
  y += 4;
  doc.text(`Dата расчёта: ${new Date(calc.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}`, 14, y);
  y += 8;

  doc.setDrawColor(180);
  doc.line(14, y, 196, y);
  y += 8;

  // Train info
  doc.setFontSize(11);
  doc.setTextColor(25, 50, 100);
  doc.text("1. Общая информация", 14, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    body: [
      ["Поезд", calc.trainNumber],
      ["Маршрут", calc.trainRoute],
      ["Время в пути", calc.trainInfo.duration],
      ["Расстояние", `${calc.trainInfo.distanceKm} км`],
      ["Вагонов", String(calc.productionMetrics.totalWagons)],
      ["Мест", String(calc.productionMetrics.totalSeats)],
      ["Вместимость", `${calc.productionMetrics.occupancyPercent}%`],
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14 },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = ((doc as any).lastAutoTable?.finalY ?? y + 50) + 8;

  if (type === "full") {
    doc.setFontSize(11);
    doc.setTextColor(25, 50, 100);
    doc.text("2. Производственные показатели", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Показатель", "Значение"]],
      body: [
        ["Пробег (тыс. ваг-км)", calc.productionMetrics.mileageThousKm.toFixed(1)],
        ["Местооборот (тыс. мест-км)", calc.productionMetrics.seatTurnover.toFixed(1)],
        ["Пассажирооборот (тыс. пасс-км)", calc.productionMetrics.passengerTurnover.toFixed(1)],
        ["Средняя дальность (км)", String(calc.productionMetrics.avgDistance)],
      ],
      theme: "grid",
      headStyles: { fillColor: [25, 50, 100], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = ((doc as any).lastAutoTable?.finalY ?? y + 40) + 8;
  }

  // Revenue
  const sectionNum = type === "full" ? "3" : "2";
  if (type === "full" || type === "executive") {
    doc.setFontSize(11);
    doc.setTextColor(25, 50, 100);
    doc.text(`${sectionNum}. Доходы`, 14, y);
    y += 6;

    const { ticketRevenue, totalRevenue } = calcRevenue(calc.revenue);
    const revenueRows: string[][] = [
      ["Доход от билетов", `${ticketRevenue.toLocaleString("ru-RU")} тг`],
    ];
    if (calc.revenue.subsidy > 0) {
      revenueRows.push(["Субсидии", `${calc.revenue.subsidy.toLocaleString("ru-RU")} тг`]);
    }
    revenueRows.push(["ИТОГО ДОХОДЫ", `${totalRevenue.toLocaleString("ru-RU")} тг`]);

    autoTable(doc, {
      startY: y,
      head: [["Статья", "Сумма"]],
      body: revenueRows,
      theme: "grid",
      headStyles: { fillColor: [40, 100, 40], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = ((doc as any).lastAutoTable?.finalY ?? y + 30) + 8;
  }

  // Expenses
  const expSectionNum = type === "full" ? "4" : type === "executive" ? "3" : "2";
  doc.setFontSize(11);
  doc.setTextColor(25, 50, 100);
  doc.text(`${expSectionNum}. Расходы`, 14, y);
  y += 6;

  const expenseRows = Object.entries(calc.results.byGroup).map(([group, amount]) => [
    group, `${amount.toLocaleString("ru-RU")} тг`,
  ]);
  expenseRows.push(["ИТОГО РАСХОДЫ", `${calc.results.total.toLocaleString("ru-RU")} тг`]);

  autoTable(doc, {
    startY: y,
    head: [["Категория", "Сумма"]],
    body: expenseRows,
    theme: "grid",
    headStyles: { fillColor: [140, 30, 30], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14 },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = ((doc as any).lastAutoTable?.finalY ?? y + 40) + 8;

  if (type === "cost") {
    autoTable(doc, {
      startY: y,
      head: [["Показатель", "Значение"]],
      body: [
        ["Себестоимость на вагон", `${Math.round(calc.results.costPerWagon).toLocaleString("ru-RU")} тг`],
        ["Себестоимость на пассажира", `${Math.round(calc.results.costPerPassenger).toLocaleString("ru-RU")} тг`],
      ],
      theme: "grid",
      headStyles: { fillColor: [25, 50, 100], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = ((doc as any).lastAutoTable?.finalY ?? y + 20) + 8;
  }

  // Financial result
  const resSectionNum = type === "full" ? "5" : type === "executive" ? "4" : "3";
  doc.setFontSize(11);
  doc.setTextColor(25, 50, 100);
  doc.text(`${resSectionNum}. Финансовый результат`, 14, y);
  y += 6;

  const isProfit = calc.financial.financialResult >= 0;

  autoTable(doc, {
    startY: y,
    body: [
      ["Доходы", `${calc.financial.totalRevenue.toLocaleString("ru-RU")} тг`],
      ["Расходы", `${calc.financial.totalExpenses.toLocaleString("ru-RU")} тг`],
      [isProfit ? "ПРИБЫЛЬ" : "УБЫТОК", `${calc.financial.financialResult.toLocaleString("ru-RU")} тг`],
      ["Рентабельность", `${calc.financial.profitMargin.toFixed(1)}%`],
    ],
    theme: "plain",
    styles: { fontSize: 10, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14 },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text("EcoPlan Hub — Система планирования расходов пассажирских поездов", 14, pageHeight - 8);

  doc.save(`EcoPlan_${calc.trainNumber}_${type}.pdf`);
}
