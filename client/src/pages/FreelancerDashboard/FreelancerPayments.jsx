import React, { useEffect, useState } from 'react';
import { Accordion, Card, Button, Spinner, Badge } from 'react-bootstrap';
import axios from 'axios';

const FreelancerPayments = () => {
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});
  const [milestones, setMilestones] = useState({
    pending: [],
    awaitingPayments: [],
    completedPayments: [],
  });

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const { data } = await axios.get('/api/admin/milestone-approvals');
        setMilestones({
          pending: data.pending || [],
          awaitingPayments: data.awaitingPayments || [],
          completedPayments: data.completedPayments || [],
        });
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, []);

  const handleApprove = async (contractId, milestoneLabel) => {
    try {
      setApproving((prev) => ({ ...prev, [milestoneLabel]: true }));
      await axios.post(`/api/admin/approve-milestone`, { contractId, milestoneLabel });
      // Refetch milestones after approval
      const { data } = await axios.get('/api/admin/milestone-approvals');
      setMilestones({
        pending: data.pending || [],
        awaitingPayments: data.awaitingPayments || [],
        completedPayments: data.completedPayments || [],
      });
    } catch (error) {
      console.error('Approval failed:', error);
    } finally {
      setApproving((prev) => ({ ...prev, [milestoneLabel]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status" />
        <p>Loading milestone data...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Milestones & Payments</h2>
      <Accordion defaultActiveKey="0">
        {/* Pending Approvals */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            Pending Admin Approval ({milestones.pending.length})
          </Accordion.Header>
          <Accordion.Body>
            {milestones.pending.length === 0 ? (
              <p className="text-muted">No pending approvals.</p>
            ) : (
              milestones.pending.map((m, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Body>
                    <p><strong>Milestone:</strong> {m.milestoneLabel}</p>
                    <p><strong>Amount:</strong> ₹{m.amount}</p>
                    <p><strong>Freelancer:</strong> {m.freelancer.name} ({m.freelancer.email})</p>
                    <p><strong>Client:</strong> {m.client.name} ({m.client.email})</p>
                    <Button
                      variant="success"
                      onClick={() => handleApprove(m.contractId, m.milestoneLabel)}
                      disabled={approving[m.milestoneLabel]}
                    >
                      {approving[m.milestoneLabel] ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Approving...
                        </>
                      ) : (
                        'Approve'
                      )}
                    </Button>
                  </Card.Body>
                </Card>
              ))
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* Awaiting Payment */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>
            Awaiting Client Payment ({milestones.awaitingPayments.length})
          </Accordion.Header>
          <Accordion.Body>
            {milestones.awaitingPayments.length === 0 ? (
              <p className="text-muted">No milestones awaiting payment.</p>
            ) : (
              milestones.awaitingPayments.map((m, idx) => {
                const completedDate = new Date(m.completedAt);
                const approvedDate = new Date(m.approvedAt);
                const now = new Date();
                const daysSinceCompletion = Math.floor((now - completedDate) / (1000 * 60 * 60 * 24));
                const daysSinceApproval = Math.floor((now - approvedDate) / (1000 * 60 * 60 * 24));
                const gracePeriod = 5;
                const overdueBy = daysSinceApproval - gracePeriod;

                return (
                  <Card key={idx} className="mb-3">
                    <Card.Body>
                      <p><strong>Milestone:</strong> {m.milestoneLabel}</p>
                      <p><strong>Amount:</strong> ₹{m.amount}</p>
                      <p><strong>Freelancer:</strong> {m.freelancer.name} ({m.freelancer.email})</p>
                      <p><strong>Client:</strong> {m.client.name} ({m.client.email})</p>
                      <p><strong>Approved on:</strong> {approvedDate.toLocaleDateString()}</p>
                      <p>
                        {overdueBy <= 0 ? (
                          <span>{gracePeriod - daysSinceApproval} day(s) left in grace period</span>
                        ) : (
                          <span className="text-danger">⚠️ Overdue by {overdueBy} day(s)</span>
                        )}
                      </p>
                    </Card.Body>
                  </Card>
                );
              })
            )}
          </Accordion.Body>
        </Accordion.Item>

        {/* Completed & Paid */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            Completed & Paid ({milestones.completedPayments.length})
          </Accordion.Header>
          <Accordion.Body>
            {milestones.completedPayments.length === 0 ? (
              <p className="text-muted">No paid milestones yet.</p>
            ) : (
              milestones.completedPayments.map((m, idx) => (
                <Card key={idx} className="mb-3">
                  <Card.Body>
                    <p><strong>Milestone:</strong> {m.milestoneLabel}</p>
                    <p><strong>Amount:</strong> ₹{m.amount}</p>
                    <p><strong>Freelancer:</strong> {m.freelancer.name} ({m.freelancer.email})</p>
                    <p><strong>Client:</strong> {m.client.name} ({m.client.email})</p>
                    <p><strong>Paid on:</strong> {new Date(m.paidAt).toLocaleDateString()}</p>
                    {m.stripeSessionId && (
                      <p><strong>Stripe Session:</strong> <code>{m.stripeSessionId}</code></p>
                    )}
                    <p>
                      <strong>Contract Status:</strong>{' '}
                      <Badge bg="secondary">{m.contractStatus}</Badge>
                    </p>
                  </Card.Body>
                </Card>
              ))
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default FreelancerPayments;
