import PageCard from '../components/PageCard';

const ExportReportPage = () => {
  return (
    <PageCard title="Export Reports">
      <div className="space-y-6 text-base">
        <div className="space-y-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            From Date
            <input
              type="date"
              className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-base"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
            To Date
            <input
              type="date"
              className="h-12 rounded-lg border border-slate-200 bg-white px-4 text-base"
            />
          </label>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            className="h-12 w-full rounded-lg bg-blue-700 text-lg font-semibold text-white"
          >
            Export PDF
          </button>
          <button
            type="button"
            className="h-12 w-full rounded-lg border border-blue-700 text-lg font-semibold text-blue-700"
          >
            Export Excel
          </button>
        </div>
      </div>
    </PageCard>
  );
};

export default ExportReportPage;
