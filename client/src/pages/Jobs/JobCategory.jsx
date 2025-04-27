import React from 'react';
import jobCategories from '../../components/categories'; // assuming this file contains hardcoded categories
import '../../styles/JobCategory.css';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';

const JobCategory = () => {
  
  return (
    <Layout>
      <div className="container py-5">
      <h2 className="text-center mb-4">Explore Job Categories</h2>
      <div className="row g-4">
        {jobCategories.map((category) => (
          <div key={category.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <Link
              to={`/jobs/categories/?category=${category.name}`}
              className="text-decoration-none text-dark"
            >
              <div className="card h-100 shadow-sm">
                <img
                  src={category.image}
                  className="card-img-top"
                  alt={category.name}
                  style={{ objectFit: 'cover', height: '160px' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{category.name}</h5>
                  <p className="card-text">{category.description}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
    </Layout>
  );
};

export default JobCategory;
