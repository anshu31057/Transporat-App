import { useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import PageCard from '../components/PageCard';
import { db } from '../firebase/firebase';
import { getCurrentIsoDate } from '../utils/date';

const ExportReportPage = () => {
  const [filters, setFilters] = useState({
    fromDate: getCurrentIsoDate(),
    toDate: getCurrentIsoDate()
  });
  const [isExporting, setIsExporting] = useState(false);

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const fetchEntries = async () => {
    const entriesRef = collection(db, 'entries');
    const constraints = [];

    if (filters.fromDate) {
      constraints.push(where('date', '>=', filters.fromDate));
    }

    if (filters.toDate) {
      constraints.push(where('date', '<=', filters.toDate));
    }

    constraints.push(orderBy('date', 'asc'));

    const entriesQuery = query(entriesRef, ...constraints);
    const snapshot = await getDocs(entriesQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const onExportPdf = async () => {
    setIsExporting(true);
    try {
      const entries = await fetchEntries();
      const doc = new jsPDF();
      const title = 'Transport Entry Report';
      doc.setFontSize(16);
      doc.text(title, 14, 18);
      doc.setFontSize(11);
      doc.text(`From: ${filters.fromDate || 'All'}  To: ${filters.toDate || 'All'}`, 14, 26);

      let y = 36;
      entries.forEach((entry, index) => {
        const totalAmount = Number(entry.totalAmount ?? 0);
        const advanceAmount = Number(entry.advance ?? entry.advanceAmount ?? 0);
        const pendingAmount = Number(entry.pending ?? entry.balanceAmount ?? totalAmount - advanceAmount);
        const line = `${index + 1}. ${entry.date || '-'} | ${entry.partyName || '-'} | ${
          entry.vehicleNumber || '-'
        } | Total ₹${totalAmount} | Pending ₹${pendingAmount}`;
        doc.text(line, 14, y);
        y += 8;
        if (y > 270) {
          doc.addPage();
          y = 18;
        }
      });

      doc.save('transport-entry-report.pdf');
    } catch (error) {
      console.error('Failed to export PDF', error);
      alert('Unable to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const onExportExcel = async () => {
    setIsExporting(true);
    try {
      const entries = await fetchEntries();
      const rows = entries.map((entry) => {
        const totalAmount = Number(entry.totalAmount ?? 0);
        const advanceAmount = Number(entry.advance ?? entry.advanceAmount ?? 0);
        const pendingAmount = Number(entry.pending ?? entry.balanceAmount ?? totalAmount - advanceAmount);
        return {
          Date: entry.date || '',
          Party: entry.partyName || '',
          Vehicle: entry.vehicleNumber || '',
          Total: totalAmount,
          Advance: advanceAmount,
          Pending: pendingAmount,
          Notes: entry.notes || ''
        };
      });
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Entries');
      XLSX.writeFile(workbook, 'transport-entry-report.xlsx');
    } catch (error) {
      console.error('Failed to export Excel', error);
      alert('Unable to export Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <PageCard title="Export Reports">
      <div className="space-y-6 text-base">
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            From Date
            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={onFilterChange}
              className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-base"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            To Date
            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={onFilterChange}
              className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-base"
            />
          </label>
        </div>

        <p className="rounded-lg bg-slate-100 p-3 text-sm text-slate-600">
          Export Firestore entries for the selected date range.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            className="h-12 w-full rounded-lg bg-blue-700 text-lg font-semibold text-white"
            onClick={onExportPdf}
            disabled={isExporting}
          >
            {isExporting ? 'EXPORTING...' : 'EXPORT PDF'}
          </button>
          <button
            type="button"
            className="h-12 w-full rounded-lg border border-blue-700 text-lg font-semibold text-blue-700"
            onClick={onExportExcel}
            disabled={isExporting}
          >
            EXPORT EXCEL
          </button>
        </div>
      </div>
    </PageCard>
  );
};

export default ExportReportPage;
