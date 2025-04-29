import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaMoneyBill,
  FaEnvelope,
  FaBriefcase,
  FaBars
} from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/Sidebar.css'; // You'll need this for custom styles

const Sidebar = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

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

        <div className="sidebar-menu p-2">
          <ul className="list-unstyled mb-0">
            <li>
              <NavLink 
                to={`/${role}/home`} 
                className={({ isActive }) => 
                  `nav-link py-2 px-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`
                }
              >
                <FaHome className={collapsed ? "mx-auto" : "me-3"} />
                {!collapsed && <span>Home</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to={`/${role}/payments`} 
                className={({ isActive }) => 
                  `nav-link py-2 px-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`
                }
              >
                <FaMoneyBill className={collapsed ? "mx-auto" : "me-3"} />
                {!collapsed && <span>Payments</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to={`/${role}/messages`} 
                className={({ isActive }) => 
                  `nav-link py-2 px-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`
                }
              >
                <FaEnvelope className={collapsed ? "mx-auto" : "me-3"} />
                {!collapsed && <span>Messages</span>}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to={`/${role}/jobs`} 
                className={({ isActive }) => 
                  `nav-link py-2 px-3 d-flex align-items-center ${isActive ? 'active bg-primary text-white rounded' : 'text-dark'}`
                }
              >
                <FaBriefcase className={collapsed ? "mx-auto" : "me-3"} />
                {!collapsed && <span>My Jobs</span>}
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;