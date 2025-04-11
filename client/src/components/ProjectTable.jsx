const ProjectTable = ({ projects }) => {
    return (
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-4">Current Projects</h3>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2">Project Title</th>
              <th className="py-2">Budget</th>
              <th className="py-2">Deadline</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, index) => (
              <tr key={index} className="border-b text-sm">
                <td className="py-2">{p.title}</td>
                <td className="py-2">{p.budget}</td>
                <td className="py-2">{p.deadline}</td>
                <td className="py-2">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default ProjectTable;
  