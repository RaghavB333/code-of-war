"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation
import axios from "axios";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const supportedLanguages = ["javascript", "python", "csharp", "cpp"];
const languageMap = {
    javascript: 63,
    python: 71,
    csharp: 51,
    cpp: 53,
};

const CodeEditorPage = ({params}) => {
    const [code, setCode] = useState("// Write your code here...");
    const [language, setLanguage] = useState("");
    const [testCases, setTestCases] = useState([]);
    const [results, setResults] = useState([]);
    const [isRunning, setIsRunning] = useState(false);
    const router = useRouter();
    const { problemId } = params; // Get problem ID from the route params

    // Fetch problem data based on the problemId
    useEffect(() => {
        if (!problemId) return;

        const fetchProblem = async () => {
            try {
                const response = await axios.get(`/api/problems/${problemId}`);
                const problem = response.data;

                setTestCases(problem.testCases || []);
                // You could also set the default language for the editor here
            } catch (error) {
                console.error("Error fetching problem:", error);
            }
        };

        fetchProblem();
    }, [problemId]);

    const handleLanguageChange = (e) => setLanguage(e.target.value);

    const handleTestCaseChange = (index, field, value) => {
        const updatedTestCases = [...testCases];
        updatedTestCases[index][field] = value;
        setTestCases(updatedTestCases);
    };

    const addTestCase = () => setTestCases([...testCases, { input: "", expectedOutput: "" }]);

    const runTestCases = async () => {
        if (!language) {
            alert("Please select a language first!");
            return;
        }
        setIsRunning(true);
        const results = [];

        for (const testCase of testCases) {
            const { input, expectedOutput } = testCase;
            try {

                const response = await axios.post(
                    "https://judge0-ce.p.rapidapi.com/submissions",
                    {
                        source_code: code,
                        language_id: languageMap[language],
                        stdin: input, // Add input if needed
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
                // Wait for the result using `await`
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
                    passed: actualOutput === expectedOutput,
                });
            } catch (error) {
                results.push({
                    input,
                    expectedOutput,
                    actualOutput: "Error during execution",
                    passed: false,
                });
            }
        }

        setResults(results);
        setIsRunning(false);
    };

    return (
        <div>
            <h1>Code Editor - {problemId}</h1>
            <select className="bg-[#0a0a0a]" onChange={handleLanguageChange} value={language}>
                <option value="" disabled>
                    Select your language
                </option>
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
            <div className="container m-2 border-2 p-4 border-white w-[98vw]">
                <h2 className="ml-9">Test Cases</h2>
                {testCases.map((testCase, index) => (
                    <div key={index} style={{ marginBottom: "10px" }}>
                        <textarea
                            placeholder="Input"
                            value={testCase.input}
                            onChange={(e) => handleTestCaseChange(index, "input", e.target.value)}
                            rows="3"
                            cols="30"
                            className="text-black mx-10"
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
                    {results.map((result, index) => (
                        <div key={index}>
                            <p>Test Case {index + 1}</p>
                            <p>Input: {result.input}</p>
                            <p>Expected Output: {result.expectedOutput}</p>
                            <p>Actual Output: {result.actualOutput}</p>
                            <p>Status: {result.passed ? "✅ Passed" : "❌ Failed"}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CodeEditorPage;



