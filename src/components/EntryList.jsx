import { useTransportContext } from '../context/TransportContext';
import { formatDisplayDate } from '../utils/date';

const EntryList = () => {
  const { entries } = useTransportContext();

  if (!entries.length) {
    return <p className="text-base text-slate-600">No entries yet. Add your first transport entry.</p>;
  }

  return (
    <ul className="space-y-3">
      {entries.map((entry) => (
        <li key={entry.id} className="rounded-lg border border-slate-200 p-4">
          <p className="text-lg font-semibold">{entry.vehicleNumber}</p>
          <p className="text-base">{entry.driverName}</p>
          <p className="text-base">{entry.route}</p>
          <p className="text-sm text-slate-500">{formatDisplayDate(entry.date)}</p>
          {entry.notes ? <p className="mt-2 text-sm text-slate-700">{entry.notes}</p> : null}
        </li>
      ))}
    </ul>
  );
};

export default EntryList;
