import PageCard from '../components/PageCard';
import { useTransportContext } from '../context/TransportContext';

const DashboardPage = () => {
  const { entries } = useTransportContext();
  const todayEntries = entries.filter((entry) => entry.date === new Date().toISOString().slice(0, 10)).length;

  return (
    <div className="space-y-4">
      <PageCard title="Today Summary">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-slate-100 p-4">
            <p className="text-sm text-slate-600">Total Entries</p>
            <p className="text-3xl font-bold">{entries.length}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-4">
            <p className="text-sm text-slate-600">Today</p>
            <p className="text-3xl font-bold">{todayEntries}</p>
          </div>
          <div className="rounded-lg bg-slate-100 p-4">
            <p className="text-sm text-slate-600">Status</p>
            <p className="text-2xl font-bold text-green-700">Active</p>
          </div>
        </div>
      </PageCard>
    </div>
  );
};

export default DashboardPage;
