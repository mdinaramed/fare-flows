import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { SavedCalculation } from "./train-data";

export function generatePdfReport(calc: SavedCalculation, type: "full" | "cost" | "executive"): void {
  const doc = new jsPDF();
  const titles = { full: "Отчёт по рейсу", cost: "Себестоимость рейса", executive: "Отчёт для руководства" };
  let y = 15;

  doc.setFontSize(18);
  doc.setTextColor(30, 60, 120);
  doc.text("EcoPlan Hub", 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(titles[type], 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.text(`Data: ${new Date(calc.date).toLocaleDateString("ru-RU")}`, 14, y);
  y += 10;

  doc.setDrawColor(200);
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.text(`Train #${calc.trainNumber}`, 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(`${calc.trainRoute}`, 14, y);
  y += 5;
  doc.text(`${calc.trainInfo.duration} | ${calc.trainInfo.distanceKm} km | ${calc.productionMetrics.totalWagons} wagons`, 14, y);
  y += 10;

  if (type === "full") {
    doc.setFontSize(11);
    doc.setTextColor(30, 60, 120);
    doc.text("Production Metrics", 14, y);
    y += 6;

    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Wagons", String(calc.productionMetrics.totalWagons)],
        ["Seats", String(calc.productionMetrics.totalSeats)],
        ["Mileage (thous. wag-km)", calc.productionMetrics.mileageThousKm.toFixed(1)],
        ["Seat turnover (thous.)", calc.productionMetrics.seatTurnover.toFixed(1)],
        ["Occupancy", `${calc.productionMetrics.occupancyPercent}%`],
        ["Passenger turnover", calc.productionMetrics.passengerTurnover.toFixed(1)],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 60, 120], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = ((doc as any).lastAutoTable?.finalY ?? y + 50) + 10;
  }

  if (type === "full" || type === "executive") {
    doc.setFontSize(11);
    doc.setTextColor(30, 60, 120);
    doc.text("Revenue", 14, y);
    y += 6;

    const revenueRows: string[][] = [
      ["Tickets", `${(calc.revenue.ticketPrice * calc.revenue.passengers).toLocaleString("ru-RU")} tg`],
      ["Linen", `${(calc.revenue.linenPrice * calc.revenue.linenPassengers).toLocaleString("ru-RU")} tg`],
    ];
    if (calc.revenue.subsidy > 0) {
      revenueRows.push(["Subsidies", `${calc.revenue.subsidy.toLocaleString("ru-RU")} tg`]);
    }
    revenueRows.push(["TOTAL REVENUE", `${calc.financial.totalRevenue.toLocaleString("ru-RU")} tg`]);

    autoTable(doc, {
      startY: y,
      head: [["Item", "Amount"]],
      body: revenueRows,
      theme: "grid",
      headStyles: { fillColor: [34, 139, 34], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = ((doc as any).lastAutoTable?.finalY ?? y + 40) + 10;
  }

  doc.setFontSize(11);
  doc.setTextColor(30, 60, 120);
  doc.text("Expenses", 14, y);
  y += 6;

  const expenseRows = Object.entries(calc.results.byGroup).map(([group, amount]) => [
    group, `${amount.toLocaleString("ru-RU")} tg`,
  ]);
  expenseRows.push(["TOTAL EXPENSES", `${calc.results.total.toLocaleString("ru-RU")} tg`]);

  autoTable(doc, {
    startY: y,
    head: [["Category", "Amount"]],
    body: expenseRows,
    theme: "grid",
    headStyles: { fillColor: [178, 34, 34], fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14 },
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = ((doc as any).lastAutoTable?.finalY ?? y + 40) + 10;

  if (type === "cost") {
    autoTable(doc, {
      startY: y,
      head: [["Metric", "Value"]],
      body: [
        ["Cost per wagon", `${Math.round(calc.results.costPerWagon).toLocaleString("ru-RU")} tg`],
        ["Cost per passenger", `${Math.round(calc.results.costPerPassenger).toLocaleString("ru-RU")} tg`],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 60, 120], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 14 },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = ((doc as any).lastAutoTable?.finalY ?? y + 30) + 10;
  }

  const isProfit = calc.financial.financialResult >= 0;
  doc.setFontSize(12);
  doc.setTextColor(isProfit ? 34 : 178, isProfit ? 139 : 34, isProfit ? 34 : 34);
  doc.text(`Financial Result: ${calc.financial.financialResult.toLocaleString("ru-RU")} tg`, 14, y);
  y += 6;
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Margin: ${calc.financial.profitMargin.toFixed(1)}%`, 14, y);

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("EcoPlan Hub", 14, pageHeight - 10);

  doc.save(`EcoPlan_${calc.trainNumber}_${type}.pdf`);
}
