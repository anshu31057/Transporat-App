import { useState } from 'react';
import { useTransportContext } from '../context/TransportContext';
import { getCurrentIsoDate } from '../utils/date';

const EntryForm = () => {
  const { addEntry } = useTransportContext();
  const [formData, setFormData] = useState({
    date: getCurrentIsoDate(),
    vehicleNumber: '',
    driverName: '',
    route: '',
    notes: ''
  });

  const onChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    addEntry(formData);
    setFormData({
      date: getCurrentIsoDate(),
      vehicleNumber: '',
      driverName: '',
      route: '',
      notes: ''
    });
  };

  return (
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
      <label className="block">
        <span className="mb-1 block text-base font-semibold">Route</span>
        <input
          type="text"
          name="route"
          value={formData.route}
          onChange={onChange}
          placeholder="City A to City B"
          className="h-12 w-full rounded-lg border border-slate-300 px-3 text-base"
          required
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
      <button
        type="submit"
        className="h-12 w-full rounded-lg bg-blue-600 text-lg font-semibold text-white"
      >
        Save Entry
      </button>
    </form>
  );
};

export default EntryForm;
