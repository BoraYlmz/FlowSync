import React from 'react';
import './styles/LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className='loading'>
    <div className="loader">
    <span>loading</span>
    <div className="words">
      <span className="word">buttons</span>
      <span className="word">forms</span>
      <span className="word">switches</span>
      <span className="word">cards</span>
      <span className="word">buttons</span>
    </div>
  </div>
</div>
  );
};

export default LoadingSpinner;