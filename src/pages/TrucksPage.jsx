import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import PageCard from '../components/PageCard';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';
import { getCurrentIsoDate } from '../utils/date';

const TrucksPage = () => {
  const { role } = useAuth();
  const [trucks, setTrucks] = useState([]);
  const [status, setStatus] = useState('loading');
  const [formData, setFormData] = useState({
    truckNumber: '',
    driverName: '',
    driverContact: '',
    insuranceStartDate: getCurrentIsoDate(),
    insuranceExpiryDate: getCurrentIsoDate(),
    otherDocuments: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const trucksQuery = query(collection(db, 'trucks'), orderBy('truckNumber', 'asc'));
    const unsubscribe = onSnapshot(
      trucksQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTrucks(data);
        setStatus('ready');
      },
      () => {
        setStatus('error');
      }
    );

    return () => unsubscribe();
  }, []);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const remainingDays = useMemo(() => {
    const expiry = new Date(formData.insuranceExpiryDate);
    const today = new Date();
    const diffMs = expiry.setHours(23, 59, 59, 999) - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [formData.insuranceExpiryDate]);

  const onSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    if (role !== 'admin') {
      setMessage('Only admin users can add trucks.');
      return;
    }
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'trucks'), {
        truckNumber: formData.truckNumber,
        driverName: formData.driverName,
        driverContact: formData.driverContact,
        insuranceStartDate: formData.insuranceStartDate,
        insuranceExpiryDate: formData.insuranceExpiryDate,
        otherDocuments: formData.otherDocuments,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setMessage('Truck saved.');
      setFormData({
        truckNumber: '',
        driverName: '',
        driverContact: '',
        insuranceStartDate: getCurrentIsoDate(),
        insuranceExpiryDate: getCurrentIsoDate(),
        otherDocuments: ''
      });
    } catch (error) {
      setMessage('Unable to save truck. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {role === 'admin' ? (
        <PageCard title="Add Truck">
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-base font-semibold">Truck Number</span>
              <input
                type="text"
                name="truckNumber"
                value={formData.truckNumber}
                onChange={onChange}
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
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-base font-semibold">Driver Contact (Optional)</span>
              <input
                type="text"
                name="driverContact"
                value={formData.driverContact}
                onChange={onChange}
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
            </label>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-base font-semibold">Insurance Start</span>
                <input
                  type="date"
                  name="insuranceStartDate"
                  value={formData.insuranceStartDate}
                  onChange={onChange}
                  className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-base font-semibold">Insurance Expiry</span>
                <input
                  type="date"
                  name="insuranceExpiryDate"
                  value={formData.insuranceExpiryDate}
                  onChange={onChange}
                  className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-base font-semibold">Remaining Days</span>
              <input
                type="text"
                value={Number.isNaN(remainingDays) ? '0' : remainingDays}
                readOnly
                className="h-12 w-full rounded-lg border border-slate-300 bg-slate-100 px-3 text-base"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-base font-semibold">Other Documents</span>
              <textarea
                name="otherDocuments"
                value={formData.otherDocuments}
                onChange={onChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
              />
            </label>
            {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
            <button
              type="submit"
              className="h-12 w-full rounded-lg bg-blue-700 text-lg font-semibold text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Truck'}
            </button>
          </form>
        </PageCard>
      ) : null}

      <PageCard title="Trucks">
        {status === 'loading' ? <p className="text-base text-slate-600">Loading trucks...</p> : null}
        {status === 'error' ? (
          <p className="text-base text-red-600">Unable to load trucks.</p>
        ) : null}
        {status === 'ready' && trucks.length === 0 ? (
          <p className="text-base text-slate-600">No trucks recorded yet.</p>
        ) : null}
        {trucks.length ? (
          <ul className="mt-3 space-y-3">
            {trucks.map((truck) => (
              <li key={truck.id}>
                <Link
                  to={`/trucks/${truck.id}`}
                  className="block rounded-lg border border-slate-200 p-4"
                >
                  <p className="text-sm font-semibold uppercase text-slate-500">
                    {truck.truckNumber || 'Truck'}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {truck.driverName || 'Driver'}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Insurance expires: {truck.insuranceExpiryDate || '-'}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </PageCard>
    </div>
  );
};

export default TrucksPage;
