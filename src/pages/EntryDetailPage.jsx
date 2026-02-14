import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import PageCard from '../components/PageCard';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { formatDisplayDate } from '../utils/date';
import { generateEntryPdf } from '../utils/pdf';

const EntryDetailPage = () => {
  const { entryId } = useParams();
  const { role } = useAuth();
  const [entry, setEntry] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'entries', entryId));
        if (snapshot.exists()) {
          setEntry({ id: snapshot.id, ...snapshot.data() });
          setStatus('ready');
        } else {
          setStatus('missing');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    fetchEntry();
  }, [entryId]);

  if (status === 'loading') {
    return <p className="text-base text-slate-600">Loading entry...</p>;
  }

  if (status === 'error') {
    return <p className="text-base text-red-600">Unable to load entry.</p>;
  }

  if (status === 'missing') {
    return <p className="text-base text-slate-600">Entry not found.</p>;
  }

  const pendingAmount = entry.balanceAmount ?? entry.totalAmount - entry.advanceAmount;

  return (
    <div className="space-y-4">
      <PageCard title="Entry Detail">
        <div className="space-y-3 text-base">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
            <span>{entry.date ? formatDisplayDate(entry.date) : 'Date'}</span>
            <span className="text-emerald-700">Pending ₹{pendingAmount || 0}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Party</span>
              <span className="font-semibold text-slate-900">{entry.partyName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Vehicle</span>
              <span className="font-semibold text-slate-900">{entry.vehicleNumber || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Driver</span>
              <span className="font-semibold text-slate-900">{entry.driverName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">From</span>
              <span className="font-semibold text-slate-900">{entry.pickup || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">To</span>
              <span className="font-semibold text-slate-900">{entry.drop || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Amount</span>
              <span className="font-semibold text-slate-900">₹{entry.totalAmount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Advance</span>
              <span className="font-semibold text-slate-900">₹{entry.advanceAmount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Balance</span>
              <span className="font-semibold text-slate-900">₹{pendingAmount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Notes</span>
              <span className="font-semibold text-slate-900">{entry.notes || '-'}</span>
            </div>
          </div>
        </div>
      </PageCard>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          to="/entries"
          className="flex h-12 items-center justify-center rounded-xl border border-slate-300 text-base font-semibold text-slate-700"
        >
          Back to Entries
        </Link>
        <button
          type="button"
          onClick={() => generateEntryPdf(entry)}
          className="flex h-12 items-center justify-center rounded-xl border border-emerald-700 text-base font-semibold text-emerald-700"
        >
          PDF
        </button>
        {role === 'admin' ? (
          <Link
            to={`/entries/edit/${entry.id}`}
            className="flex h-12 items-center justify-center rounded-xl bg-blue-700 text-base font-semibold text-white"
          >
            Edit Entry
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default EntryDetailPage;
