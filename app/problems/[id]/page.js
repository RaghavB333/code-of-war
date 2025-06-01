"use client";
import React from "react";
import { useState, useEffect} from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";


const ProblemsPage = ({params}) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true); // New state for loading status
  const router = useRouter();

  const searchParams = useSearchParams();
    const difficulty = searchParams.get("difficulty");
    const no = searchParams.get("no");
    const sessionend = searchParams.get("sessionend");
    const startedAt = searchParams.get("startedAt");
    console.log("startedAt:", startedAt);

    console.log("Difficulty:", difficulty, no);

    const { id } = React.use(params);
    console.log("ID:", id );

  useEffect(() => {
    // Fetch problems from the API
    fetch(`/api/problems?difficulty=${difficulty}&no=${no}`)
      .then((response) => response.json())
      .then((data) => {
        setProblems(data);
        setLoading(false); // Set loading to false after fetching
      })
      .catch((error) => {
        console.error(
          "Error fetching problem:",
          error.response ? error.response.data : error.message
        );
        setLoading(false); // Stop loading even if there’s an error
      });
  }, []);

  const handleProblemClick = (problemId) => {
    router.push(`/CodeEditor/${problemId}?lobby=${id}`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "give me story":
        return "text-green-500";
      case "give me balanced":
        return "text-orange-500";
      case "give me no mercy":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };
  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-4xl mx-auto bg-[#0a0a0a] shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold text-blue-500 mb-4">Available Problems</h1>
        {loading ? (
          // Show loading message while fetching
          <p className="text-gray-600">Fetching problems for you...</p>
        ) : problems.length === 0 ? (
          // Show this if no problems are found after loading
          <p className="text-gray-600">No problems available. Please check back later.</p>
        ) : (
          <ul className="space-y-4">
            {problems.map((problem) => (
              <li key={problem._id}>
                <button
                  onClick={() => handleProblemClick(problem._id)}
                  className="flex justify-between w-full text-left hover:bg-gray-100 hover:text-black text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  {problem.title}
                  <span className={`relative right-0 ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProblemsPage;