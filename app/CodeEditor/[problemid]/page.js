"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import AnalysisChart from "@/components/Chart";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

const supportedLanguages = ["javascript", "python", "java", "cpp"];
const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 53,
};



const wrapCode = (language, userCode) => {
  if (language === "python") {
    return `
import json

def sum_two_numbers(a: int, b: int) -> int:
    return a + b  # User-defined function

def main(**inputs):
    # User's code
    result = sum_two_numbers(**inputs)  # Call the user's function and return result
    return result

if __name__ == "__main__":
    import sys
    input_data = sys.stdin.read()
    inputs = json.loads(input_data)
    result = main(**inputs)
    print(result)  # This will automatically print the result
    `;
  }

  if (language === "javascript") {
    return `
const main = ${userCode};

process.stdin.on("data", (data) => {
    const inputs = JSON.parse(data);
    const result = main(...Object.values(inputs));
    console.log(result);  // Automatically handles print without user needing to write it.
});
    `;
  }

  if (language === "java") {
    return `
import java.util.*;
import org.json.*;

public class Main {
    public static Object main(Object[] args) {
        // User's code
        ${userCode}
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String input = scanner.useDelimiter("\\A").next();
        JSONObject inputs = new JSONObject(input);
        JSONArray keys = inputs.names();

        Object[] args = new Object[keys.length()];
        for (int i = 0; i < keys.length(); i++) {
            args[i] = inputs.get(keys.getString(i));
        }

        Object result = main(args);
        System.out.println(result);  // Automatically handles print without user needing to write it.
    }
}
    `;
  }

  if (language === "cpp") {
    return `
#include <iostream>
#include <string>
#include <sstream>
#include <nlohmann/json.hpp>
using namespace std;
using json = nlohmann::json;

// User's function
${userCode}

int main() {
    string input;
    getline(cin, input);
    json j = json::parse(input);

    auto result = main(j["a"], j["b"]);  // Assuming two inputs as an example
    cout << result << endl;  // Automatically handles print without user needing to write it.
    return 0;
}
    `;
  }

  return userCode;
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
      const response = await axios.post("http://localhost:5000/analyze", { code });
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

        const wrappedCode = wrapCode(language, code);
        console.log("Wrapped Code:", wrappedCode);

        // Send the request to Judge0
        const response = await axios.post(
          "https://judge0-ce.p.rapidapi.com/submissions",
          {
            source_code: wrappedCode,
            language_id: languageMap[language],
            stdin: JSON.stringify(testCase.inputs),
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-RapidAPI-Key": "b8fce05a8cmsh11ff5053ac35373p11c76djsn94fd45351063",
              "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        const { token } = response.data;
        // console.log("Judge0 Token:", token);  // Log the token to see if it's being generated

        // Poll the submission status until it's not in the "In Queue" state
        let result;
        let isPolling = true;
        while (isPolling) {
          const statusResponse = await axios.get(
            `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            {
              headers: {
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
                "X-RapidAPI-Key": "b8fce05a8cmsh11ff5053ac35373p11c76djsn94fd45351063",
              },
            }
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
    if (results) {
      const submission = {
        code,
        language,
        results,
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
    <div className="h-screen flex flex-col lg:flex-row">

      {/* Left Panel: Problem Description */}
      <div className="w-full lg:w-1/2 bg-gray-100 p-6 overflow-y-auto text-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{problemTitle}</h1>
          <Link
            href="/submissions"
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md shadow-md transition-transform transform hover:scale-105"
          >
            Submissions
          </Link>
        </div>

        <h2 className="text-xl font-semibold mb-2">Problem Description</h2>
        <p className="mb-4">{problemDesc}</p>

        <h2 className="text-xl font-semibold mb-2">Examples</h2>
        {examples.map((example, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md mb-4">
            <p>
              <strong>Input:</strong> {example.input}
            </p>
            <p>
              <strong>Output:</strong> {example.output}
            </p>
          </div>
        ))}
      </div>


      {/* Right Panel: Code Editor */}
      <div className="w-full lg:w-1/2 bg-gray-900 text-white p-6 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <select
            onChange={handleLanguageChange}
            value={language}
            className="p-2 bg-gray-700 rounded-lg text-white"
          >
            <option value="" disabled>
              Select Language
            </option>
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={runTestCases}
            disabled={isRunning}
            className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isRunning ? "Running..." : "Run Test Cases"}
          </button>
        </div>

        {language && (
          <MonacoEditor
            height="400px"
            language={language}
            value={code}
            onChange={(value) => setCode(value)}
            options={{
              fontSize: 16,
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
                    <p>
                      <strong>Input:</strong> {JSON.stringify(results.inputs)}
                    </p>
                    <p>
                      <strong>Expected Output:</strong> {results.expectedOutput}
                    </p>
                    <p>
                      <strong>Actual Output:</strong> {results.actualOutput}
                    </p>
                  </div>
                )
              ) : null}

            </div>

            {/* Submission Button */}
            {results.allPassed && (<>
              <button
                onClick={submitSolution}
                disabled={hasSubmitted} // Disable button after submission
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
              </div></>)}

              {analysisResults && (
                <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-lg">
                  <h2 className="text-lg font-semibold text-white">Analysis Results</h2>
                  <AnalysisChart data={analysisResults} />
                </div>)}
          
          </>
        )}


      </div>
    </div>
  );
};

export default CodeEditorPage;