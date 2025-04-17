import { useState } from 'react';
import axios from '../../services/axiosInstance';
import { useNavigate } from 'react-router-dom';

const PostJob = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    acceptedTill: '',
    completedBy: '',
    category: '',
    skillsRequired: [],
    milestones: [],
    description: '',
    budget: ''
  });

  const [skillInput, setSkillInput] = useState('');
  const [milestoneInput, setMilestoneInput] = useState('');

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData({ ...formData, skillsRequired: [...formData.skillsRequired, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const addMilestone = () => {
    if (milestoneInput.trim()) {
      setFormData({ ...formData, milestones: [...formData.milestones, milestoneInput.trim()] });
      setMilestoneInput('');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/jobs', formData);
      navigate(`/client/jobs/${res.data._id}`); // redirect to job detail after posting
    } catch (err) {
      console.error('Job post error:', err);
    }
  };

  return (
  <div className="max-w-3xl mx-auto mt-8 p-6 bg-white rounded-xl shadow">
    <h2 className="text-2xl font-semibold mb-4">Post a New Job</h2>
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Job Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Job Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {/* Date Inputs */}
      <div className="flex gap-4">
        <div className="w-1/2">
          <label htmlFor="acceptedTill" className="block text-sm font-medium text-gray-700 mb-1">
            Accepting Proposals Till
          </label>
          <input
            type="date"
            id="acceptedTill"
            name="acceptedTill"
            value={formData.acceptedTill}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="w-1/2">
          <label htmlFor="completedBy" className="block text-sm font-medium text-gray-700 mb-1">
            Expected Completion By
          </label>
          <input
            type="date"
            id="completedBy"
            name="completedBy"
            value={formData.completedBy}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Job Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="">Select Category</option>
          <option value="Web Development">Web Development</option>
          <option value="Design">Design</option>
          <option value="Marketing">Marketing</option>
          <option value="Writing">Writing</option>
          <option value="Data Analysis">Data Analysis</option>
        </select>
      </div>

      {/* Skills Input */}
      <div>
        <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
          Skills Required
        </label>
        <div className="flex gap-2">
          <input
            id="skills"
            type="text"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
            className="flex-grow p-2 border rounded"
            placeholder="Enter skill"
          />
          <button
            type="button"
            onClick={addSkill}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {formData.skillsRequired.map((skill, idx) => (
            <span key={idx} className="bg-gray-200 px-3 py-1 rounded-full text-sm">{skill}</span>
          ))}
        </div>
      </div>

      {/* Milestones Input */}
      <div>
        <label htmlFor="milestones" className="block text-sm font-medium text-gray-700 mb-1">
          Project Milestones
        </label>
        <div className="flex gap-2">
          <input
            id="milestones"
            type="text"
            value={milestoneInput}
            onChange={e => setMilestoneInput(e.target.value)}
            className="flex-grow p-2 border rounded"
            placeholder="Enter milestone"
          />
          <button
            type="button"
            onClick={addMilestone}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
        <ul className="mt-2 list-disc list-inside">
          {formData.milestones.map((milestone, idx) => (
            <li key={idx}>{milestone}</li>
          ))}
        </ul>
      </div>

      {/* Job Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Job Description
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Job Description"
          value={formData.description}
          onChange={handleChange}
          className="w-full p-2 border rounded h-32"
          required
        />
      </div>

      {/* Budget */}
      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
          Project Budget
        </label>
        <input
          type="number"
          id="budget"
          name="budget"
          placeholder="Project Budget"
          value={formData.budget}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        Post Job
      </button>
    </form>
  </div>

  );
};

export default PostJob;
