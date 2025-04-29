import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Container, Row, Col } from 'react-bootstrap'; // Bootstrap components for layout

const Home = () => {
  
  return (
    <Layout>
      {/* Landing Section */}
      <Container fluid className="py-5 landing-section" style={{ backgroundColor: '#f8f9fa' }}>
        <Row className="align-items-center">
          {/* Left Side - Tagline */}
          <Col md={6} className="text-center text-md-start px-5">
            <h1 className="display-4 fw-bold">Your safe space to work and hire</h1>
            <p className="lead mt-3">
              We offer a closed space for short gigs. Get ready to roll!
            </p>
            <Link to="/jobs" className="btn btn-primary btn-lg mt-4">
              Browse Jobs
            </Link>
          </Col>

          {/* Right Side - Animated Image */}
          <Col md={6} className="text-center">
            <img
              src="/images/landing-animation.gif" // or your animated SVG
              alt="Landing"
              className="img-fluid"
              style={{ maxHeight: '400px' }}
            />
          </Col>
        </Row>
      </Container>

    </Layout>
  );
};

export default Home;
