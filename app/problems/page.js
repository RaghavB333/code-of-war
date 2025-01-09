"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Use `next/navigation` instead of `next/router`
import axios from "axios";

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch problems from the API
    fetch("/api/problems")
      .then((response) => response.json())
      .then((data) => setProblems(data))
      .catch((error) => console.error("Error fetching problem:", error.response ? error.response.data : error.message));
  }, []);

  const handleProblemClick = (problemId) => {
    router.push(`/CodeEditor/${problemId}`);
  };

  return (
    <div>
      <h1>Available Problems</h1>
      <ul>
        {problems.map((problem) => (
          <li key={problem._id}>
            <button onClick={() => handleProblemClick(problem._id)} className="w-50 h-10 bg-white text-[#0a0a0a]">
              {problem.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProblemsPage;
