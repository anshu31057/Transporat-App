import { Link } from 'react-router-dom';
import PageCard from '../components/PageCard';
import { useTransportContext } from '../context/TransportContext';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { entries } = useTransportContext();
  const { logout } = useAuth();
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Today</p>
          <p className="text-lg font-bold text-slate-900">{todayLabel}</p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="h-10 rounded-lg border border-emerald-700 px-4 text-sm font-semibold text-emerald-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <PageCard title="Trips Today">
          <p className="text-4xl font-bold text-slate-900">{entries.length}</p>
        </PageCard>
        <PageCard title="Total Amount">
          <p className="text-4xl font-bold text-slate-900">₹0</p>
        </PageCard>
        <PageCard title="Advance">
          <p className="text-4xl font-bold text-slate-900">₹0</p>
        </PageCard>
        <PageCard title="Pending">
          <p className="text-4xl font-bold text-slate-900">₹0</p>
        </PageCard>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          to="/entries"
          className="flex h-12 items-center justify-center rounded-xl bg-blue-700 text-lg font-semibold text-white"
        >
          View Entries
        </Link>
        <Link
          to="/export"
          className="flex h-12 items-center justify-center rounded-xl bg-emerald-700 text-lg font-semibold text-white"
        >
          Export Report
        </Link>
      </div>
    </div>
  );
};

export default DashboardPage;
