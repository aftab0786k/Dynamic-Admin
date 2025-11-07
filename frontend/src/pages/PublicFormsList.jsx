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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Public Forms</h1>
          <p className="text-sm text-gray-500">Choose a form to fill or view submissions.</p>
        </header>

        {loading && <div className="py-8 text-center">Loading forms...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {forms.map((f) => (
            <div key={f._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{f.title}</h3>
                  <p className="text-sm text-gray-500">{f.description}</p>
                </div>
                <div className="text-xs text-gray-400">v{f.version ?? 1}</div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 items-center">
                {/* Fill button: redirect to form page /forms/:id */}
                <button
                  onClick={() => navigate(`/forms/${f._id}`)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Fill Form
                </button>

                {/* View Details: goes to submissions page /forms/:id/submissions */}
                <Link
                  to={`/forms/${f._id}/submissions`}
                  className="px-3 py-1 border rounded text-sm text-gray-700 hover:bg-gray-50"
                >
                  View Details
                </Link>

                <span className="text-sm text-gray-500 ml-auto break-all">#id: {f._id}</span>
              </div>
            </div>
          ))}

          {forms.length === 0 && !loading && <div className="col-span-full text-center text-gray-500 py-10">No forms found.</div>}
        </div>
      </div>
    </div>
  );
}
