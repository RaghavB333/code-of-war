"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const SubmissionsPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 5; // Number of submissions per page

    useEffect(() => {
        const fetchSubmissions = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`/api/submissions?page=${page}&limit=${limit}`);
                setSubmissions(response.data.submissions);
                setTotal(response.data.total);
            } catch (err) {
                setError(`Failed to load submissions: ${err.response?.data?.message || err.message}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmissions();
    }, [page]);

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-4">All Submissions</h1>

            {isLoading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="space-y-6">
                    {submissions.length === 0 ? (
                        <p>No submissions found.</p>
                    ) : (
                        submissions.map((submission) => (
                            <div
                                key={submission._id}
                                className="bg-gray-800 p-6 rounded-lg shadow-md text-white"
                            >
                                <h2 className="text-xl font-semibold mb-2">Submission Details</h2>
                                <div className="mb-4">
                                    <strong>Code:</strong>
                                    <SyntaxHighlighter
                                        language={submission.language || "plaintext"} // Use "plaintext" as fallback
                                        style={vscDarkPlus}
                                        className="rounded-md"
                                    >
                                        {submission.code}
                                    </SyntaxHighlighter>
                                </div>
                                <div className="mb-4">
                                    <strong>Language:</strong> {submission.language}
                                </div>
                                
                                <div>
                                    <strong>Timestamp:</strong> {new Date(submission.timestamp).toLocaleString()}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg ${page === 1 ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={page === 1}
                >
                    Previous
                </button>
                <p className="text-gray-800">
                    Page {page} of {totalPages}
                </p>
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg ${page === totalPages ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    disabled={page === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default SubmissionsPage;
