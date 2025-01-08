"use client";
import dynamic from 'next/dynamic';
import { useState } from 'react';
import axios from 'axios';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const supportedLanguages = ['javascript', 'python', 'csharp', 'cpp'];
const languageMap = {
  javascript: 63, // Language IDs for Judge0 API
  python: 71,
  csharp: 51,
  cpp: 53,
};

const CodeEditorPage = () => {
  const [code, setCode] = useState('// Write your code here...');
  const [language, setLanguage] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    setOutput(''); // Clear output when language changes
    setShowButton(false); // Reset button visibility when language changes

    // Delay showing the button
    setTimeout(() => {
      setShowButton(true);
    }, 400); // 400ms delay
  };

  const runCode = async () => {
    if (!language) {
      alert('Please select a language first!');
      return;
    }

    setIsRunning(true);

    try {
      const response = await axios.post(
        'https://judge0-ce.p.rapidapi.com/submissions',
        {
          source_code: code,
          language_id: languageMap[language],
          stdin: '', // Input can be added here
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': "291463371emshaf93509b305e020p136094jsn7552daaf62c9", // Replace with your API key
          },
        }
      );

      const { token } = response.data;

      // Fetch the result after a small delay
      setTimeout(async () => {
        const result = await axios.get(
          `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
          {
            headers: {
              'X-RapidAPI-Key': "291463371emshaf93509b305e020p136094jsn7552daaf62c9",
            },
          }
        );
        setOutput(result.data.stdout || result.data.stderr || 'No output');
      }, 2000);
    } catch (error) {
      setOutput('Error executing code. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div>
      <h1>Code Editor</h1>
      <select
        className="bg-background"
        onChange={handleLanguageChange}
        value={language}
      >
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
          options={{
            fontSize: 16,
            minimap: { enabled: false },
          }}
        />
      )}
      {showButton && (
        <button onClick={runCode} disabled={isRunning}>
          {isRunning ? 'Running...' : 'Run Code'}
        </button>
      )}
      {output && (
        <div>
          <h2>Output:</h2>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditorPage;
