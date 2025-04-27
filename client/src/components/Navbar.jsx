import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation(); // To get the current path

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow" style={{ backgroundColor: '#0d6efd' }}>
      <div className="container">
        {/* Logo and Brand */}
        <Link className="navbar-brand d-flex align-items-center text-white" to="/">
          <img
            src="/logo.png"
            alt="GigSpace Logo"
            width="40"
            height="40"
            className="me-2 rounded-circle logo-hover" // added "logo-hover"
            style={{ transition: 'transform 0.3s ease' }}
          />
          <span className="fw-bold fs-4">GigSpace</span>
        </Link>

        {/* Hamburger */}
        <button
          className="navbar-toggler text-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {[
              { name: 'Jobs', path: '/jobs' },
              { name: 'Signup', path: '/signup' },
              { name: 'Login', path: '/login' },
            ].map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  className={`nav-link text-white ${location.pathname.startsWith(item.path) ? 'active-link' : ''}`}
                  to={item.path}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
