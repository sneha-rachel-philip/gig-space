import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Correct path

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, userRole, loading, logout } = useAuth(); // 🛠 also get logout function!

  if (loading) {
    return (
      <nav className="navbar navbar-expand-lg sticky-top shadow" style={{ backgroundColor: '#0d6efd' }}>
        <div className="container">
          <div className="text-white">Loading...</div>
        </div>
      </nav>
    );
  }

  const getDashboardPath = () => {
    if (userRole === 'client') return '/client/home';
    if (userRole === 'freelancer') return '/freelancer/home';
    if (userRole === 'admin') return '/admin/home';
    return '/';
  };

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate('/'); // Redirect to homepage after logout
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top shadow" style={{ backgroundColor: '#0d6efd' }}>
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center text-white" to="/">
          <img
            src="/logo.png"
            alt="GigSpace Logo"
            width="40"
            height="40"
            className="me-2 rounded-circle logo-hover"
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
            <li className="nav-item">
              <Link
                className={`nav-link text-white ${location.pathname.startsWith('/jobs') ? 'active-link' : ''}`}
                to="/jobs"
              >
                Jobs
              </Link>
            </li>

            {/* Conditional based on login */}
            {!isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link text-white ${location.pathname.startsWith('/signup') ? 'active-link' : ''}`}
                    to="/signup"
                  >
                    Signup
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link text-white ${location.pathname.startsWith('/login') ? 'active-link' : ''}`}
                    to="/login"
                  >
                    Login
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link
                    className="btn btn-light fw-bold ms-3"
                    to={getDashboardPath()}
                  >
                    Go to Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <button
                    className="btn btn-outline-light fw-bold ms-3"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
