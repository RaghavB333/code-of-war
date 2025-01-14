import React from 'react';

const AnalysisChart = ({ data }) => {
  if (!data || typeof data !== 'object') {
    return <div>Error: Invalid data format received from the backend.</div>;
  }

  return (
    <div>
      <p>
        <strong>Time:</strong> {mapExecutionToBigO(data.execution_time)} 
        &nbsp;&nbsp;|&nbsp;&nbsp; 
        <strong>Space:</strong> {data.space_complexity || "Not Determined"}
      </p>
    </div>
  );
};

const mapExecutionToBigO = (executionTime) => {
  // Adjust these thresholds based on your specific needs
  if (executionTime < 1e-4) return "O(1)"; // Constant time
  if (executionTime < 1e-3) return "O(log n)"; // Logarithmic time
  if (executionTime < 1e-2) return "O(n)"; // Linear time
  if (executionTime < 1e-1) return "O(n^2)"; // Quadratic time
  return "O(n^3)"; // Cubic time or beyond
};

export default AnalysisChart;