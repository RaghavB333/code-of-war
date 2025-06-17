"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true); // New state for loading status
  const router = useRouter();

  const searchParams = useSearchParams();
  const difficulty = searchParams.get("difficulty");
  const no = searchParams.get("no");

  console.log("Difficulty:", difficulty, no);

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
    router.push(`/CodeEditor/${problemId}`);
  };

  const getproblemDifficulty = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "Give Me Story";
      case "medium":
        return "Give Me Balanced";
      case "hard":
        return "Give Me Code Of War";
      default:
        return "";
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-orange-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 sm:p-6">
      <div className="w-full max-w-4xl mx-auto bg-[#0a0a0a] shadow-md rounded-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-500 mb-4 text-center sm:text-left">
          Available Problems
        </h1>

        {loading ? (
          <p className="text-gray-400 text-center">Fetching problems for you...</p>
        ) : problems.length === 0 ? (
          <p className="text-gray-400 text-center">No problems available. Please check back later.</p>
        ) : (
          <ul className="space-y-3 sm:space-y-4">
            {problems.map((problem) => (
              <li key={problem._id}>
                <button
                  onClick={() => handleProblemClick(problem._id)}
                  className="flex flex-col sm:flex-row justify-between w-full text-left bg-[#0a0a0a] hover:bg-gray-100 hover:text-black text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  <span className="text-base sm:text-lg">{problem.title}</span>
                  <span className={`mt-2 sm:mt-0 sm:ml-4 text-sm sm:text-base ${getDifficultyColor(problem.difficulty)}`}>
                    {getproblemDifficulty(problem.difficulty)}
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
