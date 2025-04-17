import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../services/axiosInstance';

const EditJob = () => {
  const { id } = useParams(); // get job ID from URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    skillsRequired: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`/jobs/${id}`);
        const { title, description, budget, skillsRequired } = res.data;

        setFormData({
          title,
          description,
          budget,
          skillsRequired: skillsRequired.join(', '), // convert array to comma string for form
        });

        setLoading(false);
      } catch (err) {
        console.error('Error fetching job:', err);
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    try {
      const updatedJob = {
        ...formData,
        skillsRequired: formData.skillsRequired.split(',').map(s => s.trim()),
      };

      await axios.put(`/jobs/${id}`, updatedJob);
      alert('Job updated successfully!');
      navigate('/client/dashboard'); // or wherever your jobs list is
    } catch (err) {
      console.error('Error updating job:', err);
      alert('Failed to update job.');
    }
  };

  if (loading) return <p>Loading job...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-6 p-4 border rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Edit Job</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block font-medium">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Budget (USD)</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Skills (comma separated)</label>
          <input
            type="text"
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
