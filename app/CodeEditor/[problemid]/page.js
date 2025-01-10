"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import axios from "axios";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const supportedLanguages = ["javascript", "python", "csharp", "cpp"];
const languageMap = {
  javascript: 63,
  python: 71,
  csharp: 51,
  cpp: 53,
};

const CodeEditorPage = ({ params }) => {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [problemTitle, setProblemTitle] = useState("");
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const [problemId, setProblemId] = useState("");

  // Fetch problemId from the URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = window.location.pathname.split("/").pop();
      setProblemId(id);
    }
  }, []);

  // Fetch problem data when problemId is set
  useEffect(() => {
    if (!problemId) return;

    const fetchProblem = async () => {
      try {
        const response = await axios.get(`/api/problems/${problemId}`);
        const problem = response.data;

        // Log fetched data for debugging
        console.log("Fetched problem:", problem);

        // Check if problem.testCases exists and has the expected structure
        if (problem.testCases) {
          console.log("Test cases:", problem.testCases);

          // Transform test case input based on the format (array or string)
          const transformedTestCases = problem.testCases.map((testCase) => ({
            input: Array.isArray(testCase.input)
              ? testCase.input.join(" ")  // If input is an array, join as space-separated string
              : testCase.input || "",    // If input is a string, leave it as is
            expectedOutput: testCase.expectedOutput || "",
          }));

          // Log transformed test cases
          console.log("Transformed test cases:", transformedTestCases);
          setTestCases(transformedTestCases);
        }
        setProblemTitle(problem.title || "");
      } catch (error) {
        console.error("Error fetching problem:", error.response?.data || error.message);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Handle language change
  const handleLanguageChange = (e) => setLanguage(e.target.value);

  // Handle changes in test cases
  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...testCases];
    updatedTestCases[index][field] = value; // Space-separated string input
    setTestCases(updatedTestCases);
  };

  // Add new test case
  const addTestCase = () => setTestCases([...testCases, { input: "", expectedOutput: "" }]);

  // Run test cases against the code
  const runTestCases = async () => {
    if (!language) {
      alert("Please select a language first!");
      return;
    }
    setIsRunning(true);
    const results = [];

    for (const testCase of testCases) {
      const { input, expectedOutput } = testCase;

      // Convert the space-separated input string into an array of integers (if necessary)
      const inputArray = input.split(" ").map(Number).filter((num) => !isNaN(num));  // Convert string to array of integers

      try {
        const response = await axios.post(
          "https://judge0-ce.p.rapidapi.com/submissions",
          {
            source_code: code,
            language_id: languageMap[language],
            stdin: inputArray.join(" "), // Send as space-separated string
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": "291463371emshaf93509b305e020p136094jsn7552daaf62c9",
              "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        const { token } = response.data;

        // Wait for the result using the token
        const result = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
          {
            headers: {
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
              "X-RapidAPI-Key": "291463371emshaf93509b305e020p136094jsn7552daaf62c9",
            },
          }
        );

        const actualOutput = result.data.stdout?.trim() || result.data.stderr?.trim();
        results.push({
          input,
          expectedOutput,
          actualOutput,
          passed: actualOutput == expectedOutput,
        });

        if (!results[results.length - 1].passed) break; // Stop if a test fails
      } catch (error) {
        results.push({
          input,
          expectedOutput,
          actualOutput: "Error during execution",
          passed: false,
        });
        break;
      }
    }

    setResults(results);
    setIsRunning(false);
  };

  // Calculate passed test cases
  const passedCount = results.filter((result) => result.passed).length;
  const firstFailedTest = results.find((result) => !result.passed);

  return (
    <div>
      <h1>Code Editor - {problemTitle}</h1>
      <select onChange={handleLanguageChange} value={language} className="text-black">
        {!language && (
          <option value="" disabled>
            Select your language
          </option>
        )}
        {supportedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()}
          </option>
        ))}
      </select>
      {language && (
        <MonacoEditor
          height="500px"
          language={language}
          value={code}
          onChange={(value) => setCode(value)}
          options={{ fontSize: 16, minimap: { enabled: false } }}
        />
      )}

      <div>
        <h2>Test Cases</h2>
        {testCases.map((testCase, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <textarea
              placeholder="Input (Space-separated values)"
              value={testCase.input}
              onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
              rows="3"
              cols="30"
              className="text-black"
            />
            <textarea
              placeholder="Expected Output"
              value={testCase.expectedOutput}
              onChange={(e) => handleTestCaseChange(index, "expectedOutput", e.target.value)}
              rows="3"
              cols="30"
              className="text-black"
            />
          </div>
        ))}
        <button onClick={addTestCase}>Add Test Case</button>
        <button onClick={runTestCases} disabled={isRunning}>
          {isRunning ? "Running..." : "Run Test Cases"}
        </button>
      </div>
      {results.length > 0 && (
        <div>
          <h2>Results</h2>
          {firstFailedTest ? (
            <div>
              <h3>Test Case Failed</h3>
              <p>Input: {firstFailedTest.input}</p>
              <p>Expected Output: {firstFailedTest.expectedOutput}</p>
              <p>Actual Output: {firstFailedTest.actualOutput}</p>
            </div>
          ) : (
            <h3>All Test Cases Passed</h3>
          )}
          <p>Test Cases Passed: {passedCount}</p>
        </div>
      )}
    </div>
  );
};

export default CodeEditorPage;
