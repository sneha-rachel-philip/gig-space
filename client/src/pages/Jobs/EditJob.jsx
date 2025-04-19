import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById, updateJob } from '../../services/apiRoutes';
import styles from '../../styles/EditJob.module.css';

const EditJob = () => {
  const { id } = useParams();
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
        const res = await getJobById(id);
        const { title, description, budget, skillsRequired } = res.data;
        setFormData({
          title,
          description,
          budget,
          skillsRequired: skillsRequired.join(', '),
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
      await updateJob(id, updatedJob);
      alert('Job updated successfully!');
      navigate('/client/jobs');
    } catch (err) {
      console.error('Error updating job:', err);
      alert('Failed to update job.');
    }
  };

  if (loading) return <p>Loading job...</p>;

  return (
    <div className={styles.editJobContainer}>
      <h2 className={styles.heading}>Edit Job</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Budget (USD)</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Skills (comma separated)</label>
          <input
            type="text"
            name="skillsRequired"
            value={formData.skillsRequired}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.saveBtn}>
            Save Changes
          </button>
          <button type="button" onClick={() => navigate(-1)} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJob;
