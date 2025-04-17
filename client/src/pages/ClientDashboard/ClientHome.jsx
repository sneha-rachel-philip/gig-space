import React, { useEffect, useState } from 'react';
import WelcomeBanner from '../../components/WelcomeBanner';
import StatsOverview from '../../components/StatsOverview';
import ProjectTable from '../../components/ProjectTable';

const ClientHome = () => {
  const [userName, setUserName] = useState('Client Name'); // Replace with context or API
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    completed: 0,
    proposals: 0,
    spending: 0,
  });

  useEffect(() => {
    // Fetch data from API here and set projects + stats

    /* const fetchUserName = async () => {
        const userData = await fetch('/api/users/me'); // Replace with actual API call
        const user = await userData.json();
        setUserName(user.name); // Dynamically update the userName
      }; */
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
          setUserName('Client'); // Fallback
        }
      }; 
    
      fetchUserName();
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
  }, []);

  return (
    <div>
      <WelcomeBanner name={userName} />
      <StatsOverview stats={stats} />
      <ProjectTable projects={projects} />
    </div>
  );
};

export default ClientHome;
