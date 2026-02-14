import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatCurrency = (value) => `₹${Number(value ?? 0)}`;

export const generateEntriesReportPdf = ({ entries, fromDate, toDate }) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const generatedAt = new Date().toLocaleString('en-IN');

  doc.setFontSize(16);
  doc.text('Transport Entry Report', 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`Date Range: ${fromDate || 'All'} - ${toDate || 'All'}`, 14, 26);
  doc.text(`Generated: ${generatedAt}`, 14, 32);

  const rows = entries.map((entry) => {
    const totalAmount = Number(entry.totalAmount ?? 0);
    const advanceAmount = Number(entry.advance ?? entry.advanceAmount ?? 0);
    const pendingAmount = Number(entry.pending ?? entry.balanceAmount ?? totalAmount - advanceAmount);
    return [
      entry.date || '-',
      entry.partyName || '-',
      entry.vehicleNumber || '-',
      formatCurrency(totalAmount),
      formatCurrency(advanceAmount),
      formatCurrency(pendingAmount)
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [['Date', 'Party Name', 'Vehicle Number', 'Total Amount', 'Advance', 'Pending']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 2.5,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 55 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 20, halign: 'right' },
      5: { cellWidth: 20, halign: 'right' }
    }
  });

  doc.save('transport-entry-report.pdf');
};

export const generateEntryPdf = (entry) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pendingAmount =
    entry.pending ?? entry.balanceAmount ?? Number(entry.totalAmount ?? 0) - Number(entry.advanceAmount ?? 0);

  doc.setFontSize(16);
  doc.text('Transport Entry', 14, 18);
  doc.setFontSize(11);
  doc.setTextColor(90);
  doc.text(`Date: ${entry.date || '-'}`, 14, 26);

  const rows = [
    ['Party Name', entry.partyName || '-'],
    ['Vehicle Number', entry.vehicleNumber || '-'],
    ['Driver Name', entry.driverName || '-'],
    ['Route', `${entry.pickup || '-'} → ${entry.drop || '-'}`],
    ['Total Amount', formatCurrency(entry.totalAmount ?? 0)],
    ['Advance', formatCurrency(entry.advanceAmount ?? 0)],
    ['Pending', formatCurrency(pendingAmount)],
    ['Notes', entry.notes || '-']
  ];

  autoTable(doc, {
    startY: 34,
    head: [['Field', 'Value']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 11,
      cellPadding: 3,
      overflow: 'linebreak'
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 120 }
    }
  });

  doc.save(`entry-${entry.id || 'detail'}.pdf`);
};
