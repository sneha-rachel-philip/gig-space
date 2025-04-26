import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaMoneyBill,
  FaEnvelope,
  FaBriefcase,
  FaFolderOpen,
} from 'react-icons/fa';
import '../styles/Sidebar.css';

const Sidebar = ({ role }) => {
  const linkStyle =
    'flex items-center gap-3 px-4 py-2 rounded hover:bg-blue-100 transition';
  const activeStyle = 'bg-blue-200 font-semibold';

  return (
    <aside className="w-64 bg-white shadow-md h-screen sticky top-0 p-4">
      <nav className="flex flex-col gap-2">
        <NavLink to={`/${role}/home`} className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : ''}`}>
          <FaHome /> Home
        </NavLink>

        <NavLink to={`/${role}/payments`} className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : ''}`}>
          <FaMoneyBill /> Payments
        </NavLink>

        <NavLink to={`/${role}/messages`} className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : ''}`}>
          <FaEnvelope /> Messages
        </NavLink>

        <NavLink to={`/${role}/jobs`} className={({ isActive }) => `${linkStyle} ${isActive ? activeStyle : ''}`}>
          <FaBriefcase /> My Jobs
        </NavLink>
        
      </nav>
    </aside>
  );
};

export default Sidebar;
