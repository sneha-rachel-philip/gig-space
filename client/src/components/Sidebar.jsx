import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-md h-full p-5">
      <h2 className="text-xl font-bold mb-6">Client Dashboard</h2>
      <nav className="space-y-4">
        <Link to="/client/home" className="block">🏠 Home</Link>
        <Link to="/client/projects" className="block">📁 Projects</Link>
        <Link to="/client/payments" className="block">💳 Payments</Link>
        <Link to="/client/messages" className="block">💬 Messages</Link>
      </nav>
    </div>
  );
};

export default Sidebar;
