// src/pages/PublicFormsList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function PublicFormsList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchList();
  }, []);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/forms`);
      if (!res.ok) throw new Error("Failed to fetch forms");
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Available Forms
          </h1>
          <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
            Choose a form to fill out or view existing submissions
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm">Loading forms...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-500 text-sm">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-red-800 font-semibold text-sm">Unable to load forms</h3>
                <p className="text-red-600 text-xs mt-1 break-words">{error}</p>
                <button 
                  onClick={fetchList}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Forms Grid */}
        {!loading && forms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {forms.map((f) => (
              <div 
                key={f._id} 
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
              >
                <div className="p-4 flex-1 flex flex-col min-h-0">
                  {/* Form Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 mr-2">
                      <h3 className="font-semibold text-gray-900 text-base mb-1 truncate" title={f.title}>
                        {f.title}
                      </h3>
                      <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 h-8 overflow-hidden">
                        {f.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        v{f.version ?? 1}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Active</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mb-3">
                    <button
                      onClick={() => navigate(`/forms/${f._id}`)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Fill Form
                    </button>

                    <Link
                      to={`/forms/${f._id}/submissions`}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors font-medium text-center"
                    >
                      View Details
                    </Link>
                  </div>

                  {/* Form ID */}
                  <div className="mt-auto pt-2 border-t border-gray-100">
                    <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded font-mono truncate" title={f._id}>
                      ID: {f._id}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && forms.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">📝</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No forms available</h3>
            <p className="text-gray-500 text-sm mb-4 px-4">
              There are no public forms available at the moment.
            </p>
            <button 
              onClick={fetchList}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors font-medium"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
}