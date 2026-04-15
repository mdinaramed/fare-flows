import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SavedCalculation } from "./train-data";

export function generatePdfReport(calc: SavedCalculation, type: "full" | "cost" | "executive"): void {
  const doc = new jsPDF();
  const titles = { full: "Отчёт по рейсу", cost: "Себестоимость рейса", executive: "Отчёт для руководства" };
  let y = 15;

  // Header
  doc.setFontSize(18);
  doc.setTextColor(30, 60, 120);
  doc.text("EcoPlan Hub", 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(titles[type], 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.text(`Дата: ${new Date(calc.date).toLocaleDateString("ru-RU")}`, 14, y);
  y += 10;

  // Separator
  doc.setDrawColor(200);
  doc.line(14, y, 196, y);
  y += 8;

  // Train info
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Поезд №${calc.trainNumber}`, 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`Маршрут: ${calc.trainRoute}`, 14, y);
  y += 5;
  doc.text(`Время в пути: ${calc.trainInfo.duration} | Расстояние: ${calc.trainInfo.distanceKm} км | Вагонов: ${calc.productionMetrics.totalWagons}`, 14, y);
  y += 10;

  // Production metrics (full only)
  if (type === "full") {
    doc.setFontSize(11);
    doc.setTextColor(30, 60, 120);
    doc.text("Производственные показатели", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Показатель", "Значение"]],
      body: [
        ["Вагонов", String(calc.productionMetrics.totalWagons)],
        ["Мест", String(calc.productionMetrics.totalSeats)],
        ["Пробег (тыс. ваг.км)", calc.productionMetrics.mileageThousKm.toFixed(1)],
        ["Местооборот (тыс. мест.км)", calc.productionMetrics.seatTurnover.toFixed(1)],
        ["Вместимость", `${calc.productionMetrics.occupancyPercent}%`],
        ["Пассажирооборот", calc.productionMetrics.passengerTurnover.toFixed(1)],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 60, 120], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });
    y = (doc as unknown as Record<string, number>).lastAutoTable?.finalY + 10 || y + 50;
  }

  // Revenue (full & executive)
  if (type === "full" || type === "executive") {
    doc.setFontSize(11);
    doc.setTextColor(30, 60, 120);
    doc.text("Доходы", 14, y);
    y += 6;

    const revenueRows = [
      ["Билеты", `${(calc.revenue.ticketPrice * calc.revenue.passengers).toLocaleString("ru-RU")} тг`],
      ["Бельё", `${(calc.revenue.linenPrice * calc.revenue.linenPassengers).toLocaleString("ru-RU")} тг`],
    ];
    if (calc.revenue.subsidy > 0) {
      revenueRows.push(["Субсидии", `${calc.revenue.subsidy.toLocaleString("ru-RU")} тг`]);
    }
    revenueRows.push(["ИТОГО ДОХОДЫ", `${calc.financial.totalRevenue.toLocaleString("ru-RU")} тг`]);

    autoTable(doc, {
      startY: y,
      head: [["Статья", "Сумма"]],
      body: revenueRows,
      theme: "grid",
      headStyles: { fillColor: [34, 139, 34], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });
    y = (doc as unknown as Record<string, number>).lastAutoTable?.finalY + 10 || y + 40;
  }

  // Expenses
  doc.setFontSize(11);
  doc.setTextColor(30, 60, 120);
  doc.text("Расходы", 14, y);
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
    headStyles: { fillColor: [178, 34, 34], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14 },
  });
  y = (doc as unknown as Record<string, number>).lastAutoTable?.finalY + 10 || y + 40;

  // Cost per unit (cost report)
  if (type === "cost") {
    autoTable(doc, {
      startY: y,
      head: [["Показатель", "Значение"]],
      body: [
        ["Себестоимость на вагон", `${Math.round(calc.results.costPerWagon).toLocaleString("ru-RU")} тг`],
        ["Себестоимость на пассажира", `${Math.round(calc.results.costPerPassenger).toLocaleString("ru-RU")} тг`],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 60, 120], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });
    y = (doc as unknown as Record<string, number>).lastAutoTable?.finalY + 10 || y + 30;
  }

  // Financial result
  const isProfit = calc.financial.financialResult >= 0;
  doc.setFontSize(12);
  doc.setTextColor(isProfit ? 34 : 178, isProfit ? 139 : 34, isProfit ? 34 : 34);
  doc.text(`Финансовый результат: ${calc.financial.financialResult.toLocaleString("ru-RU")} тг`, 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Маржа: ${calc.financial.profitMargin.toFixed(1)}%`, 14, y);

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("EcoPlan Hub — Система планирования расходов пассажирских поездов", 14, pageHeight - 10);

  doc.save(`EcoPlan_${calc.trainNumber}_${type}_${new Date(calc.date).toLocaleDateString("ru-RU").replace(/\./g, "-")}.pdf`);
}
