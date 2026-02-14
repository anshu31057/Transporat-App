import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import PageCard from '../components/PageCard';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase/firebase';

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

const documentFields = [
  { key: 'insuranceImageUrl', label: 'Insurance Image' },
  { key: 'rcImageUrl', label: 'RC Image' },
  { key: 'otherDocumentUrl', label: 'Other Document' }
];

const TruckDetailPage = () => {
  const { truckId } = useParams();
  const { role } = useAuth();
  const [truck, setTruck] = useState(null);
  const [status, setStatus] = useState('loading');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    const fetchTruck = async () => {
      try {
        const snapshot = await getDoc(doc(db, 'trucks', truckId));
        if (snapshot.exists()) {
          const truckData = snapshot.data();
          setTruck({
            id: snapshot.id,
            ...truckData,
            documents: {
              insuranceImageUrl: truckData.documents?.insuranceImageUrl || '',
              rcImageUrl: truckData.documents?.rcImageUrl || '',
              otherDocumentUrl: truckData.documents?.otherDocumentUrl || ''
            }
          });
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
        truckNumber: truck.truckNumber.trim(),
        driverName: truck.driverName.trim(),
        driverContact: (truck.driverContact || '').trim(),
        insuranceStartDate: truck.insuranceStartDate,
        insuranceExpiryDate: truck.insuranceExpiryDate,
        documents: truck.documents || {
          insuranceImageUrl: '',
          rcImageUrl: '',
          otherDocumentUrl: ''
        },
        updatedAt: serverTimestamp()
      });
      setMessage('Truck updated.');
    } catch (error) {
      setMessage('Unable to update truck.');
    } finally {
      setIsSaving(false);
    }
  };

  const onUploadDocument = async (event, fieldKey) => {
    const file = event.target.files?.[0];
    if (!file || role !== 'admin') {
      return;
    }

    setUploadingKey(fieldKey);
    setMessage('');
    try {
      const storageRef = ref(storage, `trucks/${truckId}/${fieldKey}-${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);

      const updatedDocuments = {
        insuranceImageUrl: truck.documents?.insuranceImageUrl || '',
        rcImageUrl: truck.documents?.rcImageUrl || '',
        otherDocumentUrl: truck.documents?.otherDocumentUrl || '',
        [fieldKey]: downloadUrl
      };

      await updateDoc(doc(db, 'trucks', truckId), {
        documents: updatedDocuments,
        updatedAt: serverTimestamp()
      });

      setTruck((prev) => ({ ...prev, documents: updatedDocuments }));
      setMessage('Document uploaded successfully.');
    } catch (error) {
      setMessage('Unable to upload document. Please try again.');
    } finally {
      setUploadingKey('');
      event.target.value = '';
    }
  };

  if (status === 'loading') {
    return <p className="text-base text-slate-600">Loading truck...</p>;
  }

  if (status === 'error') {
    return <p className="text-base text-red-600">Unable to load truck details.</p>;
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
          </div>
        </div>
      </PageCard>

      <PageCard title="Documents">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {documentFields.map((documentField) => {
            const imageUrl = truck.documents?.[documentField.key] || '';
            const isUploading = uploadingKey === documentField.key;
            return (
              <div key={documentField.key} className="space-y-2 rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-700">{documentField.label}</p>
                {imageUrl ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(imageUrl)}
                    className="block w-full overflow-hidden rounded-lg border border-slate-200"
                  >
                    <img src={imageUrl} alt={documentField.label} className="h-32 w-full object-cover" />
                  </button>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500">
                    No image uploaded
                  </div>
                )}
                {role === 'admin' ? (
                  <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-lg border border-blue-700 text-sm font-semibold text-blue-700">
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => onUploadDocument(event, documentField.key)}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                ) : null}
              </div>
            );
          })}
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

      {previewImage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white">
            <img src={previewImage} alt="Truck document" className="max-h-[70vh] w-full object-contain" />
            <button
              type="button"
              onClick={() => setPreviewImage('')}
              className="h-12 w-full border-t border-slate-200 text-base font-semibold text-slate-700"
            >
              Close
            </button>
          </div>
        </div>
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
