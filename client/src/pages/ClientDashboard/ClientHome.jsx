import React, { useEffect, useState } from 'react';
import WelcomeBanner from '../../components/WelcomeBanner';
import StatsOverview from '../../components/StatsOverview';
import ProjectTable from '../../components/ProjectTable';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ClientHome.css';

const ClientHome = () => {
  const { user } = useAuth(); // Assuming `user` contains user data from context
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    proposals: 0,
    spending: 0,
  });
  const [userName, setUserName] = useState(''); // For storing dynamic user name

  useEffect(() => {
    // Fetch the user name from API if not available in context (optional)
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
      
        const user = await response.json();
        console.log('User data:', user); // Debugging line
        setUserName(user.name); // Update the welcome banner
      } catch (err) {
        console.error('Error fetching user name:', err);
        setUserName(user?.name || 'Client'); // Fallback
      }
    };

    // Fetch user name only if not available in context
    if (!user?.name) {
      fetchUserName();
    } else {
      setUserName(user.name); // Use context user name directly if available
    }

    // Dummy data for now (you can replace with real API calls)
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
  }, [user?.name]); // Runs when user context changes or when user.name is available

  return (
    <div className="client-home">
      <div className="welcome-banner">
        <WelcomeBanner name={userName || 'Client'} /> {/* Using userName state here */}
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

export default ClientHome;
