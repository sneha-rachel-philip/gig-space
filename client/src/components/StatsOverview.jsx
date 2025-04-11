const StatsOverview = ({ stats }) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {[
          { label: 'Active Projects', value: stats.active },
          { label: 'Completed Projects', value: stats.completed },
          { label: 'Pending Proposals', value: stats.proposals },
          { label: 'Total Spending', value: `₹${stats.spending}` },
        ].map((item, i) => (
          <div key={i} className="bg-white shadow p-4 rounded-xl">
            <h4 className="text-sm text-gray-500">{item.label}</h4>
            <p className="text-xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default StatsOverview;
  