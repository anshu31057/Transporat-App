import PageCard from '../components/PageCard';

const ExportPage = () => {
  return (
    <PageCard title="Export Records">
      <div className="space-y-4 text-base">
        <p className="rounded-lg bg-slate-100 p-3">Generate a CSV export of approved transport entries.</p>
        <button
          type="button"
          className="h-12 w-full rounded-lg bg-blue-600 text-lg font-semibold text-white"
        >
          Export CSV
        </button>
      </div>
    </PageCard>
  );
};

export default ExportPage;
