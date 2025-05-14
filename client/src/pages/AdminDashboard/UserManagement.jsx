import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  InputGroup, 
  FormControl, 
  Pagination, 
  Dropdown, 
  Badge, 
  Tabs, 
  Tab,
  Alert,
  Spinner,
  Modal
} from 'react-bootstrap';
import { getAllUsers, updateUserStatus, deleteUser } from '../../services/apiRoutes';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaSearch, FaFilter, FaSort, FaUserEdit, FaTrash, FaBan, FaUserCheck } from 'react-icons/fa';

const UserManagement = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [bannedUsers, setBannedUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPageActive, setCurrentPageActive] = useState(1);
  const [currentPageBanned, setCurrentPageBanned] = useState(1);
  const [totalPagesActive, setTotalPagesActive] = useState(1);
  const [totalPagesBanned, setTotalPagesBanned] = useState(1);
  const [sortOrder, setSortOrder] = useState('desc');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  // Fetch active and banned users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getAllUsers({
          search,
          page: currentPageActive,
          sortOrder,
          roleFilter,
          status: 'active',
        });
        setActiveUsers(response.data.users);
        setTotalPagesActive(response.data.totalPages);

        const bannedResponse = await getAllUsers({
          search,
          page: currentPageBanned,
          sortOrder,
          roleFilter,
          status: 'banned',
        });
        setBannedUsers(bannedResponse.data.users);
        setTotalPagesBanned(bannedResponse.data.totalPages);
      } catch {
        setError('Failed to load users. Please try again later.');
        toast.error('Error fetching users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [search, currentPageActive, currentPageBanned, sortOrder, roleFilter]);

  const handleStatusUpdate = async (userId, status) => {
    try {
      await updateUserStatus(userId, status);
      toast.success(`User ${status === 'active' ? 'activated' : 'banned'} successfully`);
      
      // If a user is banned, remove from active list and add to banned list
      if (status === 'banned') {
        const userToBan = activeUsers.find(user => user._id === userId);
        if (userToBan) {
          setActiveUsers(activeUsers.filter(user => user._id !== userId));
          setBannedUsers([...bannedUsers, {...userToBan, status: 'banned'}]);
        }
      } else {
        // If a user is activated, remove from banned list and add to active list
        const userToActivate = bannedUsers.find(user => user._id === userId);
        if (userToActivate) {
          setBannedUsers(bannedUsers.filter(user => user._id !== userId));
          setActiveUsers([...activeUsers, {...userToActivate, status: 'active'}]);
        }
      }
    } catch {
      toast.error('Error updating user status');
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser(userToDelete._id);
      toast.success('User deleted successfully');
      setActiveUsers(activeUsers.filter((user) => user._id !== userToDelete._id));
      setBannedUsers(bannedUsers.filter((user) => user._id !== userToDelete._id));
      setShowDeleteModal(false);
    } catch {
      toast.error('Error deleting user');
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPageActive(1);
    setCurrentPageBanned(1);
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    setCurrentPageActive(1);
    setCurrentPageBanned(1);
  };

  const handleSortChange = (order) => {
    setSortOrder(order);
    setCurrentPageActive(1);
    setCurrentPageBanned(1);
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'client':
        return 'primary';
      case 'freelancer':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const renderPagination = (totalPages, currentPage, handlePageChange) => {
    if (totalPages <= 1) return null;

    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.First disabled={currentPage === 1} onClick={() => handlePageChange(1)} />
          <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
          
          {currentPage > 2 && <Pagination.Ellipsis />}
          
          {Array.from({ length: Math.min(3, totalPages) }).map((_, idx) => {
            let pageNum;
            if (currentPage <= 2) {
              pageNum = idx + 1;
            } else if (currentPage >= totalPages - 1) {
              pageNum = totalPages - 2 + idx;
            } else {
              pageNum = currentPage - 1 + idx;
            }
            
            if (pageNum > 0 && pageNum <= totalPages) {
              return (
                <Pagination.Item 
                  key={pageNum} 
                  active={pageNum === currentPage}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            }
            return null;
          })}
          
          {currentPage < totalPages - 1 && <Pagination.Ellipsis />}
          
          <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
          <Pagination.Last disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)} />
        </Pagination>
      </div>
    );
  };

  const renderUserTable = (users, isActiveTable) => {
    if (loading) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading users...</p>
        </div>
      );
    }

    if (error) {
      return <Alert variant="danger">{error}</Alert>;
    }

    if (users.length === 0) {
      return <Alert variant="info">No users found. Try adjusting your search or filters.</Alert>;
    }

    return (
      <Table striped hover responsive className="align-middle">
        <thead className="bg-light">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joining Date</th>
            <th className="text-center">Status</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Badge bg={getRoleBadgeVariant(user.role)} pill>
                  {user.role}
                </Badge>
              </td>
              <td>{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="text-center">
                {isActiveTable ? (
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={() => handleStatusUpdate(user._id, 'banned')}
                    className="text-secondary border"
                  >
                    <FaBan className="me-1" /> Ban User
                  </Button>
                ) : (
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={() => handleStatusUpdate(user._id, 'active')}
                    className="text-secondary border"
                  >
                    <FaUserCheck className="me-1" /> Activate
                  </Button>
                )}
              </td>
              <td>
                <div className="d-flex justify-content-center gap-2">
                  <Link to={`/user/${user._id}/profile`}>
                    <Button variant="light" size="sm" className="text-primary border">
                      <FaUserEdit className="me-1" /> View
                    </Button>
                  </Link>
                  <Button 
                    variant="light" 
                    size="sm"
                    onClick={() => confirmDelete(user)}
                    className="text-danger border"
                  >
                    <FaTrash className="me-1" /> Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="mb-4 fw-bold">User Management</h2>
          
          <Card className="shadow-sm">
            <Card.Body>
              <Row className="align-items-center g-3">
                <Col md={6}>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0">
                      <FaSearch className="text-secondary" />
                    </InputGroup.Text>
                    <FormControl 
                      placeholder="Search by name or email" 
                      value={search} 
                      onChange={handleSearchChange}
                      className="border-start-0"
                    />
                  </InputGroup>
                </Col>
                
                <Col md={3}>
                  <Dropdown>
                    <Dropdown.Toggle variant="light" className="w-100 border text-secondary">
                      <FaFilter className="me-2" />
                      {roleFilter === 'all' ? 'All Roles' : `${roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s`}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleRoleFilterChange('all')}>All Roles</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleRoleFilterChange('client')}>Clients</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleRoleFilterChange('freelancer')}>Freelancers</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
                
                <Col md={3}>
                  <Dropdown>
                    <Dropdown.Toggle variant="light" className="w-100 border text-secondary">
                      <FaSort className="me-2" />
                      {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => handleSortChange('desc')}>Newest First</Dropdown.Item>
                      <Dropdown.Item onClick={() => handleSortChange('asc')}>Oldest First</Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="border-bottom-0"
              >
                <Tab 
                  eventKey="active" 
                  title={
                    <span>
                      <Badge bg="success" pill className="me-2">{activeUsers.length}</Badge>
                      Active Users
                    </span>
                  }
                />
                <Tab 
                  eventKey="banned" 
                  title={
                    <span>
                      <Badge bg="danger" pill className="me-2">{bannedUsers.length}</Badge>
                      Banned Users
                    </span>
                  }
                />
              </Tabs>
            </Card.Header>
            <Card.Body>
              {activeTab === 'active' ? (
                <>
                  {renderUserTable(activeUsers, true)}
                  {renderPagination(totalPagesActive, currentPageActive, setCurrentPageActive)}
                </>
              ) : (
                <>
                  {renderUserTable(bannedUsers, false)}
                  {renderPagination(totalPagesBanned, currentPageBanned, setCurrentPageBanned)}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the user <strong>{userToDelete?.name}</strong>? This action cannot be undone.
        </Modal.Body>
                  <Modal.Footer>
          <Button variant="light" className="border" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="light" className="text-danger border" onClick={handleDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserManagement;