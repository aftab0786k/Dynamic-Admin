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
  const [token, setToken] = useState(() => localStorage.getItem("ADMIN_TOKEN") || "");

  useEffect(() => {
    if (!id) return;
    if (token) loadAll();
    else loadFormOnly();
    // eslint-disable-next-line
  }, [id, token]);

  async function loadFormOnly() {
    // still show form title/desc even without token
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
      // fetch form meta too
      const [fRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/forms/${id}`),
        fetch(`${API_BASE}/admin/forms/${id}/submissions`, { headers: { "x-admin-token": token } })
      ]);

      if (fRes.ok) {
        const fd = await fRes.json();
        setFormInfo(fd);
      }

      if (!sRes.ok) {
        if (sRes.status === 401) throw new Error("Unauthorized — admin token required or invalid.");
        throw new Error("Failed to fetch submissions");
      }

      const sd = await sRes.json();
      // server returns { total, page, limit, submissions: [...] } or array
      const list = Array.isArray(sd) ? sd : (sd.submissions || sd.documents || []);
      setSubmissions(list);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold">Submissions</h1>
            <p className="text-sm text-gray-500">{formInfo ? formInfo.title : "Form submissions list"}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">Back</button>
            <input className="px-2 py-1 border rounded text-sm" placeholder="Admin token" value={token} onChange={(e)=> setToken(e.target.value)} />
            <button onClick={() => { localStorage.setItem("ADMIN_TOKEN", token); alert("Token saved"); if (token) loadAll(); }} className="px-3 py-1 bg-indigo-600 text-white rounded">Save token</button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

        {!token && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded mb-4">
            Admin token not found. Provide admin token to view submissions (save to localStorage or input above).
          </div>
        )}

        {loading && <div className="py-6 text-center">Loading submissions...</div>}

        {!loading && submissions.length === 0 && token && <div className="text-center text-gray-500 py-6">No submissions yet.</div>}

        {!loading && submissions.length > 0 && (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s._id} className="bg-white p-4 rounded shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-gray-500">Submitted: {new Date(s.submittedAt || s.createdAt || s.meta?.submittedAt || s._id ? s._id : Date.now()).toString()}</div>
                    <div className="mt-2">
                      {Object.entries(s.answers || s.data || s.responses || {}).map(([k, v]) => (
                        <div key={k} className="text-sm">
                          <strong className="mr-2 text-gray-700">{k}:</strong> <span className="text-gray-800">{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">id: {s._id}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
