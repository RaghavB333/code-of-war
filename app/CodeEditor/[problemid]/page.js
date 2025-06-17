"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import Link from "next/link";
import AnalysisChart from "@/components/Chart";
import { UserDataContext } from "@/context/UserContext";
import UserProtectWrapper from '@/components/UserProtectWrapper'
import { useSearchParams } from "next/navigation";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const supportedLanguages = ["javascript", "python", "java", "cpp"];
const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 53,
};


const wrapCode = (language, userCode, languageWrappers) => {
  const wrapper = languageWrappers[language];
  if (!wrapper) return userCode;
  return wrapper.replace("{code}", userCode);
};

const CodeEditorPage = ({ params }) => {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [problemTitle, setProblemTitle] = useState("");
  const [examples, setExamples] = useState([]);
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [problemId, setProblemId] = useState("")
  const [problemDesc, setproblemDesc] = useState("")
  const [submissions, setSubmissions] = useState([]); // Added for submissions
  const [hasRunTests, setHasRunTests] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [languageWrappers, setlanguageWrappers] = useState([])
  const [AnalysisCode, setAnalysisCode] = useState("")
  const [analysisTC, setanalysisTC] = useState()


  const { user } = useContext(UserDataContext);

  const searchParams = useSearchParams();
  const islobby = searchParams.get("lobby");
  console.log("lobby status: ", islobby);




  useEffect(() => {
    if (typeof window !== "undefined") {
      const id = window.location.pathname.split("/").pop();
      setProblemId(id);
    }
  }, []);

  useEffect(() => {
    if (!problemId) return;

    const fetchProblem = async () => {
      try {
        const response = await axios.get(`/api/problems/${problemId}`);
        const problem = response.data;

        // Log the fetched data
        console.log("Fetched Problem Data:", problem);

        setProblemTitle(problem.title || "");
        setExamples(problem.examples || []);
        setTestCases(problem.testCases || []);
        setproblemDesc(problem.description || "")
        setlanguageWrappers(problem.languageWrappers)
        if (problem.predefinedCode) {
          setCode(problem.predefinedCode.python || "// Write your code here...");
        }
      } catch (error) {
        console.error("Error fetching problem:", error.response?.data || error.message);
      }
    };

    fetchProblem();
  }, [problemId]);

  const [analysisResults, setAnalysisResults] = useState(null);


  const analyzeCode = async () => {
    if (!code) {
      alert("Please write some code before analyzing!");
      return;
    }

    try {
      const analyzeUrl = process.env.NEXT_PUBLIC_ANALZYER;
      console.log(language)
      const response = await axios.post(`${analyzeUrl}/analyze`, { code: AnalysisCode, language: language });
      console.log(response.data)
      setAnalysisResults(response.data); // Store results for visualization
    } catch (error) {
      console.error("Error analyzing code:", error);
      alert("An error occurred while analyzing the code.");
    }
  };



  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setLanguage(selectedLanguage);
    axios.get(`/api/problems/${problemId}`).then((res) => {
      const problem = res.data;
      setCode(problem.predefinedCode[selectedLanguage] || "// Write your code here...");
    });
  };

  const runTestCases = async () => {
    if (!language) {
      alert("Please select a language first!");
      return;
    }

    setIsRunning(true);
    setHasRunTests(true);

    let allPassed = true;
    let firstFailedResult = null;

    for (const testCase of testCases) {
      try {
        console.log("Test Case Input:", testCase.inputs);
        console.log("Test Case Expected Output:", testCase.expectedOutput);

        const wrappedCode = wrapCode(language, code, languageWrappers);
        console.log("Wrapped Code:", wrappedCode);
        setAnalysisCode(wrappedCode)

        // Get Judge0 URI from environment variable
        const judge0URI = process.env.Judge0_URI || 'http://43.204.216.76:2358/';

        const formatInputForLanguage = (language, inputs) => {
          // For Python and JavaScript, we send JSON-formatted input
          if (language === "python" || language === "javascript") {
            return JSON.stringify(inputs);
          }

          // For C++ and Java, we flatten the values (supporting nested arrays)
          const flattenInput = (value) => {
            if (Array.isArray(value)) {
              return value.map(flattenInput).join(" ");
            } else if (typeof value === "object" && value !== null) {
              return Object.values(value).map(flattenInput).join(" ");
            } else {
              return String(value);
            }
          };

          return Object.values(inputs).map(flattenInput).join(" ");
        };


        // Usage:
        const stdin = formatInputForLanguage(language, testCase.inputs);
        setanalysisTC(stdin[0])

        const response = await axios.post(
          `${judge0URI}submissions`,
          {
            source_code: wrappedCode,
            language_id: languageMap[language],
            stdin: stdin,
          }
        );


        const { token } = response.data;
        // console.log("Judge0 Token:", token);  // Log the token to see if it's being generated

        // Poll the submission status until it's not in the "In Queue" state
        let result;
        let isPolling = true;
        while (isPolling) {
          const statusResponse = await axios.get(
            `${judge0URI}submissions/${token}`
          );
          console.log("Polling Status Response:", statusResponse.data);

          const { status, stdout, stderr } = statusResponse.data;
          if (status.id === 3) {  // Status 3 is "Accepted"
            isPolling = false;
            result = statusResponse.data;
            break;
          } else if (status.id === 4 || status.id === 5) {  // Errors or compilation failed
            isPolling = false;
            result = statusResponse.data;
            break;
          } else {
            // Wait for 2 seconds before checking again
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // Handle the final result
        if (result && result.stdout) {
          const actualOutput = result.stdout.trim();
          const expectedOutput = String(testCase.expectedOutput).trim();

          if (actualOutput !== expectedOutput) {
            allPassed = false;
            firstFailedResult = {
              inputs: testCase.inputs,
              expectedOutput,
              actualOutput,
            };
            break;
          }
        } else {
          allPassed = false;
          firstFailedResult = {
            inputs: testCase.inputs,
            expectedOutput: testCase.expectedOutput,
            actualOutput: "Error during execution",
          };
          break;
        }
      } catch (error) {
        allPassed = false;
        firstFailedResult = {
          inputs: testCase.inputs,
          expectedOutput: testCase.expectedOutput,
          actualOutput: "Error during execution",
        };
        break;
      }
    }

    setResults(allPassed ? { allPassed: true } : { allPassed: false, ...firstFailedResult });
    setIsRunning(false);
  };


  const submitSolution = async () => {
    console.log("user email ", user.email);
    if (results) {
      console.log("fjdjdfjproblemid", problemId);
      const submission = {
        username: user.email,
        problemId: problemId,
        code,
        language,
        results,
        islobby,
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await axios.post('/api/submissions', submission);
        alert('Solution submitted successfully!');
        setSubmissions((prev) => [...prev, submission]);
        setHasSubmitted(true);

      } catch (error) {
        console.error('Error submitting solution:', error);
        alert('Error submitting solution.');
      }
    } else {
      alert('Please run the test cases before submitting.');
    }
  };

  return (
    <UserProtectWrapper>
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* Left Panel: Problem Description */}
        <div className="w-full lg:w-1/2 bg-background p-4 sm:p-6 overflow-y-auto text-white max-h-[50vh] lg:max-h-none">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-white">{problemTitle}</h1>
              <div className="ml-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  Easy
                </span>
              </div>
            </div>
            <Link
              href="/submissions"
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-transform transform hover:scale-105 w-full sm:w-auto text-center"
            >
              Submissions
            </Link>
          </div>

          <div className="space-y-6">
            <div>
              <div className="prose max-w-none">
                <p className="text-white leading-relaxed whitespace-pre-wrap">{problemDesc}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Examples</h2>
              <div className="space-y-4">
                {examples.map((example, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-200">
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-white">Input:</span>
                        <code className="ml-2 text-sm font-mono bg-gray-500 px-2 py-1 rounded text-white">
                          {example.input}
                        </code>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">Output:</span>
                        <code className="ml-2 text-sm font-mono bg-gray-500 px-2 py-1 rounded text-white">
                          {example.output}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="w-full lg:w-1/2 bg-background text-white p-4 sm:p-6 flex flex-col overflow-y-auto max-h-[50vh] lg:max-h-none">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <select
              onChange={handleLanguageChange}
              value={language}
              className="p-2 bg-gray-700 rounded-lg text-white w-full sm:w-auto"
            >
              <option value="" disabled>Select Language</option>
              {supportedLanguages.map((lang) => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
            <button
              onClick={runTestCases}
              disabled={isRunning}
              className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 w-full sm:w-auto"
            >
              {isRunning ? "Running..." : "Run Test Cases"}
            </button>
          </div>

          {language && (
            <MonacoEditor
              height="40vh"
              language={language}
              value={code}
              onChange={(value) => setCode(value)}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                theme: "vs-dark",
              }}
            />
          )}

          {/* Test Case Results */}
          {results && hasRunTests && (
            <>
              <div className="mt-4 bg-gray-800 p-4 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Results</h2>
                {isRunning ? (
                  <p className="text-gray-500">Running...</p>
                ) : results ? (
                  results.allPassed ? (
                    <p className="text-green-500">All test cases passed!</p>
                  ) : (
                    <div className="text-red-500">
                      <p><strong>Input:</strong> {JSON.stringify(results.inputs)}</p>
                      <p><strong>Expected Output:</strong> {results.expectedOutput}</p>
                      <p><strong>Actual Output:</strong> {results.actualOutput}</p>
                    </div>
                  )
                ) : null}
              </div>

              {/* Submit & Analyze Buttons */}
              {results.allPassed && (
                <>
                  <button
                    onClick={submitSolution}
                    disabled={hasSubmitted}
                    className={`mt-4 px-4 py-2 rounded-lg ${hasSubmitted
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                      }`}
                  >
                    {hasSubmitted ? "Solution Submitted" : "Submit Solution"}
                  </button>

                  <div className="mt-4">
                    <button
                      onClick={analyzeCode}
                      className="bg-yellow-500 px-4 py-2 rounded-lg hover:bg-yellow-600"
                    >
                      Analyze Code
                    </button>
                  </div>
                </>
              )}

              {/* Analysis Chart */}
              {analysisResults && (
                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
                  <AnalysisChart data={analysisResults} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </UserProtectWrapper>
  );

};

export default CodeEditorPage;