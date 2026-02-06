import PageCard from '../components/PageCard';

const SettingsPage = () => {
  return (
    <PageCard title="Settings">
      <div className="space-y-3 text-base">
        <p className="rounded-lg bg-slate-100 p-3">Firebase project is ready to connect from configuration.</p>
        <p className="rounded-lg bg-slate-100 p-3">User and permission controls can be added here.</p>
      </div>
    </PageCard>
  );
};

export default SettingsPage;
