const PageCard = ({ title, children }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-sectionTitle">{title}</h2>
      {children}
    </section>
  );
};

export default PageCard;
