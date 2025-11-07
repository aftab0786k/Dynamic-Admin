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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Form Submissions</h1>
              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-gray-600 text-lg">{formInfo?.title || "Form submissions list"}</p>
                {formInfo?.description && (
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {formInfo.description}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 text-gray-700 font-medium shadow-sm hover:shadow-md"
              >
                ← Back
              </button>
              <button 
                onClick={loadAll}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        {!loading && formInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="text-sm text-gray-500 font-medium">Total Submissions</div>
              <div className="text-3xl font-bold text-gray-800 mt-2">{submissions.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="text-sm text-gray-500 font-medium">Form Status</div>
              <div className="text-xl font-semibold text-green-600 mt-2">Active</div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="text-sm text-gray-500 font-medium">Last Updated</div>
              <div className="text-sm font-medium text-gray-800 mt-2">
                {submissions.length > 0 ? formatDate(submissions[0]?.submittedAt || submissions[0]?.createdAt) : 'No submissions'}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-500 text-lg">!</span>
              </div>
              <div>
                <h3 className="text-red-800 font-semibold">Error loading submissions</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 text-lg">Loading submissions...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && submissions.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl text-gray-400">📝</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">No submissions yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              This form hasn't received any submissions yet. Share the form link to start collecting responses.
            </p>
          </div>
        )}

        {/* Submissions List */}
        {!loading && submissions.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">All Responses</h2>
              <p className="text-gray-600">{submissions.length} submission{submissions.length !== 1 ? 's' : ''} collected</p>
            </div>

            {submissions.map((s, index) => (
              <div 
                key={s._id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 font-medium">Submitted</div>
                        <div className="text-gray-800 font-semibold">
                          {formatDate(s.submittedAt || s.createdAt || s.meta?.submittedAt || s._id)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                      ID: {s._id}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(s.answers || s.data || s.responses || {}).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          {key}
                        </div>
                        <div className="text-gray-800 font-medium break-words">
                          {Array.isArray(value) 
                            ? value.map((item, i) => (
                                <span key={i} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm mr-2 mb-1">
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