import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import PageCard from '../components/PageCard';
import { db } from '../firebase/firebase';
import { formatDisplayDate, getCurrentIsoDate } from '../utils/date';

const EntryListPage = () => {
  const [entries, setEntries] = useState([]);
  const [filters, setFilters] = useState({
    date: getCurrentIsoDate(),
    party: ''
  });
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const entriesQuery = query(collection(db, 'entries'), orderBy('date', 'desc'));
        const snapshot = await getDocs(entriesQuery);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEntries(data);
        setStatus('ready');
      } catch (error) {
        setStatus('error');
      }
    };

    fetchEntries();
  }, []);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesDate = filters.date ? entry.date === filters.date : true;
      const partyValue = entry.partyName || '';
      const matchesParty = filters.party
        ? partyValue.toLowerCase().includes(filters.party.toLowerCase())
        : true;
      return matchesDate && matchesParty;
    });
  }, [entries, filters]);

  const onFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      <PageCard title="Entry Records">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-base font-semibold">Date</span>
            <input
              type="date"
              name="date"
              value={filters.date}
              onChange={onFilterChange}
              className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-base font-semibold">Party Search</span>
            <input
              type="text"
              name="party"
              value={filters.party}
              onChange={onFilterChange}
              placeholder="Search by party name"
              className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
            />
          </label>
        </div>
      </PageCard>

      <PageCard title="Daily Diary">
        {status === 'loading' ? <p className="text-base text-slate-600">Loading entries...</p> : null}
        {status === 'error' ? (
          <p className="text-base text-red-600">Unable to load entries.</p>
        ) : null}
        {status === 'ready' && filteredEntries.length === 0 ? (
          <p className="text-base text-slate-600">No entries found for the selected filters.</p>
        ) : null}
        {filteredEntries.length ? (
          <ul className="mt-3 space-y-3">
            {filteredEntries.map((entry) => {
              const pendingAmount = entry.balanceAmount ?? entry.totalAmount - entry.advanceAmount;
              return (
                <li key={entry.id}>
                  <Link
                    to={`/entries/${entry.id}`}
                    className="block rounded-lg border border-slate-200 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-500">
                        {entry.date ? formatDisplayDate(entry.date) : 'Date'}
                      </p>
                      <p className="text-sm font-semibold text-emerald-700">Pending ₹{pendingAmount || 0}</p>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {entry.partyName || 'Party'}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-slate-600">
                      <span>{entry.vehicleNumber || 'Vehicle'}</span>
                      <span className="text-slate-300">•</span>
                      <span>Total ₹{entry.totalAmount || 0}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : null}
      </PageCard>
    </div>
  );
};

export default EntryListPage;
