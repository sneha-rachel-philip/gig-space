import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";

//const jobId = new URLSearchParams(window.location.search).get('jobId');


const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verifyPayment = async () => {
        try {
          const sessionId = new URLSearchParams(location.search).get("session_id");
          if (!sessionId) {
            setStatus("error");
            return;
          }
  
          const res = await axios.post('api/payments/verify-success', { sessionId });

    
          if (res.data.success) {
            setStatus("success");
            setTimeout(() => {
              navigate(`/job-area/${res.data.jobId}`);
            }, 3000);
          } else {
            setStatus("error");
          }
        } catch (err) {
          console.error("Payment verification failed", err);
          setStatus("error");
        }
      };
  
      verifyPayment();
    }, [location.search, navigate]);
    return (
        <div className="container mt-5 text-center">
          {status === "verifying" && <p>Verifying payment...</p>}
          {status === "success" && <h3 className="text-success">✅ Payment successful!</h3>}
          {status === "error" && <h3 className="text-danger">❌ Payment could not be verified.</h3>}
        </div>
      );
    };

export default PaymentSuccess;
