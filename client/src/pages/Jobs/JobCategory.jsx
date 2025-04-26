import React from 'react';
import jobCategories from '../../components/categories'; // assuming this file contains hardcoded categories
import '../../styles/JobCategory.css';
import { Link } from 'react-router-dom';


const JobCategory = () => {
  return (
    <div className="category-container">
      <h2 className="category-heading">Explore Job Categories</h2>
      <div className="category-grid">
        {jobCategories.map((category) => (
          <Link to={`/jobs/categories/list?category=${category.name}`} key={category.id} className="category-link">
            <div className="category-card">
              <img src={category.image} alt={category.name} className="category-image" />
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </div>
        
          {/* <div key={category.id} className="category-card">
            <h3>{category.name}</h3>
            <p>{category.description}</p>
          </div> */}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default JobCategory;
