import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import PageCard from '../components/PageCard';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebase';

const getInsuranceStatus = (remainingDays) => {
  if (Number.isNaN(remainingDays)) {
    return 'Unknown';
  }
  if (remainingDays < 0) {
    return 'Expired';
  }
  if (remainingDays <= 15) {
    return 'Expiring Soon';
  }
  return 'Valid';
};

const TruckDetailPage = () => {
  const { truckId } = useParams();
  const { role } = useAuth();
  const [truck, setTruck] = useState(null);
  const [status, setStatus] = useState('loading');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTruck = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'trucks', truckId));
        if (snapshot.exists()) {
          setTruck({ id: snapshot.id, ...snapshot.data() });
          setStatus('ready');
        } else {
          setStatus('missing');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    fetchTruck();
  }, [truckId]);

  const remainingDays = useMemo(() => {
    if (!truck?.insuranceExpiryDate) {
      return NaN;
    }
    const expiry = new Date(truck.insuranceExpiryDate);
    const today = new Date();
    const diffMs = expiry.setHours(23, 59, 59, 999) - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [truck?.insuranceExpiryDate]);

  const insuranceStatus = getInsuranceStatus(remainingDays);

  const onChange = (event) => {
    const { name, value } = event.target;
    setTruck((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    if (role !== 'admin') {
      return;
    }
    setIsSaving(true);
    setMessage('');
    try {
      await updateDoc(doc(db, 'trucks', truckId), {
        truckNumber: truck.truckNumber,
        driverName: truck.driverName,
        driverContact: truck.driverContact,
        insuranceStartDate: truck.insuranceStartDate,
        insuranceExpiryDate: truck.insuranceExpiryDate,
        otherDocuments: truck.otherDocuments,
        updatedAt: serverTimestamp()
      });
      setMessage('Truck updated.');
    } catch (error) {
      setMessage('Unable to update truck.');
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading') {
    return <p className="text-base text-slate-600">Loading truck...</p>;
  }

  if (status === 'error') {
    return <p className="text-base text-red-600">Unable to load truck.</p>;
  }

  if (status === 'missing') {
    return <p className="text-base text-slate-600">Truck not found.</p>;
  }

  return (
    <div className="space-y-4">
      <PageCard title="Truck Detail">
        <div className="space-y-3 text-base">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-500">
            <span>{truck.truckNumber || 'Truck'}</span>
            <span className="text-emerald-700">{insuranceStatus}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Driver</span>
              <span className="font-semibold text-slate-900">{truck.driverName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact</span>
              <span className="font-semibold text-slate-900">{truck.driverContact || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Insurance Start</span>
              <span className="font-semibold text-slate-900">{truck.insuranceStartDate || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Insurance Expiry</span>
              <span className="font-semibold text-slate-900">{truck.insuranceExpiryDate || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining Days</span>
              <span className="font-semibold text-slate-900">
                {Number.isNaN(remainingDays) ? '-' : remainingDays}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Documents</span>
              <span className="font-semibold text-slate-900">{truck.otherDocuments || '-'}</span>
            </div>
          </div>
        </div>
      </PageCard>

      {role === 'admin' ? (
        <PageCard title="Update Truck">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-base font-semibold">Truck Number</span>
              <input
                type="text"
                name="truckNumber"
                value={truck.truckNumber || ''}
                onChange={onChange}
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-base font-semibold">Driver Name</span>
              <input
                type="text"
                name="driverName"
                value={truck.driverName || ''}
                onChange={onChange}
                className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-base font-semibold">Driver Contact</span>
              <input
                type="text"
                name="driverContact"
                value={truck.driverContact || ''}
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
                  value={truck.insuranceStartDate || ''}
                  onChange={onChange}
                  className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-base font-semibold">Insurance Expiry</span>
                <input
                  type="date"
                  name="insuranceExpiryDate"
                  value={truck.insuranceExpiryDate || ''}
                  onChange={onChange}
                  className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
                />
              </label>
            </div>
            <label className="block">
              <span className="mb-1 block text-base font-semibold">Other Documents</span>
              <textarea
                name="otherDocuments"
                value={truck.otherDocuments || ''}
                onChange={onChange}
                rows={3}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-base"
              />
            </label>
            {message ? <p className="text-sm font-semibold text-emerald-700">{message}</p> : null}
            <button
              type="button"
              onClick={onSave}
              className="h-12 w-full rounded-lg bg-blue-700 text-lg font-semibold text-white"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Update Truck'}
            </button>
          </div>
        </PageCard>
      ) : null}

      <Link
        to="/trucks"
        className="flex h-12 items-center justify-center rounded-xl border border-slate-300 text-base font-semibold text-slate-700"
      >
        Back to Trucks
      </Link>
    </div>
  );
};

export default TruckDetailPage;
