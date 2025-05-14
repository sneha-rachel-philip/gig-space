import { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import { flagJob } from '../services/apiRoutes';

const FlagJobButton = ({ jobId }) => {
  const [show, setShow] = useState(false);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFlag = async () => {
    try {
        await flagJob(jobId, reason);
        setSubmitted(true);
    } catch {
      setError('Failed to flag the job. Try again later.');
    }
  };

  return (
    <>
      <Button variant="warning" onClick={() => setShow(true)}>
        Report Job
      </Button>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Report Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {submitted ? (
            <div className="text-success">✅ Job flagged for review.</div>
          ) : (
            <>
              <Form.Group>
                <Form.Label>Reason for reporting</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </Form.Group>
              {error && <p className="text-danger mt-2">{error}</p>}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!submitted && (
            <>
              <Button variant="secondary" onClick={() => setShow(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleFlag}
                disabled={!reason.trim()}
              >
                Submit Report
              </Button>
            </>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FlagJobButton;
