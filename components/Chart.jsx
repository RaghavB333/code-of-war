import React from 'react';

const AnalysisChart = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <div>Error: Invalid data format received from the backend.</div>;
  }

  return (
    <div>
      <p>
        <strong>Time Complexity:</strong> {data.time || "Unknown"}
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <strong>Space Complexity:</strong> {data.memory || "Not Determined"}
      </p>
      
    </div>
  );
};

export default AnalysisChart;
