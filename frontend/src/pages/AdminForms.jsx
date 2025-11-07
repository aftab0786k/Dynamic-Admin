// src/pages/AdminForms.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // optional, only if you use react-router

const API_BASE = 'http://localhost:5000';

export default function AdminForms() {
  // admin endpoints are public now
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  // optional navigation (if using React Router)
  const navigate = typeof useNavigate === 'function' ? useNavigate() : null;

  useEffect(() => {
    fetchForms();
    // eslint-disable-next-line
  }, []);

  async function fetchForms() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/forms`);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed: ${res.status} ${txt}`);
      }
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this form?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/forms/${id}`, {
        method: 'DELETE',
        // no auth header
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Delete failed: ${res.status} ${txt}`);
      }
      setForms(prev => prev.filter(f => f._id !== id));
      if (selected && selected._id === id) setSelected(null);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Admin — Forms</h1>
            <p className="text-sm text-gray-500 mt-1">Manage forms created for users (GET /admin/forms).</p>
          </div>

          <div className="flex gap-2 items-center">
              {/* Admin token removed — admin routes are public now */}
            <button onClick={fetchForms} className="px-3 py-2 border rounded">Refresh</button>
            {navigate && <button onClick={() => navigate('/admin/new')} className="px-3 py-2 bg-green-600 text-white rounded">New Form</button>}
          </div>
        </header>

        {loading && <div className="text-center py-8">Loading...</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map(form => (
            <article key={form._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium">{form.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{form.description}</p>
                </div>
                <div className="text-xs text-gray-400">v{form.version ?? 1}</div>
              </div>

              <div className="mt-3 text-xs text-gray-500">
                <div>Fields: <span className="font-medium text-gray-700">{Array.isArray(form.fields) ? form.fields.length : 0}</span></div>
                <div className="mt-1">Created: {new Date(form.createdAt).toLocaleString()}</div>
              </div>

              <div className="mt-3 flex gap-2">
                <button onClick={() => setSelected(form)} className="px-3 py-1 border rounded text-sm">View</button>
                <button onClick={() => { if (navigate) navigate(`/admin/edit/${form._id}`); else alert('Open edit page manually at /admin/edit/' + form._id); }} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">Edit</button>
                <button onClick={() => handleDelete(form._id)} className="px-3 py-1 border rounded text-sm text-red-600">Delete</button>
              </div>
            </article>
          ))}
        </div>

        {forms.length === 0 && !loading && <div className="text-center text-gray-500 py-10">No forms yet.</div>}

        {/* Details modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-3xl p-6 shadow-lg max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-semibold">{selected.title}</h3>
                  <p className="text-sm text-gray-500">{selected.description}</p>
                </div>
                <div>
                  <button onClick={() => setSelected(null)} className="px-3 py-1 bg-gray-100 rounded">Close</button>
                </div>
              </div>

              <hr className="my-4" />

              <div className="space-y-3">
                {(selected.fields || []).slice().sort((a,b) => (a.order||0)-(b.order||0)).map((f, idx) => (
                  <div key={f.name || idx} className="p-3 border rounded bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium">{f.label} <span className="text-xs text-gray-400">({f.name})</span></div>
                        <div className="text-xs text-gray-500 mt-1">Type: {f.type} {f.required ? <span className="ml-2 text-red-500">*</span> : null}</div>
                      </div>
                      <div className="text-xs text-gray-500 text-right">
                        <div>Order: {f.order ?? 0}</div>
                      </div>
                    </div>

                    {Array.isArray(f.options) && f.options.length > 0 && (
                      <div className="mt-2 text-xs">Options: {f.options.join(', ')}</div>
                    )}

                    {f.validation && (
                      <div className="mt-2 text-xs text-gray-600">Validation: {f.validation.min ?? '-'} to {f.validation.max ?? '-'} {f.validation.regex ? `, regex: ${f.validation.regex}` : ''}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
