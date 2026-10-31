"use client";
// import dynamic from "next/dynamic";
// import { useState, useEffect, useContext, useRef } from "react";
// import axios from "axios";
// import Link from "next/link";
// import AnalysisChart from "@/components/Chart";
// import { UserDataContext } from "@/context/UserContext";
// import UserProtectWrapper from '@/components/UserProtectWrapper'
// import { useSearchParams } from "next/navigation";
// import { Code, Play, Send, BarChart3, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

// const supportedLanguages = ["javascript", "python", "java", "cpp"];
// const languageMap = {
//   javascript: 63,
//   python: 71,
//   java: 62,
//   cpp: 53,
// };


// const wrapCode = (language, userCode, languageWrappers) => {
//   const wrapper = languageWrappers[language];
//   if (!wrapper) return userCode;
//   return wrapper.replace("{code}", userCode);
// };

// const CodeEditorPage = ({ params }) => {
//   const [leftWidth, setLeftWidth] = useState(50);
//   const [isDragging, setIsDragging] = useState(false);
//   const [code, setCode] = useState("");
//   const [language, setLanguage] = useState("");
//   const [testCases, setTestCases] = useState([]);
//   const [problemTitle, setProblemTitle] = useState("");
//   const [examples, setExamples] = useState([]);
//   const [results, setResults] = useState([]);
//   const [isRunning, setIsRunning] = useState(false);
//   const [problemId, setProblemId] = useState("")
//   const [problemDesc, setproblemDesc] = useState("")
//   const [submissions, setSubmissions] = useState([]); // Added for submissions
//   const [hasRunTests, setHasRunTests] = useState(false);
//   const [hasSubmitted, setHasSubmitted] = useState(false);
//   const [languageWrappers, setlanguageWrappers] = useState([])
//   const [AnalysisCode, setAnalysisCode] = useState("")
//   const [analysisTC, setanalysisTC] = useState()
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const containerRef = useRef(null);



//   const { user } = useContext(UserDataContext);

//   const searchParams = useSearchParams();
//   const islobby = searchParams.get("lobby");
//   console.log("lobby status: ", islobby);



//     useEffect(() => {
//     const handleMouseMove = (e) => {
//       if (!isDragging || !containerRef.current) return;
      
//       const container = containerRef.current;
//       const containerRect = container.getBoundingClientRect();
//       const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
//       if (newWidth > 20 && newWidth < 80) {
//         setLeftWidth(newWidth);
//       }
//     };

//     const handleMouseUp = () => {
//       setIsDragging(false);
//     };

//     if (isDragging) {
//       document.addEventListener('mousemove', handleMouseMove);
//       document.addEventListener('mouseup', handleMouseUp);
//     }

//     return () => {
//       document.removeEventListener('mousemove', handleMouseMove);
//       document.removeEventListener('mouseup', handleMouseUp);
//     };
//   }, [isDragging]);



//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const id = window.location.pathname.split("/").pop();
//       setProblemId(id);
//     }
//   }, []);

//   useEffect(() => {
//     if (!problemId) return;

//     const fetchProblem = async () => {
//       try {
//         const response = await axios.get(`/api/problems/${problemId}`);
//         const problem = response.data;

//         // Log the fetched data
//         console.log("Fetched Problem Data:", problem);

//         setProblemTitle(problem.title || "");
//         setExamples(problem.examples || []);
//         setTestCases(problem.testCases || []);
//         setproblemDesc(problem.description || "")
//         setlanguageWrappers(problem.languageWrappers)
//         if (problem.predefinedCode) {
//           setCode(problem.predefinedCode.python || "// Write your code here...");
//         }
//       } catch (error) {
//         console.error("Error fetching problem:", error.response?.data || error.message);
//       }
//     };

//     fetchProblem();
//   }, [problemId]);

//   const [analysisResults, setAnalysisResults] = useState(null);


//   const analyzeCode = async () => {
//     if (!code) {
//       alert("Please write some code before analyzing!");
//       return;
//     }

//     try {
//       setIsAnalyzing(true); // Start loader
//       const analyzeUrl = process.env.NEXT_PUBLIC_ANALZYER;
//       console.log(language)
//       const response = await axios.post(`${analyzeUrl}/analyze`, { code: AnalysisCode, language: language });
//       console.log(response.data)
//       setAnalysisResults(response.data); // Store results for visualization
//     } catch (error) {
//       console.error("Error analyzing code:", error);
//       alert("An error occurred while analyzing the code.");
//     } finally {
//       setIsAnalyzing(false);

//     }
//   };



//   const handleLanguageChange = (e) => {
//     const selectedLanguage = e.target.value;
//     setLanguage(selectedLanguage);
//     axios.get(`/api/problems/${problemId}`).then((res) => {
//       const problem = res.data;
//       setCode(problem.predefinedCode[selectedLanguage] || "// Write your code here...");
//     });
//   };

//   const runTestCases = async () => {
//     if (!language) {
//       alert("Please select a language first!");
//       return;
//     }

//     setIsRunning(true);
//     setHasRunTests(true);

//     let allPassed = true;
//     let firstFailedResult = null;

//     for (const testCase of testCases) {
//       try {
//         console.log("Test Case Input:", testCase.inputs);
//         console.log("Test Case Expected Output:", testCase.expectedOutput);

//         const wrappedCode = wrapCode(language, code, languageWrappers);
//         console.log("Wrapped Code:", wrappedCode);
//         setAnalysisCode(wrappedCode)

//         // Get Judge0 URI from environment variable
//         // const judge0URI = process.env.Judge0_URI || 'https://43.204.216.76/';

//         const formatInputForLanguage = (language, inputs) => {
//           // For Python and JavaScript, we send JSON-formatted input
//           if (language === "python" || language === "javascript") {
//             return JSON.stringify(inputs);
//           }

//           // For C++ and Java, we flatten the values (supporting nested arrays)
//           const flattenInput = (value) => {
//             if (Array.isArray(value)) {
//               return value.map(flattenInput).join(" ");
//             } else if (typeof value === "object" && value !== null) {
//               return Object.values(value).map(flattenInput).join(" ");
//             } else {
//               return String(value);
//             }
//           };

//           return Object.values(inputs).map(flattenInput).join(" ");
//         };


//         // Usage:
//         const stdin = formatInputForLanguage(language, testCase.inputs);
//         setanalysisTC(stdin[0])

//         const response = await axios.post('/api/judge0/submit', {
//           source_code: wrappedCode,
//           language_id: languageMap[language],
//           stdin: stdin,
//         });
//         const { token } = response.data;
//         // console.log("Judge0 Token:", token);  // Log the token to see if it's being generated

//         // Poll the submission status until it's not in the "In Queue" state
//         let result;
//         let isPolling = true;
//         while (isPolling) {
//           const statusResponse = await axios.post('/api/judge0/status', { token });
//           const status = statusResponse.data.status;

//           if (status.id === 3 || status.id === 4 || status.id === 5) {
//             result = statusResponse.data;
//             break;
//           }
//           await new Promise((res) => setTimeout(res, 2000));
//         }


//         // Handle the final result
//         if (result && result.stdout) {
//           const actualOutput = result.stdout.trim();
//           const expectedOutput = String(testCase.expectedOutput).trim();

//           if (actualOutput !== expectedOutput) {
//             allPassed = false;
//             firstFailedResult = {
//               inputs: testCase.inputs,
//               expectedOutput,
//               actualOutput,
//             };
//             break;
//           }
//         } else {
//           allPassed = false;
//           firstFailedResult = {
//             inputs: testCase.inputs,
//             expectedOutput: testCase.expectedOutput,
//             actualOutput: "Error during execution",
//           };
//           break;
//         }
//       } catch (error) {
//         allPassed = false;
//         firstFailedResult = {
//           inputs: testCase.inputs,
//           expectedOutput: testCase.expectedOutput,
//           actualOutput: "Error during execution",
//         };
//         break;
//       }
//     }

//     setResults(allPassed ? { allPassed: true } : { allPassed: false, ...firstFailedResult });
//     setIsRunning(false);
//   };


//   const submitSolution = async () => {
//     console.log("user email ", user._id);
//     if (results) {
//       const submission = {
//         userId: user._id,
//         problemId: problemId,
//         code,
//         language,
//         results,
//         islobby,
//         timestamp: new Date().toISOString(),
//       };

//       try {
//         const response = await axios.post('/api/submissions', submission);
//         alert('Solution submitted successfully!');
//         setSubmissions((prev) => [...prev, submission]);
//         setHasSubmitted(true);

//       } catch (error) {
//         console.error('Error submitting solution:', error);
//         alert('Error submitting solution.');
//       }
//     } else {
//       alert('Please run the test cases before submitting.');
//     }
//   };

//   return (
//     <UserProtectWrapper>



//     <div className="min-h-screen bg-background">
//       <div ref={containerRef} className="h-screen flex flex-col">

//         {/* Main Content */}
//         <div className="flex-1 flex overflow-hidden">
//           {/* Left Panel: Problem Description */}
//           <div 
//             className="bg-background backdrop-blur-sm overflow-y-auto"
//             style={{ width: `${leftWidth}%` }}
//           >
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center justify-between w-full">
//                   <div className="flex items-center gap-4">
//                     <h2 className="text-2xl font-bold text-white">{problemTitle}</h2>
//                     <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-semibold rounded-full shadow-lg">
//                       Easy
//                     </span>
//                   </div>
//                   <Link
//                     href="/submissions"
//                     className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-transform transform hover:scale-105 w-full sm:w-auto text-center"
//                   >
//                     Submissions
//                   </Link>
//                 </div>
//               </div>

//               <div className="space-y-6">
//                 {/* Description */}
//                 <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 shadow-xl">
//                   <h3 className="text-lg font-semibold text-indigo-400 mb-3">Description</h3>
//                   <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{problemDesc}</p>
//                 </div>

//                 {/* Examples */}
//                 <div>
//                   <h3 className="text-lg font-semibold text-indigo-400 mb-4">Examples</h3>
//                   <div className="space-y-4">
//                     {examples.map((example, index) => (
//                       <div key={index} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 shadow-lg hover:border-indigo-500/50 transition-all duration-200">
//                         <div className="space-y-2">
//                           <div className="flex items-start gap-2">
//                             <span className="text-sm font-semibold text-emerald-400 min-w-[60px]">Input:</span>
//                             <code className="text-sm font-mono bg-slate-900/70 px-3 py-1.5 rounded-lg text-slate-200 flex-1">
//                               {example.input}
//                             </code>
//                           </div>
//                           <div className="flex items-start gap-2">
//                             <span className="text-sm font-semibold text-purple-400 min-w-[60px]">Output:</span>
//                             <code className="text-sm font-mono bg-slate-900/70 px-3 py-1.5 rounded-lg text-slate-200 flex-1">
//                               {example.output}
//                             </code>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Resizer */}
//           <div
//             className="w-1 bg-slate-700/50 hover:bg-indigo-500 cursor-col-resize transition-colors relative group"
//             onMouseDown={() => setIsDragging(true)}
//           >
//             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
//               <div className="flex gap-0.5">
//                 <div className="w-1 h-8 bg-white rounded-full"></div>
//                 <div className="w-1 h-8 bg-white rounded-full"></div>
//               </div>
//             </div>
//           </div>

//           {/* Right Panel: Code Editor */}
//           <div 
//             className=" backdrop-blur-sm overflow-y-auto flex flex-col"
//             style={{ width: `${100 - leftWidth}%` }}
//           >
//             <div className="p-6 flex-1 flex flex-col">
//               {/* Editor Controls */}
//               <div className="flex items-center justify-between gap-4 mb-4">
//                 <select
//                   onChange={handleLanguageChange}
//                   value={language}
//                   className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer hover:bg-slate-750"
//                 >
//                   <option value="" disabled>Select Language</option>
//                   {supportedLanguages.map((lang) => (
//                     <option key={lang} value={lang}>
//                       {lang.charAt(0).toUpperCase() + lang.slice(1)}
//                     </option>
//                   ))}
//                 </select>
                
//                 <button
//                   onClick={runTestCases}
//                   disabled={isRunning}
//                   className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
//                 >
//                   {isRunning ? (
//                     <>
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                       Running...
//                     </>
//                   ) : (
//                     <>
//                       <Play className="w-4 h-4" />
//                       Run Tests
//                     </>
//                   )}
//                 </button>
//               </div>

//               {/* Code Editor */}

//                         {language && (
//             <MonacoEditor
//               height="70vh"
//               language={language}
//               value={code}
//               onChange={(value) => setCode(value)}
//               options={{
//                 fontSize: 14,
//                 minimap: { enabled: false },
//                 theme: "vs-dark",
//               }}
//             />
//           )}

//               {/* Test Results */}
//               {results && hasRunTests && (
//                 <div className="space-y-4 mt-3">
//                   <div className="bg-background rounded-xl p-5 border border-slate-700/50 shadow-xl">
//                     <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
//                       <BarChart3 className="w-5 h-5 text-indigo-400" />
//                       Test Results
//                     </h3>
                    
//                     {isRunning ? (
//                       <div className="flex items-center gap-3 text-slate-400">
//                         <Loader2 className="w-5 h-5 animate-spin" />
//                         <span>Running test cases...</span>
//                       </div>
//                     ) : results.allPassed ? (
//                       <div className="flex items-center gap-3 text-green-400">
//                         <CheckCircle className="w-6 h-6" />
//                         <span className="font-semibold text-lg">All test cases passed!</span>
//                       </div>
//                     ) : (
//                       <div className="space-y-3">
//                         <div className="flex items-center gap-3 text-red-400 mb-3">
//                           <XCircle className="w-6 h-6" />
//                           <span className="font-semibold">Test case failed</span>
//                         </div>
//                         <div className="space-y-2 bg-slate-900/50 rounded-lg p-4">
//                           <div>
//                             <span className="text-sm font-semibold text-slate-400">Input:</span>
//                             <code className="ml-2 text-sm font-mono text-slate-200">
//                               {JSON.stringify(results.inputs)}
//                             </code>
//                           </div>
//                           <div>
//                             <span className="text-sm font-semibold text-slate-400">Expected:</span>
//                             <code className="ml-2 text-sm font-mono text-green-400">
//                               {results.expectedOutput}
//                             </code>
//                           </div>
//                           <div>
//                             <span className="text-sm font-semibold text-slate-400">Actual:</span>
//                             <code className="ml-2 text-sm font-mono text-red-400">
//                               {results.actualOutput}
//                             </code>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Action Buttons */}
//                   {results.allPassed && (
//                     <div className="flex gap-3">
//                       <button
//                         onClick={submitSolution}
//                         disabled={hasSubmitted}
//                         className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
//                           hasSubmitted
//                             ? "bg-slate-700 text-slate-400 cursor-not-allowed"
//                             : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transform hover:scale-105"
//                         }`}
//                       >
//                         <Send className="w-4 h-4" />
//                         {hasSubmitted ? "Submitted ✓" : "Submit Solution"}
//                       </button>

//                       <button
//                         onClick={analyzeCode}
//                         className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105"
//                       >
//                         <BarChart3 className="w-4 h-4" />
//                         Analyze Code
//                       </button>
//                     </div>
//                   )}

//                   {/* Analysis Results */}
//                   {isAnalyzing ? (
//                     <div className="flex justify-center items-center py-8">
//                       <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
//                     </div>
//                   ) : analysisResults && (
//                     <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50 shadow-xl">
//                       <h3 className="text-lg font-semibold text-white mb-4">Code Analysis</h3>
//                       <div className="space-y-4">
//                         <div className="grid grid-cols-2 gap-4">
//                           <div className="bg-slate-900/50 rounded-lg p-4">
//                             <div className="text-sm text-slate-400 mb-1">Time Complexity</div>
//                             <div className="text-xl font-bold text-indigo-400">{analysisResults.timeComplexity}</div>
//                           </div>
//                           <div className="bg-slate-900/50 rounded-lg p-4">
//                             <div className="text-sm text-slate-400 mb-1">Space Complexity</div>
//                             <div className="text-xl font-bold text-purple-400">{analysisResults.spaceComplexity}</div>
//                           </div>
//                         </div>
                        
//                         {['performance', 'readability', 'efficiency'].map((metric) => (
//                           <div key={metric}>
//                             <div className="flex justify-between text-sm mb-2">
//                               <span className="text-slate-300 capitalize">{metric}</span>
//                               <span className="text-white font-semibold">{analysisResults[metric]}%</span>
//                             </div>
//                             <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
//                               <div 
//                                 className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
//                                 style={{ width: `${analysisResults[metric]}%` }}
//                               />
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//     </UserProtectWrapper>
//   );

// };

// export default CodeEditorPage;





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

// "use client";

import dynamic from "next/dynamic";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserDataContext } from "@/context/UserContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  CheckSquare,
  Code2,
  FileText,
  History,
  Keyboard,
  LayoutPanelLeft,
  Loader2,
  Play,
  RotateCcw,
  Settings,
  Terminal,
  UploadCloud,
  X,
  Timer,
  TimerReset,
  ChevronLeft,
  Pause,
  RefreshCw,
  XCircle,
  Clock,
  Cpu,
  Copy,
} from "lucide-react";
import { trusted } from "mongoose";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-gray-500">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  ),
});

/* ------------------------------ constants ------------------------------ */

// Change these if your routes are different.
const LOGIN_ROUTE = "/Login";
const REGISTER_ROUTE = "/Signup";
const PROBLEMS_ROUTE = "/problems";
const SUBMISSIONS_ROUTE = "/submissions";

const supportedLanguages = ["javascript", "python", "java", "cpp"];
const languageLabels = { javascript: "JavaScript", python: "Python", java: "Java", cpp: "C++" };

const AUTOSAVE_DELAY_MS = 500;

const SETTINGS_KEY = "ce:settings";
const LAYOUT_KEY = "ce:layout";
const LANGUAGE_KEY = "ce:language";

const DEFAULT_SETTINGS = {
  fontSize: 14,
  fontFamily: "default",
  fontLigatures: false,
  tabSize: 4,
  wordWrap: true,
  relativeLineNumbers: false,
  disableCursorBlink: false,
  minimap: false,
  theme: "vs-dark",
  runButtonsIn: "toolbar", // "toolbar" | "editor"
};
const DEFAULT_LAYOUT = { leftWidth: 50, editorHeight: 60 };

const FONT_FAMILIES = {
  default: undefined,
  consolas: "Consolas, 'Courier New', monospace",
  courier: "'Courier New', monospace",
  monospace: "monospace",
};

const DIFFICULTY_STYLES = {
  "Give Me Story": "bg-green-500/10 text-green-500",
  "Give Me Balanced": "bg-orange-500/10 text-orange-500",
  "Give Me Code Of War": "bg-red-500/10 text-red-500",
};


const SCROLLBAR_CSS = `
.themed-scroll { scrollbar-width: thin; scrollbar-color: #3a3a3a transparent; }
.themed-scroll::-webkit-scrollbar { width: 8px; height: 8px; }
.themed-scroll::-webkit-scrollbar-track { background: transparent; }
.themed-scroll::-webkit-scrollbar-thumb { background-color: #3a3a3a; border-radius: 9999px; border: 2px solid transparent; background-clip: content-box; }
.themed-scroll::-webkit-scrollbar-thumb:hover { background-color: #5a5a5a; }
.themed-scroll::-webkit-scrollbar-corner { background: transparent; }
`;

/* ------------------------------- helpers ------------------------------- */

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full – ignore */
  }
};

// const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const formatValue = (value) => (typeof value === "string" ? value : JSON.stringify(value));

// Function replacer so "$&"-style sequences in user code are never interpreted.
const wrapCode = (language, userCode, languageWrappers) => {
  const wrapper = languageWrappers?.[language];
  if (!wrapper) return userCode;
  return wrapper.replace("{code}", () => userCode);
};

const getStarterCode = (problem, language) =>
  problem?.predefinedCode?.[language] ||
  (language === "python" ? "# Write your code here..." : "// Write your code here...");


const verdictTone = (verdict) =>
  verdict === "Accepted"
    ? "text-green-400"
    : verdict === "Time Limit Exceeded" || verdict === "Memory Limit Exceeded"
    ? "text-orange-400"
    : "text-red-400";
 
const formatMemory = (kb) => (kb == null ? null : `${(kb / 1024).toFixed(1)} MB`);
 
function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}



/* ------------------------------ markdown ------------------------------ */
 
const markdownComponents = {
  h1: ({ children }) => <h2 className="mb-3 mt-6 text-xl font-bold text-white">{children}</h2>,
  h2: ({ children }) => <h3 className="mb-2 mt-5 text-lg font-semibold text-white">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-2 mt-4 text-base font-semibold text-white">{children}</h4>,
  h4: ({ children }) => <h5 className="mb-2 mt-3 text-sm font-semibold text-white">{children}</h5>,
  p: ({ children }) => <p className="my-3 leading-relaxed text-gray-300">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }) => <em className="italic text-gray-200">{children}</em>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1 pl-6 text-gray-300">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1 pl-6 text-gray-300">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-2 border-gray-700 pl-4 text-gray-400">{children}</blockquote>
  ),
  hr: () => <hr className="my-5 border-gray-800" />,
  pre: ({ children }) => (
    <pre className="themed-scroll my-3 overflow-x-auto rounded-lg bg-white/5 p-4 text-sm text-gray-200">{children}</pre>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className || "") || String(children).includes("\n");
    return isBlock ? (
      <code className="font-mono text-sm">{children}</code>
    ) : (
      <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-gray-200">{children}</code>
    );
  },
  table: ({ children }) => (
    <div className="themed-scroll my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-gray-800 bg-white/5 px-3 py-2 text-left font-semibold text-white">{children}</th>
  ),
  td: ({ children }) => <td className="border border-gray-800 px-3 py-2 text-gray-300">{children}</td>,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt ?? ""} loading="lazy" className="my-4 max-w-full rounded-lg border border-gray-800" />
  ),
};
 
function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {children}
    </ReactMarkdown>
  );
}

/* ---------------------------- small components ---------------------------- */

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
        checked ? "bg-blue-500" : "bg-gray-600"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
          checked ? "translate-x-4" : ""
        }`}
      />
    </button>
  );
}

function SelectBox({ value, onChange, options, label }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer rounded-md border border-gray-700 bg-[#262626] px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm font-medium text-gray-200">{label}</span>
      {children}
    </div>
  );
}

function Resizer({ direction, active, onPointerDown }) {
  const vertical = direction === "v";
  return (
    <div
      role="separator"
      aria-orientation={vertical ? "vertical" : "horizontal"}
      onPointerDown={onPointerDown}
      className={`group hidden shrink-0 touch-none items-center justify-center lg:flex ${
        vertical ? "w-2 cursor-col-resize" : "h-2 cursor-row-resize"
      }`}
    >
      <div
        className={`rounded-full transition-colors ${vertical ? "h-10 w-1" : "h-1 w-10"} ${
          active ? "bg-blue-500" : "bg-gray-700 group-hover:bg-blue-500"
        }`}
      />
    </div>
  );
}

function LabeledBox({ label, value, tone = "text-gray-100" }) {
  return (
    <div className="mb-3">
      <div className="mb-1 text-xs font-medium text-gray-400">{label}</div>
      <div className={`whitespace-pre-wrap break-all rounded-lg bg-white/5 px-3 py-2.5 font-mono text-sm ${tone}`}>
        {value === "" || value == null ? "—" : formatValue(value)}
      </div>
    </div>
  );
}

function InputBlocks({ inputs }) {
  const entries =
    inputs && typeof inputs === "object" && !Array.isArray(inputs)
      ? Object.entries(inputs)
      : [["input", inputs]];
  return (
    <>
      {entries.map(([name, value]) => (
        <div key={name} className="mb-3">
          <div className="mb-1 text-xs font-medium text-gray-400">{name} =</div>
          <div className="whitespace-pre-wrap break-all rounded-lg bg-white/5 px-3 py-2.5 font-mono text-sm text-gray-100">
            {formatValue(value)}
          </div>
        </div>
      ))}
    </>
  );
}

function ModalShell({ title, onClose, children, wide = false }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`w-full overflow-hidden rounded-xl border border-gray-800 bg-[#1a1a1a] shadow-2xl ${
          wide ? "max-w-3xl" : "max-w-sm"
        }`}
      >
        {children}
      </div>
    </div>
  );
}


/* --------------------------- stopwatch / timer --------------------------- */
 
function TimerWidget({ onNotify }) {
  const [mode, setMode] = useState("stopwatch"); // "stopwatch" | "timer"
  const [hours, setHours] = useState(1);
  const [minutes, setMinutes] = useState(0);
  const [view, setView] = useState("closed"); // closed | popover | pill | collapsed
  const [status, setStatus] = useState("idle"); // idle | running | paused | finished
  const [baseMs, setBaseMs] = useState(0);
  const [startTs, setStartTs] = useState(null);
  const [targetMs, setTargetMs] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const wrapRef = useRef(null);
 
  const active = status !== "idle";
  const elapsed = status === "running" ? baseMs + (now - startTs) : baseMs;
  const displayMs = mode === "timer" ? Math.max(0, targetMs - elapsed) : elapsed;
 
  useEffect(() => {
    if (status !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [status]);
 
  // Countdown finished
  useEffect(() => {
    if (mode === "timer" && status === "running" && elapsed >= targetMs) {
      setStatus("finished");
      setBaseMs(targetMs);
      setStartTs(null);
      onNotify("info", "Time's up! ⏰");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now, status]);
 
  // Close the popover on outside click / Escape
  useEffect(() => {
    if (view !== "popover") return;
    const onDown = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setView("closed");
    const onKey = (e) => e.key === "Escape" && setView("closed");
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [view]);
 
  const start = () => {
    const t = Date.now();
    setBaseMs(0);
    setStartTs(t);
    setNow(t);
    setTargetMs((hours * 60 + minutes) * 60000);
    setStatus("running");
    setView("pill");
  };
 
  const pause = () => {
    setBaseMs(elapsed);
    setStartTs(null);
    setStatus("paused");
  };
 
  const resume = () => {
    const t = Date.now();
    setStartTs(t);
    setNow(t);
    setStatus("running");
  };
 
  const reset = () => {
    setStatus("idle");
    setBaseMs(0);
    setStartTs(null);
    setView("closed");
  };
 
  const onIconClick = () => {
    if (!active) setView((v) => (v === "popover" ? "closed" : "popover"));
    else setView((v) => (v === "pill" ? "collapsed" : "pill"));
  };
 
  const parseNum = (value, max) => clamp(parseInt(String(value).replace(/\D/g, ""), 10) || 0, 0, max);
  const timerEmpty = mode === "timer" && hours === 0 && minutes === 0;
 
  return (
    <div ref={wrapRef} className="relative flex items-center">
      {view === "pill" ? (
        <div className="flex items-center gap-1 rounded-lg bg-white/5 px-1.5 py-1">
          <button
            onClick={() => setView("collapsed")}
            aria-label="Collapse timer"
            className="rounded p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {status === "running" && (
            <button
              onClick={pause}
              aria-label="Pause"
              className="rounded p-1 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Pause className="h-4 w-4" />
            </button>
          )}
          {status === "paused" && (
            <button
              onClick={resume}
              aria-label="Resume"
              className="rounded p-1 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Play className="h-4 w-4" />
            </button>
          )}
          <span
            aria-live="off"
            className={`px-1 font-mono text-sm font-semibold tabular-nums ${
              status === "finished" ? "text-red-400" : "text-blue-400"
            }`}
          >
            {formatClock(displayMs)}
          </span>
          <button
            onClick={reset}
            aria-label="Reset"
            className="rounded p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={onIconClick}
          aria-label="Stopwatch and timer"
          aria-expanded={view === "popover"}
          title={active ? formatClock(displayMs) : "Stopwatch / Timer"}
          className={`rounded-md p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            active || view === "popover"
              ? "bg-white/10 text-blue-400"
              : "text-gray-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Timer className="h-5 w-5" />
        </button>
      )}
 
      {view === "popover" && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-gray-800 bg-[#1a1a1a] p-3 shadow-2xl">
          <div className="mb-3 flex gap-3">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setMode("stopwatch")}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMode("stopwatch")}
              aria-pressed={mode === "stopwatch"}
              className={`flex flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border px-3 py-4 transition-colors ${
                mode === "stopwatch"
                  ? "border-gray-500 bg-white/10 text-white"
                  : "border-gray-800 text-gray-500 hover:border-gray-700"
              }`}
            >
              <Timer className="h-6 w-6 text-blue-500" />
              <span className="text-sm font-medium">Stopwatch</span>
            </div>
 
            <div
              role="button"
              tabIndex={0}
              onClick={() => setMode("timer")}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMode("timer")}
              aria-pressed={mode === "timer"}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border px-3 py-4 transition-colors ${
                mode === "timer"
                  ? "flex-[1.6] border-gray-500 bg-white/10 text-white"
                  : "flex-1 border-gray-800 text-gray-500 hover:border-gray-700"
              }`}
            >
              <TimerReset className="h-6 w-6 text-orange-500" />
              {mode === "timer" ? (
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <input
                    aria-label="Hours"
                    inputMode="numeric"
                    value={String(hours).padStart(2, "0")}
                    onChange={(e) => setHours(parseNum(e.target.value, 23))}
                    className="h-9 w-10 rounded-md border border-gray-700 bg-black/30 text-center font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">hr</span>
                  <input
                    aria-label="Minutes"
                    inputMode="numeric"
                    value={String(minutes).padStart(2, "0")}
                    onChange={(e) => setMinutes(parseNum(e.target.value, 59))}
                    className="h-9 w-10 rounded-md border border-gray-700 bg-black/30 text-center font-mono text-sm text-white focus:border-blue-500 focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">min</span>
                </div>
              ) : (
                <span className="text-sm font-medium">Timer</span>
              )}
            </div>
          </div>
 
          <button
            onClick={start}
            disabled={timerEmpty}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            Start {mode === "timer" ? "Timer" : "Stopwatch"}
          </button>
        </div>
      )}
    </div>
  );
}

function SettingsModal({ settings, onChange, onResetLayout, onClose }) {
  const [tab, setTab] = useState("editor");
  const tabs = [
    { id: "layout", label: "Dynamic Layout", icon: LayoutPanelLeft },
    { id: "editor", label: "Code Editor", icon: Code2 },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  ];

  return (
    <ModalShell title="Settings" onClose={onClose} wide>
      <div className="flex h-[min(520px,80vh)] flex-col sm:flex-row">
        <aside className="shrink-0 border-b border-gray-800 bg-[#151515] p-4 sm:w-56 sm:border-b-0 sm:border-r">
          <h2 className="mb-3 text-lg font-semibold text-white">Settings</h2>
          <nav className="flex gap-1 overflow-x-auto sm:flex-col">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  tab === id ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="relative flex-1 overflow-y-auto p-5">
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="absolute right-4 top-4 rounded-md p-1 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>

          {tab === "editor" && (
            <div className="divide-y divide-gray-800 pr-8">
              <SettingRow label="Font">
                <SelectBox
                  label="Font"
                  value={settings.fontFamily}
                  onChange={(v) => onChange({ fontFamily: v })}
                  options={[
                    { value: "default", label: "Default" },
                    { value: "consolas", label: "Consolas" },
                    { value: "courier", label: "Courier New" },
                    { value: "monospace", label: "Monospace" },
                  ]}
                />
              </SettingRow>
              <SettingRow label="Font size">
                <SelectBox
                  label="Font size"
                  value={String(settings.fontSize)}
                  onChange={(v) => onChange({ fontSize: Number(v) })}
                  options={[12, 13, 14, 15, 16, 18, 20, 22].map((n) => ({ value: String(n), label: `${n}px` }))}
                />
              </SettingRow>
              <SettingRow label="Theme">
                <SelectBox
                  label="Theme"
                  value={settings.theme}
                  onChange={(v) => onChange({ theme: v })}
                  options={[
                    { value: "vs-dark", label: "Dark" },
                    { value: "hc-black", label: "High contrast" },
                    { value: "light", label: "Light" },
                  ]}
                />
              </SettingRow>
              <SettingRow label="Tab size">
                <SelectBox
                  label="Tab size"
                  value={String(settings.tabSize)}
                  onChange={(v) => onChange({ tabSize: Number(v) })}
                  options={[2, 4, 8].map((n) => ({ value: String(n), label: `${n} spaces` }))}
                />
              </SettingRow>
              <SettingRow label="Font ligatures">
                <Toggle label="Font ligatures" checked={settings.fontLigatures} onChange={(v) => onChange({ fontLigatures: v })} />
              </SettingRow>
              <SettingRow label="Word wrap">
                <Toggle label="Word wrap" checked={settings.wordWrap} onChange={(v) => onChange({ wordWrap: v })} />
              </SettingRow>
              <SettingRow label="Minimap">
                <Toggle label="Minimap" checked={settings.minimap} onChange={(v) => onChange({ minimap: v })} />
              </SettingRow>
              <SettingRow label="Relative line number">
                <Toggle
                  label="Relative line number"
                  checked={settings.relativeLineNumbers}
                  onChange={(v) => onChange({ relativeLineNumbers: v })}
                />
              </SettingRow>
              <SettingRow label="Disable cursor blinking">
                <Toggle
                  label="Disable cursor blinking"
                  checked={settings.disableCursorBlink}
                  onChange={(v) => onChange({ disableCursorBlink: v })}
                />
              </SettingRow>
            </div>
          )}

          {tab === "layout" && (
            <div className="pr-8">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="font-semibold text-white">Default layout</h3>
                <button
                  onClick={onResetLayout}
                  className="rounded-md bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
                >
                  Reset
                </button>
              </div>
              <p className="mb-3 text-sm font-medium text-gray-200">Show Run / Submit buttons in</p>
              <div className="flex gap-4">
                {[
                  { id: "toolbar", label: "Toolbar" },
                  { id: "editor", label: "Code Editor" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => onChange({ runButtonsIn: opt.id })}
                    aria-pressed={settings.runButtonsIn === opt.id}
                    className="group text-center"
                  >
                    <div
                      className={`flex h-20 w-32 flex-col gap-1 rounded-lg border-2 p-1.5 transition-colors ${
                        settings.runButtonsIn === opt.id ? "border-blue-500" : "border-gray-700 group-hover:border-gray-500"
                      }`}
                    >
                      <div className="flex h-3 items-center justify-center rounded-sm bg-gray-700">
                        {opt.id === "toolbar" && <div className="h-1.5 w-8 rounded-full bg-gray-300" />}
                      </div>
                      <div className="flex flex-1 gap-1">
                        <div className="flex-1 rounded-sm bg-gray-700" />
                        <div className="relative flex-1 rounded-sm bg-gray-700">
                          {opt.id === "editor" && (
                            <div className="absolute bottom-1 right-1 h-1.5 w-6 rounded-full bg-gray-300" />
                          )}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`mt-2 block text-sm ${
                        settings.runButtonsIn === opt.id ? "font-semibold text-white" : "text-gray-400"
                      }`}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-6 text-sm text-gray-500">
                Tip: drag the dividers between the panels to resize them. Reset puts the panels back to their default size.
              </p>
            </div>
          )}

          {tab === "shortcuts" && (
            <div className="divide-y divide-gray-800 pr-8">
              {[
                ["Run tests", "Ctrl + '"],
                ["Submit solution", "Ctrl + Enter"],
                ["Close dialogs", "Esc"],
              ].map(([name, keys]) => (
                <SettingRow key={name} label={name}>
                  <kbd className="rounded-md border border-gray-700 bg-[#262626] px-2 py-1 font-mono text-xs text-gray-300">
                    {keys}
                  </kbd>
                </SettingRow>
              ))}
              <p className="pt-3 text-xs text-gray-500">On macOS use ⌘ instead of Ctrl.</p>
            </div>
          )}
        </section>
      </div>
    </ModalShell>
  );
}


/* ------------------------------ result panel ------------------------------ */
 
function CaseDetails({ data }) {
  return (
    <>
      <InputBlocks inputs={data.inputs} />
      <LabeledBox label="Output" value={data.actual} tone={data.verdict === "Accepted" ? "text-gray-100" : "text-red-400"} />
      <LabeledBox label="Expected" value={data.expected} tone="text-green-400" />
      {data.message && (
        <div className="mb-3">
          <div className="mb-1 text-xs font-medium text-gray-400">Error</div>
          <pre className="themed-scroll max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-red-500/10 px-3 py-2.5 font-mono text-xs text-red-300">
            {data.message}
          </pre>
        </div>
      )}
    </>
  );
}
 
function ResultPanel({
  results,
  runningMode,
  isLoggedIn,
  selectedCase,
  onSelectCase,
}) {
  if (runningMode) {
    return (
      <div className="flex items-center gap-3 text-gray-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>{runningMode === "submit" ? "Judging against all test cases…" : "Running example test cases…"}</span>
      </div>
    );
  }
 
  if (!results) {
    return (
      <p className="text-sm text-gray-500">
        {isLoggedIn ? "Run your code to see the results here." : "Log in to run or submit your code."}
      </p>
    );
  }
 
  if (results.error) {
    return (
      <div className="flex items-start gap-3 text-red-400">
        <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <span>{results.error}</span>
      </div>
    );
  }
 
  const accepted = results.verdict === "Accepted";
  const cases = results.cases ?? [];
  const current = cases[selectedCase] ?? cases[0];
  const failed = results.failedCase;
  const stats = [
    `${results.passed} / ${results.total} test cases passed`,
    results.timeMs != null ? `Runtime ${results.timeMs} ms` : null,
    formatMemory(results.memoryKb) ? `Memory ${formatMemory(results.memoryKb)}` : null,
  ].filter(Boolean);
 
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className={`flex items-center gap-2 text-xl font-semibold ${verdictTone(results.verdict)}`}>
            {accepted ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            {results.verdict}
          </div>
          <p className="mt-1 text-sm text-gray-400">
            {results.mode === "submit" ? "Submission" : "Example run"} · {stats.join(" · ")}
          </p>
        </div>
      </div>
 
      {results.compileOutput && (
        <pre className="themed-scroll max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-red-500/10 px-3 py-2.5 font-mono text-xs text-red-300">
          {results.compileOutput}
        </pre>
      )}
 
      {results.mode === "run" && cases.length > 0 && !results.compileOutput && (
        <div>
          <div className="themed-scroll mb-4 flex gap-2 overflow-x-auto">
            {cases.map((c, i) => (
              <button
                key={c.number}
                onClick={() => onSelectCase(i)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  selectedCase === i ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${c.verdict === "Accepted" ? "bg-green-500" : "bg-red-500"}`} />
                Case {c.number}
              </button>
            ))}
          </div>
          {current && (
            <>
              {current.verdict !== "Accepted" && (
                <p className={`mb-3 text-sm font-medium ${verdictTone(current.verdict)}`}>{current.verdict}</p>
              )}
              <CaseDetails data={current} />
            </>
          )}
        </div>
      )}
 
      {results.mode === "submit" && failed && !results.compileOutput && (
        <div>
          <p className="mb-3 text-sm text-gray-400">
            {failed.hidden
              ? `Failed on hidden test case ${failed.number} of ${results.total}.`
              : `Failed on test case ${failed.number} of ${results.total}.`}
          </p>
          {!failed.hidden && <CaseDetails data={failed} />}
        </div>
      )}
    </div>
  );
}


/* ------------------------------ submissions ------------------------------ */
 
const STATUS_LABELS = {
  queued: "Pending",
  processing: "Pending",
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  compilation_error: "Compilation Error",
  runtime_error: "Runtime Error",
  time_limit_exceeded: "Time Limit Exceeded",
  memory_limit_exceeded: "Memory Limit Exceeded",
  internal_error: "Internal Error",
};
const statusLabel = (status) => STATUS_LABELS[status] ?? status;
 
function timeAgo(value) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}
 
function formatDateTime(value) {
  return new Date(value)
    .toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
    .replace(/, (\d{2}:\d{2})$/, " $1");
}
 
function LanguageBadge({ language }) {
  return (
    <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-gray-300">
      {languageLabels[language] ?? language}
    </span>
  );
}
 
function SubmissionsList({ slug, userId, isLoggedIn, version, onOpen, onLogin }) {
  const [state, setState] = useState({ items: [], total: 0, page: 1, hasMore: false });
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
 
  // First page – reloads whenever a new submission is made (`version` changes).
  useEffect(() => {
    if (!isLoggedIn) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
 
    axios
      .get(`/api/submissions/all/${slug}`, { params: { page: 1, limit: 20 } }, {withCredentials: true})
      .then(({ data }) => {
        if (!cancelled) setState({ items: data.submissions, total: data.total, page: 1, hasMore: data.hasMore });
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Couldn't load your submissions.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
 
    return () => {
      cancelled = true;
    };
  }, [slug, userId, isLoggedIn, version]);
 
  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = state.page + 1;
      const { data } = await axios.get(`/api/submissions/all/${slug}`, {
        params: { page: nextPage, limit: 20}}, {withCredentials: true});
      setState((s) => ({ items: [...s.items, ...data.submissions], total: data.total, page: nextPage, hasMore: data.hasMore }));
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load more submissions.");
    } finally {
      setLoadingMore(false);
    }
  };
 
  if (!isLoggedIn) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-gray-400">Log in to see your submissions for this problem.</p>
        <button
          onClick={onLogin}
          className="rounded-md bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600"
        >
          Log in
        </button>
      </div>
    );
  }
 
  const gridCols = "grid-cols-[1.5rem_minmax(0,1fr)_4.5rem_5rem_5rem]";
 
  return (
    <div className="themed-scroll flex-1 overflow-y-auto">
      <div className={`grid ${gridCols} items-center gap-3 border-b border-gray-800 px-4 py-2 text-xs font-medium text-gray-500`}>
        <span />
        <span>Status</span>
        <span>Language</span>
        <span>Runtime</span>
        <span>Memory</span>
      </div>
 
      {loading ? (
        <div className="space-y-2 p-4" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-800/60" />
          ))}
        </div>
      ) : error ? (
        <p className="p-6 text-center text-sm text-red-400">{error}</p>
      ) : state.items.length === 0 ? (
        <p className="p-8 text-center text-sm text-gray-500">No submissions yet. Submit your solution to see it here.</p>
      ) : (
        <>
          <ul>
            {state.items.map((item) => {
              const label = statusLabel(item.status);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onOpen(item.id, label)}
                    className={`grid w-full ${gridCols} items-center gap-3 border-b border-gray-900 px-4 py-3 text-left transition-colors hover:bg-white/5 focus:outline-none focus-visible:bg-white/5`}
                  >
                    <span className="text-sm text-gray-500">{item.number}</span>
                    <span className="min-w-0">
                      <span className={`block truncate text-sm font-semibold ${verdictTone(label)}`}>{label}</span>
                      <span className="block truncate text-xs text-gray-500">{timeAgo(item.submittedAt)}</span>
                    </span>
                    <span>
                      <LanguageBadge language={item.language} />
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-300">
                      <Clock className="h-3.5 w-3.5 text-gray-500" />
                      {item.status === "accepted" && item.timeMs != null ? `${item.timeMs} ms` : "N/A"}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-gray-300">
                      <Cpu className="h-3.5 w-3.5 text-gray-500" />
                      {item.status === "accepted" && item.memoryKb != null ? formatMemory(item.memoryKb) : "N/A"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
 
          {state.hasMore && (
            <div className="p-4 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="rounded-md border border-gray-700 px-4 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white hover:text-black disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
 
function RuntimeHistogram({ distribution }) {
  const { buckets, mine } = distribution;
  const max = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <div>
      <div className="flex h-28 items-end gap-[2px]" role="img" aria-label="Runtime distribution of accepted submissions">
        {buckets.map((b, i) => (
          <div
            key={i}
            title={`${b.from}–${b.to} ms · ${b.count} submission${b.count === 1 ? "" : "s"}`}
            className={`flex-1 rounded-t-sm ${i === mine ? "bg-blue-500" : "bg-blue-500/30"}`}
            style={{ height: `${b.count === 0 ? 2 : Math.max(6, (b.count / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-gray-500">
        <span>{buckets[0].from} ms</span>
        <span>{buckets[buckets.length - 1].to} ms</span>
      </div>
    </div>
  );
}
 
function SubmissionDetail({ id, userId, onBack, onRestore }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [analysisCode, setAnalysisCode] = useState("");
  const [analysisResults, setAnalysisResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
 
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
 
    axios
      .get(`/api/submissions/by-id/${id}`, {withCredentials: true})
      .then((res) => {
        if (!cancelled) setData(res.data);
          setAnalysisCode(wrapCode(res.data.language, res.data.code, res.data.languageWrappers));
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Couldn't load this submission.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
 
    return () => {
      cancelled = true;
    };
  }, [id, userId]);



  const analyzeCode = async () => {
    if (!data.code) {
      notify("error", "No code available for analysis.");
      return;
    }

    try {
      setIsAnalyzing(true);
      const analyzeUrl = process.env.NEXT_PUBLIC_ANALZYER;
      const response = await axios.post(`${analyzeUrl}/analyze`, { code: analysisCode, language: data.language });
      setAnalysisResults(response.data);
      console.log("Code analysis results:", response.data);
    } catch (error) {
      console.error("Error analyzing code:", error);
      notify("error", "An error occurred while analyzing the code.");
    } finally {
      setIsAnalyzing(false);
    }
  };
 
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(data.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };
 
  const backBar = (
    <button
      onClick={onBack}
      className="flex w-full items-center gap-2 border-b border-gray-800 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:text-white"
    >
      <ArrowLeft className="h-4 w-4" />
      All Submissions
    </button>
  );
 
  if (loading || error || !data) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        {backBar}
        <div className="p-6">
          {loading ? (
            <div className="space-y-3" aria-hidden="true">
              <div className="h-8 w-1/3 animate-pulse rounded bg-gray-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-800" />
              <div className="h-32 animate-pulse rounded-lg bg-gray-800/60" />
            </div>
          ) : (
            <p className="text-center text-sm text-red-400">{error || "Submission not found."}</p>
          )}
        </div>
      </div>
    );
  }
 
  const label = statusLabel(data.status);
  const accepted = data.status === "accepted";
  const isCompileError = data.status === "compilation_error";
  const failed = data.failedCase;
  const lines = data.code.split("\n");
 
  return (
    <div className="themed-scroll flex-1 overflow-y-auto">
      {backBar}
 
      <div className="space-y-5 p-5">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3">
            <h2 className={`text-2xl font-semibold ${verdictTone(label)}`}>{label}</h2>
            <span className="text-sm text-gray-400">
              {data.execution.passedTests} / {data.execution.totalTests} testcases passed
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            <span className="font-medium text-gray-200">{data.user.username}</span> submitted at{" "}
            {formatDateTime(data.submittedAt)}
          </p>
        </div>
        {accepted && !analysisResults && (
          <button
            onClick={analyzeCode}
            disabled={isAnalyzing}
            className="flex items-center gap-2 rounded-md border border-gray-700 px-4 py-1.5 text-sm font-medium text-gray-200 transition-colors hover:bg-white hover:text-black disabled:opacity-50"
          >
            {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
            Analyze Code
          </button>
        )}

      {isAnalyzing ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        analysisResults && (
          <div className="rounded-xl border border-gray-800 bg-white/[0.03] p-5">
            <h3 className="mb-4 text-base font-semibold text-white">Code Analysis</h3>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white/5 p-4">
                <div className="mb-1 text-xs text-gray-400">Time Complexity</div>
                <div className="text-xl font-bold text-blue-400">{analysisResults.time}</div>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <div className="mb-1 text-xs text-gray-400">Space Complexity</div>
                <div className="text-xl font-bold text-purple-400">{analysisResults.memory}</div>
              </div>
            </div>
            <div className="space-y-4">
              <span className="capitalize text-gray-300">{analysisResults.description}</span>
            </div>
          </div>
        )
      )}
 
        {/* runtime / memory */}
        {data.execution.timeMs != null && (
          <div className="rounded-xl border border-gray-800 bg-white/[0.03] p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock className="h-4 w-4" /> Runtime
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{data.execution.timeMs}</span>
                  <span className="text-sm text-gray-400">ms</span>
                  {data.beats?.runtime != null && (
                    <span className="ml-1 text-sm text-gray-400">
                      | Beats <span className="font-semibold text-green-400">{data.beats.runtime}%</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-lg bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Cpu className="h-4 w-4" /> Memory
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">
                    {data.execution.memoryKb != null ? (data.execution.memoryKb / 1024).toFixed(2) : "—"}
                  </span>
                  <span className="text-sm text-gray-400">MB</span>
                  {data.beats?.memory != null && (
                    <span className="ml-1 text-sm text-gray-400">
                      | Beats <span className="font-semibold text-green-400">{data.beats.memory}%</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
 
            {accepted && data.runtimeDistribution && (
              <div className="mt-4">
                <RuntimeHistogram distribution={data.runtimeDistribution} />
              </div>
            )}
          </div>
        )}
 
        {/* why it failed */}
        {!accepted && (
          <div>
            {isCompileError && data.errorMessage && (
              <pre className="themed-scroll max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-red-500/10 px-3 py-2.5 font-mono text-xs text-red-300">
                {data.errorMessage}
              </pre>
            )}
 
            {!isCompileError && failed?.hidden && (
              <p className="text-sm text-gray-400">
                Failed on hidden test case {failed.number} of {data.execution.totalTests}.
              </p>
            )}
 
            {!isCompileError && failed && !failed.hidden && (
              <>
                <p className="mb-3 text-sm text-gray-400">
                  Failed on test case {failed.number} of {data.execution.totalTests}.
                </p>
                <CaseDetails data={{ ...failed, message: data.errorMessage }} />
              </>
            )}
 
            {!isCompileError && !failed && data.errorMessage && (
              <pre className="themed-scroll max-h-56 overflow-auto whitespace-pre-wrap rounded-lg bg-red-500/10 px-3 py-2.5 font-mono text-xs text-red-300">
                {data.errorMessage}
              </pre>
            )}
          </div>
        )}
 
        {/* code */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Code</span>
              <span className="text-gray-600">|</span>
              <span className="font-medium text-gray-200">{languageLabels[data.language] ?? data.language}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copyCode}
                className="flex items-center gap-1.5 rounded-md border border-gray-700 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-white/5"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => onRestore(data.code, data.language)}
                className="flex items-center gap-1.5 rounded-md border border-gray-700 px-3 py-1 text-xs text-gray-300 transition-colors hover:bg-white/5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restore to editor
              </button>
            </div>
          </div>
 
          <div className="themed-scroll overflow-x-auto rounded-lg bg-[#0d0d0d] py-3 font-mono text-sm text-gray-200">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="w-10 shrink-0 select-none pr-4 text-right text-gray-600">{i + 1}</span>
                <span className="whitespace-pre pr-4">{line || " "}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



/* --------------------------------- page --------------------------------- */

const panel = "flex min-h-0 flex-col overflow-hidden rounded-lg border border-gray-800 bg-[#111111]";

const CodeEditorPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const islobby = searchParams.get("lobby");
  const { user } = useContext(UserDataContext);
  const isLoggedIn = Boolean(user?._id);
  const uid = user?._id ?? "guest"; 

  const problemSlug = useMemo(() => pathname?.split("/").filter(Boolean).pop() ?? "", [pathname]);

  // problem data
  const [problem, setProblem] = useState(null);
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [loadError, setLoadError] = useState(false);

  // editor
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [cursor, setCursor] = useState({ line: 1, col: 1 });
  const [saveState, setSaveState] = useState("saved");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // layout
  const [leftWidth, setLeftWidth] = useState(DEFAULT_LAYOUT.leftWidth);
  const [editorHeight, setEditorHeight] = useState(DEFAULT_LAYOUT.editorHeight);
  const [drag, setDrag] = useState(null); // "v" | "h" | null
  const mainRef = useRef(null);
  const rightRef = useRef(null);

  // run / submit / analyze
  const [bottomTab, setBottomTab] = useState("testcase");
  const [activeCase, setActiveCase] = useState(0);
  const [selectedResultCase, setSelectedResultCase] = useState(0);
  const [results, setResults] = useState(null);
  const [runningMode, setRunningMode] = useState(null); // "run" | "submit" | null
  const [notice, setNotice] = useState(null);

  // left panel tabs: "description" | "submissions" | "submission" (one opened submission)
  const [leftTab, setLeftTab] = useState("description");
  const [activeSubmission, setActiveSubmission] = useState(null); // { id, label }
  const [submissionsVersion, setSubmissionsVersion] = useState(0);

  const isRunning = runningMode !== null;
  const publicTestCases = problem?.publicTestCases ?? [];
  const storageKey = `cp:code:${uid}:${problemSlug}:${language}`;

  /* ---- refs for stable access inside timers / listeners ---- */
  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;
  const pendingSaveRef = useRef(null);
  const saveTimerRef = useRef(null);
  const handlersRef = useRef({});

  const notify = (type, text) => setNotice({ type, text });

  const goLogin = () => {
    flushSave();
    router.push(`${LOGIN_ROUTE}?redirect=${encodeURIComponent(pathname)}`);
  };

  /* ---- load saved settings, layout and language (client only) ---- */
useEffect(() => {
  setSettings(readJSON(SETTINGS_KEY, DEFAULT_SETTINGS));
  const layout = readJSON(LAYOUT_KEY, DEFAULT_LAYOUT);
  setLeftWidth(layout.leftWidth);
  setEditorHeight(layout.editorHeight);
  setSettingsLoaded(true);
}, []);

  useEffect(() => {
    if (settingsLoaded) writeJSON(SETTINGS_KEY, settings);
  }, [settings, settingsLoaded]);

// guest drafts -> logged-in user (ye sabse upar rahe)
useEffect(() => {
  if (uid === "guest") return;
  try {
    const guestKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith("cp:code:guest:") || key === `${LANGUAGE_KEY}:guest`)) guestKeys.push(key);
    }
    guestKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) localStorage.setItem(key.replace(":guest", `:${uid}`), value);
      localStorage.removeItem(key);
    });
  } catch {}
}, [uid]);

// language is remembered per user
const saveLanguage = (lang) => {
  try {
    localStorage.setItem(`${LANGUAGE_KEY}:${uid}`, lang);
  } catch {}
};

useEffect(() => {
  let saved = null;
  try {
    saved = localStorage.getItem(`${LANGUAGE_KEY}:${uid}`);
  } catch {}
  setLanguage(supportedLanguages.includes(saved) ? saved : "python");
}, [uid]);

  /* ---- fetch problem ---- */
  useEffect(() => {
    if (!problemSlug) return;
    let cancelled = false;
    setLoadingProblem(true);
    setLoadError(false);

    axios
      .get(`/api/problems/${problemSlug}`)
      .then((res) => {
        if (!cancelled) setProblem(res.data);
      })
      .catch((error) => {
        console.error("Error fetching problem:", error.response?.data || error.message);
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingProblem(false);
      });

    return () => {
      cancelled = true;
    };
  }, [problemSlug]);

  /* ---- load code: saved draft first, starter template otherwise ---- */
  useEffect(() => {
    if (!problem) return;
    let saved = null;
    try {
      saved = localStorage.getItem(storageKey);
    } catch {}
    setCode(saved ?? getStarterCode(problem, language));
    setSaveState("saved");
    setActiveCase(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, language, problemSlug, uid]);

  /* ---- autosave (debounced) + flush on leave ---- */
  const flushSave = () => {
    clearTimeout(saveTimerRef.current);
    const pending = pendingSaveRef.current;
    if (!pending) return;
    try {
      localStorage.setItem(pending.key, pending.value);
    } catch {}
    pendingSaveRef.current = null;
    setSaveState("saved");
  };

  const handleEditorChange = (value) => {
    const next = value ?? "";
    setCode(next);
    setSaveState("saving");
    pendingSaveRef.current = { key: storageKeyRef.current, value: next };
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(flushSave, AUTOSAVE_DELAY_MS);
  };

  useEffect(() => {
    const onHide = () => flushSave();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      flushSave();
    };
  }, []);

  const handleLanguageChange = (next) => {
    flushSave();
    saveLanguage(next);
    setLanguage(next);
  };

  const confirmReset = () => {
    clearTimeout(saveTimerRef.current);
    pendingSaveRef.current = null;
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    setCode(getStarterCode(problem, language));
    setSaveState("saved");
    setShowResetConfirm(false);
    notify("info", "Code reset to the starter template.");
  };

  /* ---- panel resizing ---- */
  useEffect(() => {
    if (!drag) return;

    const onMove = (e) => {
      if (drag === "v" && mainRef.current) {
        const rect = mainRef.current.getBoundingClientRect();
        setLeftWidth(clamp(((e.clientX - rect.left) / rect.width) * 100, 20, 75));
      } else if (drag === "h" && rightRef.current) {
        const rect = rightRef.current.getBoundingClientRect();
        setEditorHeight(clamp(((e.clientY - rect.top) / rect.height) * 100, 25, 80));
      }
    };
    const onUp = () => setDrag(null);

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.body.style.userSelect = "";
    };
  }, [drag]);

  useEffect(() => {
    if (settingsLoaded && !drag) writeJSON(LAYOUT_KEY, { leftWidth, editorHeight });
  }, [drag, leftWidth, editorHeight, settingsLoaded]);

  const resetLayout = () => {
    setLeftWidth(DEFAULT_LAYOUT.leftWidth);
    setEditorHeight(DEFAULT_LAYOUT.editorHeight);
    setSettings((s) => ({ ...s, runButtonsIn: DEFAULT_SETTINGS.runButtonsIn }));
  };

  /* ---- toast auto-dismiss ---- */
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(id);
  }, [notice]);

  /* ----------------------- run / submit / analyze ----------------------- */

    const judge = async (mode) => {
    if (!code.trim()) {
      notify("error", "Write some code first.");
      return null;
    }
 
    setRunningMode(mode);
    setResults(null);
    setBottomTab("result");
    setSelectedResultCase(0);
    

    try {
      const { data } = await axios.post(`/api/judge0/submit/${problemSlug}`, { 
        code, language, mode, lobby: islobby}, {withCredentials: true});
      setResults(data);
      const firstBad = data.cases?.findIndex((c) => c.verdict !== "Accepted") ?? -1;
      setSelectedResultCase(firstBad > 0 ? firstBad : 0);
      return data;
    } catch (error) {
      const message = error.response?.data?.message || "Couldn't reach the judge. Please try again.";
      setResults({ mode, error: message });
      return null;
    } finally {
      setRunningMode(null);
    }
  };


  const handleRunClick = () => {
    if (!isLoggedIn) return goLogin();
    if (!isRunning) judge("run");
    console.log("fetch judge0..........");
  };

  const openSubmission = (id, label) => {
    setActiveSubmission({ id, label });
    setLeftTab("submission");
  };

  const closeSubmissionTab = () => {
    setActiveSubmission(null);
    setLeftTab("submissions");
  };

  const handleSubmitClick = async () => {
    if (!isLoggedIn) return goLogin();
    if (isRunning) return;
 
    const data = await judge("submit");
    if (!data?.submissionId) return;
 
    // Refresh the Submissions list and open this submission's result tab.
    setSubmissionsVersion((v) => v + 1);
    openSubmission(data.submissionId, data.verdict);
 
    if (data.verdict === "Accepted") {
      notify(
        "success",
        data.firstSolve && data.streak
          ? `Problem solved! 🔥 ${data.streak.current}-day streak`
          : "Accepted"
      );
    } else {
      notify("info", data.verdict);
    }
  };

  // Put a past submission's code back into the editor.
  const restoreCode = (restoredCode, restoredLanguage) => {
    try {
      localStorage.setItem(`cp:code:${uid}:${problemSlug}:${restoredLanguage}`, restoredCode);
    } catch {}
    if (restoredLanguage === language) {
      setCode(restoredCode);
      setSaveState("saved");
    } else {
      flushSave();
      saveLanguage(restoredLanguage);
      setLanguage(restoredLanguage); // the load effect picks the restored code up
    }
    notify("info", "Code restored to the editor.");
  };

  handlersRef.current = { run: handleRunClick, submit: handleSubmitClick };

  /* ---- keyboard shortcuts: Ctrl/Cmd + ' to run, Ctrl/Cmd + Enter to submit ---- */
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === "'") {
        e.preventDefault();
        e.stopPropagation();
        handlersRef.current.run();
      } else if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handlersRef.current.submit();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, []);

  /* ------------------------------- render ------------------------------- */

  const editorOptions = {
    fontSize: settings.fontSize,
    fontFamily: FONT_FAMILIES[settings.fontFamily],
    fontLigatures: settings.fontLigatures,
    tabSize: settings.tabSize,
    wordWrap: settings.wordWrap ? "on" : "off",
    lineNumbers: settings.relativeLineNumbers ? "relative" : "on",
    cursorBlinking: settings.disableCursorBlink ? "solid" : "blink",
    minimap: { enabled: settings.minimap },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    padding: { top: 12, bottom: 12 },
  };

  const actionButtons = (
    <div className="flex items-center gap-2">
      <button
        onClick={handleRunClick}
        disabled={isRunning}
        className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {runningMode === "run" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
        {runningMode === "run" ? "Running" : "Run"}
      </button>
      <button
        onClick={handleSubmitClick}
        disabled={isRunning}
        className="flex items-center gap-2 rounded-md bg-green-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {runningMode === "submit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
        {runningMode === "submit" ? "Submitting" : "Submit"}
      </button>
    </div>
  );

  const acceptance =
    problem?.stats?.submissionCount > 0
      ? `${Math.round((problem.stats.acceptedCount / problem.stats.submissionCount) * 100)}%`
      : null;

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0a] text-white" style={{ colorScheme: "dark" }}>
      <style>{SCROLLBAR_CSS}</style>
      {/* ------------------------------ top bar ------------------------------ */}
      <header className="grid h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-gray-800 px-3">
        <Link
          href={PROBLEMS_ROUTE}
          className="flex w-fit items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Problems</span>
        </Link>

        <div className="flex justify-center">{settings.runButtonsIn === "toolbar" && actionButtons}</div>

        <div className="flex items-center justify-end gap-2">

          <TimerWidget onNotify={notify} />

          <button
            onClick={() => setShowSettings(true)}
            aria-label="Open settings"
            className="rounded-md p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <Settings className="h-5 w-5" />
          </button>
          {!isLoggedIn && (
            <>
              <Link
                href={`${REGISTER_ROUTE}?redirect=${encodeURIComponent(pathname)}`}
                aria-label="Open settings"
                className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Register
              </Link>
              <p className="text-gray-400">or</p>
              <Link
                href={`${LOGIN_ROUTE}?redirect=${encodeURIComponent(pathname)}`}
                aria-label="Open settings"
                className="rounded-md px-3 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ------------------------------ main area ------------------------------ */}
      <main
        ref={mainRef}
        style={{ "--lw": `${leftWidth}%`, "--eh": `${editorHeight}%` }}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2 lg:flex-row lg:gap-0 lg:overflow-hidden"
      >
        {/* ---------------------- left: description ---------------------- */}
        <section className={`${panel} h-[65vh] shrink-0 lg:h-auto lg:w-[var(--lw)]`}>
          <div className="flex h-11 shrink-0 items-center gap-1 border-b border-gray-800 bg-[#161616] px-2">
            <button
              onClick={() => setLeftTab("description")}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
                leftTab === "description" ? "bg-white/5 font-medium text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4 text-blue-500" />
              Description
            </button>

            {activeSubmission && (
              <div
                className={`flex shrink-0 items-center rounded-md transition-colors ${
                  leftTab === "submission" ? "bg-white/5" : "hover:bg-white/5"
                }`}
              >
                <button
                  onClick={() => setLeftTab("submission")}
                  className={`flex items-center gap-2 whitespace-nowrap py-1.5 pl-3 pr-1 text-sm ${
                    leftTab === "submission" ? "font-medium" : ""
                  } ${verdictTone(activeSubmission.label)}`}
                >
                  <History className="h-4 w-4" />
                  {activeSubmission.label}
                </button>
                <button
                  onClick={closeSubmissionTab}
                  aria-label="Close submission tab"
                  className="rounded p-1 text-gray-500 transition-colors hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={() => setLeftTab("submissions")}
              className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors ${
                leftTab === "submissions" ? "bg-white/5 font-medium text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <History className="h-4 w-4" />
              Submissions
            </button>
          </div>

          {leftTab === "submissions" && (
            <SubmissionsList
              slug={problemSlug}
              userId={user?._id}
              isLoggedIn={isLoggedIn}
              version={submissionsVersion}
              onOpen={openSubmission}
              onLogin={goLogin}
            />
          )}
 
          {leftTab === "submission" && activeSubmission && (
            <SubmissionDetail
              key={activeSubmission.id}
              id={activeSubmission.id}
              userId={user?._id}
              onBack={closeSubmissionTab}
              onRestore={restoreCode}
            />
          )}

          {/* kept mounted (just hidden) so the scroll position survives tab switches */}
          <div className={`themed-scroll flex-1 overflow-y-auto p-5 ${leftTab === "description" ? "" : "hidden"}`}>
            {loadingProblem ? (
              <div className="space-y-3" aria-hidden="true">
                <div className="h-7 w-2/3 animate-pulse rounded bg-gray-800" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-800" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-gray-800" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-gray-800" />
              </div>
            ) : loadError || !problem ? (
              <p className="py-10 text-center text-gray-400">We couldn&apos;t load this problem. Please refresh the page.</p>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-white">{problem.title}</h1>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {problem.difficulty && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        DIFFICULTY_STYLES[problem.difficulty] ?? "bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  )}
                  {problem.topics?.map((t) => (
                    <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-400">
                      {t}
                    </span>
                  ))}
                  {problem.tags?.map((t) => (
                    <span key={t} className="rounded-full border border-gray-800 px-3 py-1 text-xs text-gray-500">
                      #{t}
                    </span>
                  ))}
                </div>

                {/* <p className="mt-6 whitespace-pre-wrap leading-relaxed text-gray-300">{problem.description}</p> */}
                <div className="mt-4">
                  <Markdown>{problem.description ?? ""}</Markdown>
                </div>

              {/* images not already embedded in the markdown */}
                {problem.images
                  ?.filter((img) => !problem.description?.includes(img.url))
                  .map((img) => (
                    <figure key={img.url} className="my-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.alt || problem.title}
                        width={img.width || undefined}
                        height={img.height || undefined}
                        loading="lazy"
                        className="max-w-full rounded-lg border border-gray-800"
                      />
                      {img.caption && (
                        <figcaption className="mt-2 text-center text-xs text-gray-500">{img.caption}</figcaption>
                      )}
                    </figure>
                ))}

                {problem.inputSchema?.length > 0 && (
                  <div className="mt-6">
                    <h3 className="mb-2 text-sm font-semibold text-white">Parameters</h3>
                    <ul className="space-y-1.5 text-sm">
                      {problem.inputSchema.map((field) => (
                        <li key={field.name} className="text-gray-400">
                          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-gray-200">{field.name}</code>
                          <span className="ml-2 text-xs text-gray-500">{field.type}</span>
                          {field.description && <span className="ml-2">— {field.description}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {problem.examples?.length > 0 && (
                  <div className="mt-8 space-y-4">
                    {problem.examples.map((example, index) => (
                      <div key={index}>
                        <h3 className="mb-2 text-sm font-semibold text-white">Example {index + 1}:</h3>
                        <div className="space-y-1.5 rounded-lg border-l-2 border-gray-700 bg-white/[0.03] px-4 py-3 text-sm">
                          <div>
                            <span className="font-semibold text-white">Input: </span>
                            <code className="whitespace-pre-wrap font-mono text-gray-300">{example.input}</code>
                          </div>
                          <div>
                            <span className="font-semibold text-white">Output: </span>
                            <code className="whitespace-pre-wrap font-mono text-gray-300">{example.output}</code>
                          </div>
                          {example.explanation && (
                            <div>
                              <span className="font-semibold text-white">Explanation: </span>
                              <span className="whitespace-pre-wrap text-gray-400">{example.explanation}</span>
                            </div>
                          )}
                          {example.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={example.imageUrl}
                              alt={`Example ${index + 1}`}
                              loading="lazy"
                              className="mt-2 max-w-full rounded-lg border border-gray-800"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints?.length > 0 && (
                  <div className="mt-8">
                    <h3 className="mb-2 text-sm font-semibold text-white">Constraints:</h3>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-400">
                      {problem.constraints.map((c, i) => (
                        <li key={i}>
                          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-gray-200">{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap gap-x-5 gap-y-1 border-t border-gray-800 pt-4 text-xs text-gray-500">
                  {problem.limits?.timeLimitMs != null && <span>Time limit: {problem.limits.timeLimitMs / 1000}s</span>}
                  {problem.limits?.memoryLimitMb != null && <span>Memory limit: {problem.limits.memoryLimitMb} MB</span>}
                  {acceptance && <span>Acceptance: {acceptance}</span>}
                </div>
              </>
            )}
          </div>
        </section>

        <Resizer direction="v" active={drag === "v"} onPointerDown={() => setDrag("v")} />

        {/* ------------------- right: editor + test panel ------------------- */}
        <div ref={rightRef} className="flex shrink-0 flex-col gap-2 lg:min-w-0 lg:flex-1 lg:shrink lg:gap-0">
          {/* ------------------------- code editor ------------------------- */}
          <section className={`${panel} h-[70vh] lg:h-[var(--eh)] lg:shrink-0`}>
            <div className="flex h-11 shrink-0 items-center justify-between gap-2 border-b border-gray-800 bg-[#161616] px-3">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  <Code2 className="h-4 w-4 text-green-500" />
                  Code
                </span>
                <SelectBox
                  label="Programming language"
                  value={language}
                  onChange={handleLanguageChange}
                  options={supportedLanguages.map((l) => ({ value: l, label: languageLabels[l] }))}
                />
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                aria-label="Reset code"
                title="Reset code"
                className="rounded-md p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1">
              <MonacoEditor
                height="100%"
                language={language}
                theme={settings.theme}
                value={code}
                onChange={handleEditorChange}
                onMount={(editor) =>
                  editor.onDidChangeCursorPosition((e) =>
                    setCursor({ line: e.position.lineNumber, col: e.position.column })
                  )
                }
                options={editorOptions}
              />
            </div>

            <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-t border-gray-800 bg-[#161616] px-3 text-xs text-gray-500">
              <span aria-live="polite">{saveState === "saving" ? "Saving…" : "Saved"}</span>
              <div className="flex items-center gap-4">
                {settings.runButtonsIn === "editor" && actionButtons}
                <span>
                  Ln {cursor.line}, Col {cursor.col}
                </span>
              </div>
            </div>

            {!isLoggedIn && (
              <button
                onClick={goLogin}
                className="shrink-0 border-t border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-left text-sm text-gray-200 transition-colors hover:bg-blue-500/20"
              >
                You need to <span className="font-semibold text-blue-400 underline-offset-2 hover:underline">log in / sign up</span>{" "}
                to run or submit
              </button>
            )}
          </section>

          <Resizer direction="h" active={drag === "h"} onPointerDown={() => setDrag("h")} />

          {/* ------------------------ testcase / result ------------------------ */}
          <section className={`${panel} h-[50vh] lg:h-auto lg:flex-1`}>
            <div className="flex h-11 shrink-0 items-center gap-1 border-b border-gray-800 bg-[#161616] px-2">
              <button
                onClick={() => setBottomTab("testcase")}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  bottomTab === "testcase" ? "bg-white/5 font-medium text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <CheckSquare className="h-4 w-4 text-green-500" />
                Testcase
              </button>
              <button
                onClick={() => setBottomTab("result")}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  bottomTab === "result" ? "bg-white/5 font-medium text-white" : "text-gray-400 hover:text-white"
                }`}
              >
                <Terminal className="h-4 w-4 text-blue-500" />
                Test Result
                {results?.verdict && !isRunning && (
                  <span className={`h-2 w-2 rounded-full ${results.verdict === "Accepted" ? "bg-green-500" : "bg-red-500"}`} />
                )}
              </button>
            </div>

            <div className="themed-scroll flex-1 overflow-y-auto p-4">
              {bottomTab === "testcase" ? (
                publicTestCases.length === 0 ? (
                  <p className="text-sm text-gray-500">No example test cases available.</p>
                ) : (
                  <>
                    <div className="themed-scroll mb-4 flex gap-2 overflow-x-auto">
                      {publicTestCases.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveCase(i)}
                          className={`shrink-0 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                            activeCase === i ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"
                          }`}
                        >
                          Case {i + 1}
                        </button>
                      ))}
                    </div>
                    <InputBlocks inputs={publicTestCases[activeCase]?.inputs} />
                  </>
                )
              ) : (
                <ResultPanel
                  results={results}
                  runningMode={runningMode}
                  isLoggedIn={isLoggedIn}
                  selectedCase={selectedResultCase}
                  onSelectCase={setSelectedResultCase}
                />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Keeps the cursor and pointer events stable while dragging a divider */}
      {drag && <div className={`fixed inset-0 z-40 ${drag === "v" ? "cursor-col-resize" : "cursor-row-resize"}`} />}

      {/* -------------------------------- toast -------------------------------- */}
      {notice && (
        <div
          role="status"
          className={`fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-lg border px-4 py-2.5 text-sm shadow-xl ${
            notice.type === "success"
              ? "border-green-500/40 bg-green-500/10 text-green-400"
              : notice.type === "error"
              ? "border-red-500/40 bg-red-500/10 text-red-400"
              : "border-gray-700 bg-[#1a1a1a] text-gray-200"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* ------------------------------- modals ------------------------------- */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
          onResetLayout={resetLayout}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showResetConfirm && (
        <ModalShell title="Reset code" onClose={() => setShowResetConfirm(false)}>
          <div className="p-5">
            <h2 className="text-lg font-semibold text-white">Reset code?</h2>
            <p className="mt-2 text-sm text-gray-400">
              Your {languageLabels[language]} code will be replaced with the starter template. This can&apos;t be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-md px-4 py-1.5 text-sm text-gray-300 transition-colors hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="rounded-md bg-red-500 px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
              >
                Reset code
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default CodeEditorPage;