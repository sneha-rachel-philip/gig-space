import React from 'react';
import jobCategories from '../../components/categories'; // keeping your original import
import '../../styles/JobCategory.css';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const JobCategory = () => {
  return (
    <Layout>
      <div className="container py-5 job-category-section">

      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="fw-bold text-primary mb-2">Explore Job Categories</h1>
          <p className="text-muted">Find your next career opportunity in these professional fields</p>
        </div>
        
        <div className="row g-4">
          {jobCategories.map((category) => (
            <div key={category.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
              <Link
                to={`/jobs/categories/?category=${category.name}`}
                className="text-decoration-none"
              >
                <div className="card h-100 border-0 shadow-sm category-card">
                  <div className="position-relative overflow-hidden">
                    <img
                      src={category.image}
                      className="card-img-top category-image"
                      alt={category.name}
                      style={{ objectFit: 'cover', height: '160px' }}
                    />
                    <div className="category-overlay d-flex align-items-center justify-content-center">
                      <span className="btn btn-light btn-sm">Browse Jobs</span>
                    </div>
                  </div>
                  <div className="card-body text-center">
                    <h5 className="card-title fw-bold">{category.name}</h5>
                    <p className="card-text text-muted">{category.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      </div>
      
     
    </Layout>
  );
};

export default JobCategory;