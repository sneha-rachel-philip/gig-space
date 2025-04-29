import { useState, useEffect } from 'react';
import { changePassword } from '../services/apiRoutes';

function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Use useEffect to close the modal when success is true
  useEffect(() => {
    let timer;
    if (isSuccess && typeof onClose === 'function') {
      timer = setTimeout(() => {
        onClose();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isSuccess, onClose]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await changePassword({ currentPassword, newPassword });
      setMessage('Password updated successfully!');
      setIsSuccess(true);
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        setMessage(error.response.data.error || 'Something went wrong!');
      } else {
        console.error('Error without response:', error.message);
        setMessage('Network error. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleChangePassword}>
            <div className="modal-header">
              <h5 className="modal-title">Change Password</h5>
              <button type="button" className="btn-close" onClick={handleClose}></button>
            </div>
            <div className="modal-body">
              {message && (
                <div className={`alert ${isSuccess ? 'alert-success' : 'alert-danger'}`}>
                  {message}
                </div>
              )}
              <div className="mb-3">
                <label>Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label>New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading || isSuccess}
              >
                {isLoading ? 'Saving...' : 'Save changes'}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Close
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordModal;