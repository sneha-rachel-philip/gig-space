import { useState, useEffect } from 'react';
import axios from "../../services/axiosInstance";
//import { useSearchParams } from 'react-router-dom';

const categories = ['Design', 'Development', 'Writing', 'Marketing'];

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async (category) => {
    setLoading(true);
    try {
      const res = await axios.get(`/jobs?category=${category}`);
      setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedCategory) fetchJobs(selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Browse Jobs by Category</h2>

      <div className="flex gap-4 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-4 py-2 rounded ${
              selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading jobs...</p>
      ) : (
        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job._id} className="border p-4 rounded shadow">
              <h3 className="text-lg font-bold">{job.title}</h3>
              <p>{job.description.substring(0, 100)}...</p>
              <p className="text-sm text-gray-600 mt-1">
                Posted by: {job.createdBy?.name}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JobList;
