import React, { useEffect, useState } from 'react';
import { getPaymentsForUser, requestWithdrawal, getCurrentUser } from '../../services/apiRoutes';

const FreelancerPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [isWithdrawn, setIsWithdrawn] = useState(false); // Track if withdrawal has been made

  // Fetch wallet balance from the current user's data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getCurrentUser(); // Fetch current user
        setWalletBalance(res.data.walletBalance);
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();
  }, []);

  // Fetch payments for the logged-in freelancer
  const fetchPayments = async () => {
    try {
      const res = await getPaymentsForUser();
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const availablePayments = payments.filter(p => p.status === 'completed');
  const withdrawnPayments = payments.filter(p => p.status === 'withdrawn');

  const handleWithdraw = async () => {
    if (!availablePayments.length) return alert('No funds available for withdrawal.');

    try {
      // Pass the IDs of the available payments to request the withdrawal
      const res = await requestWithdrawal({
        paymentIds: availablePayments.map(p => p._id),
      });

      alert(res.data.message || 'Withdrawal requested.');
      setIsWithdrawn(true); // Set the flag to true after successful withdrawal
      fetchPayments(); // Refresh payments to update status
    } catch (err) {
      console.error('Withdrawal error:', err);
      alert('Withdrawal failed.');
    }
  };

  if (loading) return <div>Loading...</div>;

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleString() : '—';

  return (
    <div className="container mt-4">
      <h2>Available Balance</h2>
      <p className="fw-bold">
        ₹{availablePayments.reduce((sum, p) => sum + p.amount, 0)}
      </p>

      {/* Withdraw button logic: Disable if the withdrawal has already been done */}
      <button
        className="btn btn-primary mb-3"
        onClick={handleWithdraw}
        disabled={isWithdrawn} // Disable if the withdrawal was successful
      >
        {isWithdrawn ? 'Withdrawal Completed' : 'Withdraw Now'}
      </button>

      <h4>Pending Payments</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Milestone</th>
            <th>Job Title</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Paid At</th>
          </tr>
        </thead>
        <tbody>
          {availablePayments.map(p => (
            <tr key={p._id}>
              <td>{p.milestoneLabel || '—'}</td>
              <td>{p.contract?.job?.title || '—'}</td>
              <td>{p.contract?.client?.name || '—'}</td>
              <td>₹{p.amount}</td>
              <td>{formatDate(p.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4>Withdrawal History</h4>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Milestone</th>
            <th>Job Title</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Withdrawn At</th>
          </tr>
        </thead>
        <tbody>
          {withdrawnPayments.map(p => (
            <tr key={p._id}>
              <td>{p.milestoneLabel || '—'}</td>
              <td>{p.contract?.job?.title || '—'}</td>
              <td>{p.contract?.client?.name || '—'}</td>
              <td>₹{p.amount}</td>
              <td>{formatDate(p.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FreelancerPayments;
