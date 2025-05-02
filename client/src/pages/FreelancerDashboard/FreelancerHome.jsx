import React, { useEffect, useState } from 'react';
import WelcomeBanner from '../../components/WelcomeBanner';
import StatsOverview from '../../components/StatsOverview';
import ProjectTable from '../../components/ProjectTable';
import { useAuth } from '../../context/AuthContext';
//import '../../styles/FreelancerHome.css'; // Uncomment if you're using styles

const FreelancerHome = () => {
  const { user } = useAuth(); // Get user context
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    proposals: 0,
    spending: 0,
  });
  const [userName, setUserName] = useState(''); // Store the user name dynamically

  useEffect(() => {
    // Check if the user context has the name
    if (user?.name) {
      setUserName(user.name); // Set name from context
    } else {
      fetchUserName(); // Fetch from API if name is missing in context
    }

    // Dummy data for now:
    setProjects([
      { title: 'Website Redesign', budget: '$1,200', deadline: '2025-04-20', status: 'Active' },
      { title: 'Mobile App', budget: '$3,000', deadline: '2025-05-10', status: 'Completed' },
    ]);

    setStats({
      active: 1,
      completed: 1,
      proposals: 3,
      spending: 4200,
    });
  }, [user]); // Dependency on `user`, so it runs again when `user` changes

  // Fetch the user name from API if it's not available in the context
  const fetchUserName = async () => {
    try {
      const token = localStorage.getItem('token'); // Get token from localStorage
      const response = await fetch('/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const userData = await response.json();
      console.log('User data from API:', userData); // Debugging
      setUserName(userData.name); // Set the name if fetched from API
    } catch (err) {
      console.error('Error fetching user name:', err);
      setUserName('Freelancer'); // Fallback name if fetching fails
    }
  };

  return (
    <div className="freelancer-home">
      <div className="welcome-banner">
        {/* Display the user name */}
        <WelcomeBanner name={userName || 'Freelancer'} />
      </div>

      <div className="stats-overview">
        <StatsOverview stats={stats} />
      </div>

      <div className="project-table-wrapper">
        <ProjectTable projects={projects} />
      </div>
    </div>
  );
};

export default FreelancerHome;
