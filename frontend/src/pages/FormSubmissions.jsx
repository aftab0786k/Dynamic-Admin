// src/pages/FormSubmissions.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

export default function FormSubmissions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [formInfo, setFormInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    loadAll();
    // eslint-disable-next-line
  }, [id]);

  async function loadFormOnly() {
    try {
      const res = await fetch(`${API_BASE}/forms/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      setFormInfo(data);
    } catch (_) {}
  }

  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [fRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/forms/${id}`),
        fetch(`${API_BASE}/admin/forms/${id}/submissions`)
      ]);

      if (fRes.ok) {
        const fd = await fRes.json();
        setFormInfo(fd);
      }

      if (!sRes.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const sd = await sRes.json();
      const list = Array.isArray(sd) ? sd : (sd.submissions || sd.documents || []);
      setSubmissions(list);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 break-words">
                Form Submissions
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                <p className="text-gray-600 text-base sm:text-lg break-words">
                  {formInfo?.title || "Form submissions list"}
                </p>
                {formInfo?.description && (
                  <span className="inline-flex text-xs text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full max-w-full break-words">
                    {formInfo.description}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 sm:gap-3 flex-shrink-0">
              <button 
                onClick={() => navigate(-1)}
                className="px-4 py-2 sm:px-5 sm:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium text-sm sm:text-base shadow-sm hover:shadow-md flex items-center"
              >
                <span className="mr-1">←</span> Back
              </button>
              <button 
                onClick={loadAll}
                className="px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm sm:text-base shadow-sm hover:shadow-md"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && formInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 border-l-4 border-blue-500">
              <div className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Total Submissions</div>
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">{submissions.length}</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 border-l-4 border-green-500">
              <div className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Form Status</div>
              <div className="text-lg sm:text-xl font-semibold text-green-600">Active</div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 border-l-4 border-purple-500">
              <div className="text-xs sm:text-sm text-gray-500 font-medium mb-1">Last Updated</div>
              <div className="text-sm font-medium text-gray-900">
                {submissions.length > 0 ? formatDate(submissions[0]?.submittedAt || submissions[0]?.createdAt) : 'No submissions'}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-500 text-sm sm:text-lg">!</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-red-800 font-semibold text-sm sm:text-base">Error loading submissions</h3>
                <p className="text-red-600 text-xs sm:text-sm mt-1 break-words">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-base sm:text-lg">Loading submissions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && submissions.length === 0 && !error && (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <span className="text-2xl sm:text-3xl text-gray-400">📝</span>
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No submissions yet</h3>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto px-4">
              This form hasn't received any submissions yet. Share the form link to start collecting responses.
            </p>
          </div>
        )}

        {/* Submissions List */}
        {!loading && submissions.length > 0 && (
          <div className="space-y-4 sm:space-y-6">
            {/* Responses Header */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">All Responses</h2>
              <p className="text-gray-600 text-sm sm:text-base">
                {submissions.length} submission{submissions.length !== 1 ? 's' : ''} collected
              </p>
            </div>

            {/* Submission Cards */}
            {submissions.map((s, index) => (
              <div 
                key={s._id} 
                className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  {/* Submission Header */}
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                        #{index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-500 font-medium mb-1">Submitted</div>
                        <div className="text-gray-900 font-semibold text-sm sm:text-base break-words">
                          {formatDate(s.submittedAt || s.createdAt || s.meta?.submittedAt || s._id)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md font-mono break-all max-w-full">
                      ID: {s._id}
                    </div>
                  </div>

                  {/* Form Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                    {Object.entries(s.answers || s.data || s.responses || {}).map(([key, value]) => (
                      <div 
                        key={key} 
                        className="bg-gray-50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100"
                      >
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 sm:mb-2 break-words">
                          {key}
                        </div>
                        <div className="text-gray-900 font-medium text-sm sm:text-base break-words">
                          {Array.isArray(value) 
                            ? value.map((item, i) => (
                                <span 
                                  key={i} 
                                  className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2 mb-1 break-words max-w-full"
                                >
                                  {String(item)}
                                </span>
                              ))
                            : String(value)
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}