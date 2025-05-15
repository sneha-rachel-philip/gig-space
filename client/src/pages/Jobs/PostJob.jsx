import { useState } from 'react';
import { postJob } from '../../services/apiRoutes'; 
import { useNavigate } from 'react-router-dom';
import jobCategories from '../../components/categories'; 
import '../../styles/PostJob.css'; 
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
      const res = await postJob(formData);
      navigate(`/client/jobs/${res.data._id}`); // redirect to job detail after posting
    } catch (err) {
      console.error('Job post error:', err);
    }
  };

  return (
    <div className="post-job-container">
      <h2>Post a New Job</h2>
      <form onSubmit={handleSubmit} className="post-job-form">
        <div>
          <label htmlFor="title">Job Title</label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Job Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="date-category-container">
          <div>
            <label htmlFor="acceptedTill">Accepting Proposals Till</label>
            <input
              type="date"
              id="acceptedTill"
              name="acceptedTill"
              value={formData.acceptedTill}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label htmlFor="completedBy">Expected Completion By</label>
            <input
              type="date"
              id="completedBy"
              name="completedBy"
              value={formData.completedBy}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="category">Job Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
          <option value="">Select Category</option>
          {jobCategories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}

          </select>
        </div>

        <div>
          <label htmlFor="skills">Skills Required</label>
          <div className="flex-gap-2">
            <input
              id="skills"
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              placeholder="Enter skill"
            />
            <button
              type="button"
              onClick={addSkill}
              className="btn btn-primary"
            >
              Add
            </button>
          </div>
          <div className="flex-wrap">
            {formData.skillsRequired.map((skill, idx) => (
              <span key={idx} className="skill-tag">{skill}</span>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="milestones">Project Milestones</label>
          <div className="flex-gap-2">
            <input
              id="milestones"
              type="text"
              value={milestoneInput}
              onChange={e => setMilestoneInput(e.target.value)}
              placeholder="Enter milestone"
            />
            <button
              type="button"
              onClick={addMilestone}
              className="btn btn-primary"
            >
              Add
            </button>
          </div>
          <ul>
            {formData.milestones.map((milestone, idx) => (
              <li key={idx} className="milestone-tag">{milestone}</li>
            ))}
          </ul>
        </div>

        <div>
          <label htmlFor="description">Job Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Job Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="budget">Project Budget</label>
          <input
            type="number"
            id="budget"
            name="budget"
            placeholder="Project Budget"
            value={formData.budget}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Post Job
        </button>
      </form>
    </div>
  );
};

export default PostJob;
