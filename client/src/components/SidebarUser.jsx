// src/components/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FaHome,
  FaMoneyBill,
  FaEnvelope,
  FaBriefcase,
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
  FaCog
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
//import './Sidebar.css';

const SidebarUser = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define role-based navigation items
  const getNavItems = () => {
    const commonItems = [
      {
        to: userRole === 'client' ? '/client/home' :
            userRole==='freelancer'? '/freelancer/home':
            '/admin/home',
        icon: <FaHome className={collapsed ? "mx-auto" : "me-3"} />,
        text: 'Home'
      },
      {
        to: userRole === 'client' ? '/client/profile' :
        userRole==='freelancer'? '/freelancer/profile':
        '/admin/profile',
        icon: <FaUserCircle className={collapsed ? "mx-auto" : "me-3"} />,
        text: 'Profile'
      }
    ];
    
    // Admin-specific items
    if (userRole === 'admin') {
      return [
        ...commonItems,
        {
          to: '/admin/users',
          icon: <FaUserCircle className={collapsed ? "mx-auto" : "me-3"} />,
          text: 'Manage Users'
        },
        {
          to: '/admin/settings',
          icon: <FaCog className={collapsed ? "mx-auto" : "me-3"} />,
          text: 'Settings'
        }
      ];
    }
    
    // Standard user items
    return [
      ...commonItems,
      {
        to: userRole === 'client' ? '/client/payments' : '/freelancer/payments',
        icon: <FaMoneyBill className={collapsed ? "mx-auto" : "me-3"} />,
        text: 'Payments'
      },
      {
        to: userRole === 'client' ? '/client/messages' : '/freelancer/messages',
        icon: <FaEnvelope className={collapsed ? "mx-auto" : "me-3"} />,
        text: 'Messages'
      },
      {
        to: userRole === 'client' ? '/client/jobs' : '/freelancer/jobs',
        icon: <FaBriefcase className={collapsed ? "mx-auto" : "me-3"} />,
        text: 'My Jobs'
      }
    ];
  };

  const navItems = getNavItems();

  return (
    <div className={`sidebar-wrapper ${collapsed ? 'collapsed' : ''}`}>
      <nav id="sidebar" className="bg-light">
        <div className="sidebar-header d-flex justify-content-between align-items-center p-3 border-bottom">
          {!collapsed && <h5 className="m-0 text-dark">Dashboard</h5>}
          <button 
            className="btn btn-link text-secondary" 
            onClick={toggleSidebar}
          >
            <FaBars />
          </button>
        </div>

        {/* User profile section */}
        {currentUser && (
          <div className={`user-profile p-3 border-bottom ${collapsed ? 'text-center' : ''}`}>
            <div className="d-flex align-items-center">
              <div className={`avatar-circle ${collapsed ? 'mx-auto' : 'me-3'}`}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="user-info">
                  <div className="user-name">{currentUser.name}</div>
                  <div className="user-role text-muted">{userRole}</div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="sidebar-menu p-2">
          <ul className="list-unstyled mb-0">
            {navItems.map((item, index) => (
              <li key={index}>
                <NavLink 
                  to={item.to} 
                  className={({ isActive }) => 
                    `nav-link py-2 px-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`
                  }
                >
                  {item.icon}
                  {!collapsed && <span>{item.text}</span>}
                </NavLink>
              </li>
            ))}
            
            {/* Logout option always at the bottom */}
            <li className="mt-auto">
              <button 
                className="nav-link py-2 px-3 d-flex align-items-center text-dark w-100 bg-transparent border-0"
                onClick={handleLogout}
              >
                <FaSignOutAlt className={collapsed ? "mx-auto" : "me-3"} />
                {!collapsed && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default SidebarUser;