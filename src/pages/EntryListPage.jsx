import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
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
  const [isPartyOpen, setIsPartyOpen] = useState(false);
  const partyRef = useRef(null);

  useEffect(() => {
    const entriesQuery = query(collection(db, 'entries'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(
      entriesQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEntries(data);
        setStatus('ready');
      },
      () => {
        setStatus('error');
      }
    );

    return () => unsubscribe();
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

  const partyOptions = useMemo(() => {
    const unique = new Set(
      entries
        .map((entry) => entry.partyName)
        .filter((partyName) => typeof partyName === 'string' && partyName.trim() !== '')
    );
    const queryValue = filters.party.trim().toLowerCase();
    return Array.from(unique).filter((partyName) =>
      queryValue ? partyName.toLowerCase().includes(queryValue) : true
    );
  }, [entries, filters.party]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (partyRef.current && !partyRef.current.contains(event.target)) {
        setIsPartyOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className="relative" ref={partyRef}>
              <input
                type="text"
                name="party"
                value={filters.party}
                onChange={(event) => {
                  onFilterChange(event);
                  setIsPartyOpen(true);
                }}
                onFocus={() => setIsPartyOpen(true)}
                placeholder="Search by party name"
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
              {isPartyOpen && partyOptions.length > 0 ? (
                <div className="absolute z-10 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-md">
                  <ul className="max-h-48 overflow-y-auto py-1 text-sm text-slate-700">
                    {partyOptions.map((partyName) => (
                      <li key={partyName}>
                        <button
                          type="button"
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, party: partyName }));
                            setIsPartyOpen(false);
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-emerald-50"
                        >
                          {partyName}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
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
