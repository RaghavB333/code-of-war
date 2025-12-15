"use client";
import dynamic from "next/dynamic";
import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import AnalysisChart from "@/components/Chart";
import { UserDataContext } from "@/context/UserContext";
import UserProtectWrapper from '@/components/UserProtectWrapper'
import { useSearchParams } from "next/navigation";
import { Code, Play, Send, BarChart3, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';

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
  const [leftWidth, setLeftWidth] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const containerRef = useRef(null);



  const { user } = useContext(UserDataContext);

  const searchParams = useSearchParams();
  const islobby = searchParams.get("lobby");
  console.log("lobby status: ", islobby);



    useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      if (newWidth > 20 && newWidth < 80) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);



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
      setIsAnalyzing(true); // Start loader
      const analyzeUrl = process.env.NEXT_PUBLIC_ANALZYER;
      console.log(language)
      const response = await axios.post(`${analyzeUrl}/analyze`, { code: AnalysisCode, language: language });
      console.log(response.data)
      setAnalysisResults(response.data); // Store results for visualization
    } catch (error) {
      console.error("Error analyzing code:", error);
      alert("An error occurred while analyzing the code.");
    } finally {
      setIsAnalyzing(false);

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
        //const judge0URI = process.env.Judge0_URI || 'https://43.204.216.76/';

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

        const response = await axios.post('/api/judge0/submit', {
          source_code: wrappedCode,
          language_id: languageMap[language],
          stdin: stdin,
        });
        const { token } = response.data;
        // console.log("Judge0 Token:", token);  // Log the token to see if it's being generated

        // Poll the submission status until it's not in the "In Queue" state
        let result;
        let isPolling = true;
        while (isPolling) {
          const statusResponse = await axios.post('/api/judge0/status', { token });
          const status = statusResponse.data.status;

          if (status.id === 3 || status.id === 4 || status.id === 5) {
            result = statusResponse.data;
            break;
          }
          await new Promise((res) => setTimeout(res, 2000));
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
    console.log("user email ", user._id);
    if (results) {
      const submission = {
        userId: user._id,
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



    <div className="min-h-screen bg-background">
      <div ref={containerRef} className="h-screen flex flex-col">
        {/* Header */}
        {/* <div className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              CodeChallenge
            </h1>
          </div>
          <a
            href="/submissions"
            className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            View Submissions
          </a>
        </div> */}

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel: Problem Description */}
          <div 
            className="bg-background backdrop-blur-sm overflow-y-auto"
            style={{ width: `${leftWidth}%` }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white">{problemTitle}</h2>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-semibold rounded-full shadow-lg">
                      Easy
                    </span>
                  </div>
                  <Link
                    href="/submissions"
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-transform transform hover:scale-105 w-full sm:w-auto text-center"
                  >
                    Submissions
                  </Link>
                </div>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 shadow-xl">
                  <h3 className="text-lg font-semibold text-indigo-400 mb-3">Description</h3>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{problemDesc}</p>
                </div>

                {/* Examples */}
                <div>
                  <h3 className="text-lg font-semibold text-indigo-400 mb-4">Examples</h3>
                  <div className="space-y-4">
                    {examples.map((example, index) => (
                      <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 shadow-lg hover:border-indigo-500/50 transition-all duration-200">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-semibold text-emerald-400 min-w-[60px]">Input:</span>
                            <code className="text-sm font-mono bg-slate-900/70 px-3 py-1.5 rounded-lg text-slate-200 flex-1">
                              {example.input}
                            </code>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-sm font-semibold text-purple-400 min-w-[60px]">Output:</span>
                            <code className="text-sm font-mono bg-slate-900/70 px-3 py-1.5 rounded-lg text-slate-200 flex-1">
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
          </div>

          {/* Resizer */}
          <div
            className="w-1 bg-slate-700/50 hover:bg-indigo-500 cursor-col-resize transition-colors relative group"
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-0.5">
                <div className="w-1 h-8 bg-white rounded-full"></div>
                <div className="w-1 h-8 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Right Panel: Code Editor */}
          <div 
            className=" backdrop-blur-sm overflow-y-auto flex flex-col"
            style={{ width: `${100 - leftWidth}%` }}
          >
            <div className="p-6 flex-1 flex flex-col">
              {/* Editor Controls */}
              <div className="flex items-center justify-between gap-4 mb-4">
                <select
                  onChange={handleLanguageChange}
                  value={language}
                  className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-750"
                >
                  <option value="" disabled>Select Language</option>
                  {supportedLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.charAt(0).toUpperCase() + lang.slice(1)}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={runTestCases}
                  disabled={isRunning}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Run Tests
                    </>
                  )}
                </button>
              </div>

              {/* Code Editor */}

                        {language && (
            <MonacoEditor
              height="70vh"
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
              {/* {language && (
                <div className="flex-1 bg-slate-950 rounded-xl border border-slate-700/50 shadow-2xl overflow-hidden mb-4">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-full p-4 bg-slate-950 text-slate-200 font-mono text-sm focus:outline-none resize-none"
                    placeholder="Write your code here..."
                    style={{ minHeight: '400px' }}
                  />
                </div>
              )} */}

              {/* Test Results */}
              {results && hasRunTests && (
                <div className="space-y-4 mt-3">
                  <div className="bg-background rounded-xl p-5 border border-slate-700/50 shadow-xl">
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                      Test Results
                    </h3>
                    
                    {isRunning ? (
                      <div className="flex items-center gap-3 text-slate-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Running test cases...</span>
                      </div>
                    ) : results.allPassed ? (
                      <div className="flex items-center gap-3 text-green-400">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-semibold text-lg">All test cases passed!</span>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-red-400 mb-3">
                          <XCircle className="w-6 h-6" />
                          <span className="font-semibold">Test case failed</span>
                        </div>
                        <div className="space-y-2 bg-slate-900/50 rounded-lg p-4">
                          <div>
                            <span className="text-sm font-semibold text-slate-400">Input:</span>
                            <code className="ml-2 text-sm font-mono text-slate-200">
                              {JSON.stringify(results.inputs)}
                            </code>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-400">Expected:</span>
                            <code className="ml-2 text-sm font-mono text-green-400">
                              {results.expectedOutput}
                            </code>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-400">Actual:</span>
                            <code className="ml-2 text-sm font-mono text-red-400">
                              {results.actualOutput}
                            </code>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {results.allPassed && (
                    <div className="flex gap-3">
                      <button
                        onClick={submitSolution}
                        disabled={hasSubmitted}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                          hasSubmitted
                            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transform hover:scale-105"
                        }`}
                      >
                        <Send className="w-4 h-4" />
                        {hasSubmitted ? "Submitted ✓" : "Submit Solution"}
                      </button>

                      <button
                        onClick={analyzeCode}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Analyze Code
                      </button>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {isAnalyzing ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    </div>
                  ) : analysisResults && (
                    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50 shadow-xl">
                      <h3 className="text-lg font-semibold text-white mb-4">Code Analysis</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/50 rounded-lg p-4">
                            <div className="text-sm text-slate-400 mb-1">Time Complexity</div>
                            <div className="text-xl font-bold text-indigo-400">{analysisResults.timeComplexity}</div>
                          </div>
                          <div className="bg-slate-900/50 rounded-lg p-4">
                            <div className="text-sm text-slate-400 mb-1">Space Complexity</div>
                            <div className="text-xl font-bold text-purple-400">{analysisResults.spaceComplexity}</div>
                          </div>
                        </div>
                        
                        {['performance', 'readability', 'efficiency'].map((metric) => (
                          <div key={metric}>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-slate-300 capitalize">{metric}</span>
                              <span className="text-white font-semibold">{analysisResults[metric]}%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                                style={{ width: `${analysisResults[metric]}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>














      {/* <div className="min-h-screen flex flex-col lg:flex-row">

        
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
                  <div key={index} className="bg-gray-800 max-w-80 rounded-lg p-4 border border-gray-200">
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
              height="70vh"
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

              
              {isAnalyzing ? (
                <div className="mt-8 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
                </div>
              ) : analysisResults && (
                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
                  <AnalysisChart data={analysisResults} />
                </div>
              )}
            </>
          )}
        </div>
      </div> */}
    </UserProtectWrapper>
  );

};

export default CodeEditorPage;