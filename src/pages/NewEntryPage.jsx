import { useMemo, useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import PageCard from '../components/PageCard';
import { db } from '../firebase/firebase';
import { getCurrentIsoDate } from '../utils/date';

const NewEntryPage = () => {
  const [formData, setFormData] = useState({
    date: getCurrentIsoDate(),
    partyName: '',
    vehicleNumber: '',
    driverName: '',
    pickup: '',
    drop: '',
    totalAmount: '',
    advanceAmount: '',
    notes: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');

  const balanceAmount = useMemo(() => {
    const total = Number(formData.totalAmount || 0);
    const advance = Number(formData.advanceAmount || 0);
    const balance = total - advance;
    return Number.isNaN(balance) ? 0 : Math.max(balance, 0);
  }, [formData.advanceAmount, formData.totalAmount]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus('');
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'entries'), {
        date: formData.date,
        partyName: formData.partyName,
        vehicleNumber: formData.vehicleNumber,
        driverName: formData.driverName,
        pickup: formData.pickup,
        drop: formData.drop,
        totalAmount: Number(formData.totalAmount || 0),
        advanceAmount: Number(formData.advanceAmount || 0),
        balanceAmount,
        notes: formData.notes,
        createdAt: serverTimestamp()
      });
      setStatus('Entry saved.');
      setFormData({
        date: getCurrentIsoDate(),
        partyName: '',
        vehicleNumber: '',
        driverName: '',
        pickup: '',
        drop: '',
        totalAmount: '',
        advanceAmount: '',
        notes: ''
      });
    } catch (error) {
      setStatus('Unable to save entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageCard title="Add Transport Entry">
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Date</span>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={onChange}
            className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Party Name</span>
          <input
            type="text"
            name="partyName"
            value={formData.partyName}
            onChange={onChange}
            placeholder="Client or Company"
            className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Vehicle Number</span>
          <input
            type="text"
            name="vehicleNumber"
            value={formData.vehicleNumber}
            onChange={onChange}
            placeholder="TRK-102"
            className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Driver Name</span>
          <input
            type="text"
            name="driverName"
            value={formData.driverName}
            onChange={onChange}
            placeholder="Driver"
            className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
            required
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-base font-semibold">From (Pickup)</span>
            <input
              type="text"
              name="pickup"
              value={formData.pickup}
              onChange={onChange}
              placeholder="Pickup location"
              className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-base font-semibold">To (Drop)</span>
            <input
              type="text"
              name="drop"
              value={formData.drop}
              onChange={onChange}
              placeholder="Drop location"
              className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              required
            />
          </label>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-base font-semibold">Total Amount</span>
            <input
              type="number"
              inputMode="numeric"
              name="totalAmount"
              value={formData.totalAmount}
              onChange={onChange}
              placeholder="0"
              className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-base font-semibold">Advance Amount</span>
            <input
              type="number"
              inputMode="numeric"
              name="advanceAmount"
              value={formData.advanceAmount}
              onChange={onChange}
              placeholder="0"
              className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Balance</span>
          <input
            type="text"
            value={balanceAmount}
            readOnly
            className="h-12 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 text-base"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-base font-semibold">Notes</span>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={onChange}
            rows={4}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
            placeholder="Optional details"
          />
        </label>
        {status ? <p className="text-sm font-semibold text-emerald-700">{status}</p> : null}
        <button
          type="submit"
          className="h-12 w-full rounded-lg bg-blue-700 text-lg font-semibold text-white"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Entry'}
        </button>
      </form>
    </PageCard>
  );
};

export default NewEntryPage;
