import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import PageCard from '../components/PageCard';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { getCurrentIsoDate } from '../utils/date';

const DashboardPage = () => {
  const [entries, setEntries] = useState([]);
  const { logout } = useAuth();
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const todayDate = getCurrentIsoDate();

  useEffect(() => {
    const entriesQuery = query(collection(db, 'entries'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(entriesQuery, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEntries(data);
    });

    return () => unsubscribe();
  }, []);

  const totals = useMemo(() => {
    return entries.filter((entry) => entry.date === todayDate).reduce(
      (accumulator, entry) => {
        const totalAmount = Number(entry.totalAmount ?? 0);
        const advanceAmount = Number(entry.advance ?? entry.advanceAmount ?? 0);
        const pendingAmount = Number(entry.pending ?? entry.balanceAmount ?? totalAmount - advanceAmount);
        return {
          trips: accumulator.trips + 1,
          totalAmount: accumulator.totalAmount + (Number.isNaN(totalAmount) ? 0 : totalAmount),
          advance: accumulator.advance + (Number.isNaN(advanceAmount) ? 0 : advanceAmount),
          pending: accumulator.pending + (Number.isNaN(pendingAmount) ? 0 : pendingAmount)
        };
      },
      { trips: 0, totalAmount: 0, advance: 0, pending: 0 }
    );
  }, [entries, todayDate]);

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
          <p className="text-4xl font-bold text-slate-900">{totals.trips}</p>
        </PageCard>
        <PageCard title="Total Amount">
          <p className="text-4xl font-bold text-slate-900">₹{totals.totalAmount}</p>
        </PageCard>
        <PageCard title="Advance">
          <p className="text-4xl font-bold text-slate-900">₹{totals.advance}</p>
        </PageCard>
        <PageCard title="Pending">
          <p className="text-4xl font-bold text-slate-900">₹{totals.pending}</p>
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
