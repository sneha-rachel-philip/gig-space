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
import { Nav, Button, Image, Badge } from 'react-bootstrap';

const SidebarUser = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const userRole = role || 'client';

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
            userRole === 'freelancer' ? '/freelancer/home' :
            '/admin/home',
        icon: <FaHome className={collapsed ? "mx-auto" : "me-2"} size={18} />,
        text: 'Home'
      },
      {
        to: userRole === 'client' ? '/client/profile' :
        userRole === 'freelancer' ? '/freelancer/profile' :
        '/admin/profile',
        icon: <FaUserCircle className={collapsed ? "mx-auto" : "me-2"} size={18} />,
        text: 'Profile'
      }
    ];
    
    // Admin-specific items
    if (userRole === 'admin') {
      return [
        ...commonItems,
        {
          to: '/admin/users',
          icon: <FaUserCircle className={collapsed ? "mx-auto" : "me-2"} size={18} />,
          text: 'User Management'
        },
        {
          to: '/admin/jobs',
          icon: <FaBriefcase className={collapsed ? "mx-auto" : "me-2"} size={18} />,
          text: 'Job Management'
        },
        {
          to: '/admin/reviews',
          icon: <FaEnvelope className={collapsed ? "mx-auto" : "me-2"} size={18} />,
          text: 'Review Moderation'
        },
        {
          to: '/admin/payments',
          icon: <FaMoneyBill className={collapsed ? "mx-auto" : "me-2"} size={18} />,
          text: 'Payments'
        }
      ];
    }
    
    // Standard user items
    return [
      ...commonItems,
      {
        to: userRole === 'client' ? '/client/payments' : '/freelancer/payments',
        icon: <FaMoneyBill className={collapsed ? "mx-auto" : "me-2"} size={18} />,
        text: 'Payments'
      },
      {
        to: userRole === 'client' ? '/client/messages' : '/freelancer/messages',
        icon: <FaEnvelope className={collapsed ? "mx-auto" : "me-2"} size={18} />,
        text: 'Messages'
      },
      {
        to: userRole === 'client' ? '/client/jobs' : '/freelancer/jobs',
        icon: <FaBriefcase className={collapsed ? "mx-auto" : "me-2"} size={18} />,
        text: 'My Jobs'
      }
    ];
  };

  const navItems = getNavItems();

  return (
    <div className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`} style={{
      width: collapsed ? '70px' : '240px',
      transition: 'width 0.3s ease',
      height: '100vh',
      position: 'sticky',
      top: 0,
      backgroundColor: '#f8f9fa',
      borderRight: '1px solid #dee2e6',
      overflowX: 'hidden'
    }}>
      {/* Sidebar Header */}
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
        {!collapsed && <h5 className="m-0 text-dark fw-bold">Dashboard</h5>}
        <Button 
          variant="light"
          size="sm"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className={collapsed ? 'mx-auto' : ''}
        >
          <FaBars />
        </Button>
      </div>

      {/* User Profile Section */}
      {currentUser && (
        <div className={`p-3 border-bottom ${collapsed ? 'text-center' : ''}`}>
          <div className="d-flex align-items-center">
            {currentUser.photoURL ? (
              <Image 
                src={currentUser.photoURL} 
                roundedCircle 
                width={40} 
                height={40}
                className={collapsed ? 'mx-auto' : 'me-2'} 
              />
            ) : (
              <div 
                className={`rounded-circle bg-primary text-white d-flex align-items-center justify-content-center ${collapsed ? 'mx-auto' : 'me-2'}`}
                style={{ width: '40px', height: '40px' }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            
            {!collapsed && (
              <div>
                <div className="fw-bold">{currentUser?.name || 'User'}</div>
                <Badge bg="secondary">{userRole}</Badge>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <Nav className="flex-column mt-2">
        {navItems.map((item, index) => (
          <Nav.Item key={index}>
            <NavLink 
              to={item.to} 
              className={({ isActive }) => 
                `nav-link py-2 px-3 d-flex align-items-center ${isActive ? 'active text-primary fw-bold' : 'text-dark'}`
              }
            >
              {item.icon}
              {!collapsed && <span>{item.text}</span>}
            </NavLink>
          </Nav.Item>
        ))}
        
        {/* Logout Button */}
        <Nav.Item className="mt-auto">
          <Button 
            variant="link" 
            className="nav-link py-2 px-3 d-flex align-items-center text-dark w-100"
            onClick={handleLogout}
          >
            <FaSignOutAlt className={collapsed ? "mx-auto" : "me-2"} size={18} />
            {!collapsed && <span>Logout</span>}
          </Button>
        </Nav.Item>
      </Nav>
      
      {/* Add some custom CSS for proper styling */}
      <style>{`
        .sidebar .nav-link.active {
          background-color: #f0f0f0;
          border-radius: 4px;
        }
        
        .sidebar .nav-link:hover {
          background-color: #e9ecef;
          border-radius: 4px;
        }
        
        .sidebar-collapsed .nav-link {
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default SidebarUser;