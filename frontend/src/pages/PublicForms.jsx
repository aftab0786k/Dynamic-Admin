// src/components/PublicForm.jsx
import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000';

function FieldInput({ field, value, onChange }) {
  const commonProps = {
    id: field.name,
    name: field.name,
    value: value ?? '',
    onChange: (e) => onChange(field.name, e.target.value),
    className: 'w-full px-3 py-2 border rounded',
  };

  switch (field.type) {
    case 'textarea':
      return <textarea {...commonProps} rows={4} />;
    case 'number':
      return <input {...commonProps} type="number" min={field?.validation?.min} max={field?.validation?.max} />;
    case 'email':
      return <input {...commonProps} type="email" />;
    case 'date':
      return <input {...commonProps} type="date" />;
    case 'checkbox':
      // checkbox can be array of options or single boolean
      if (Array.isArray(field.options) && field.options.length) {
        return (
          <div className="flex flex-wrap gap-2">
            {field.options.map((opt) => (
              <label key={opt} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(opt) : false}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const prev = Array.isArray(value) ? value.slice() : [];
                    if (checked) prev.push(opt);
                    else {
                      const idx = prev.indexOf(opt);
                      if (idx >= 0) prev.splice(idx, 1);
                    }
                    onChange(field.name, prev);
                  }}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        );
      }
      return (
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(field.name, e.target.checked)} />
          <span className="text-sm">{field.label}</span>
        </label>
      );
    case 'radio':
      return (
        <div className="flex flex-col gap-2">
          {(field.options || []).map((opt) => (
            <label key={opt} className="inline-flex items-center gap-2">
              <input type="radio" name={field.name} checked={value === opt} onChange={() => onChange(field.name, opt)} />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      );
    case 'select':
      return (
        <select
          {...commonProps}
          value={value ?? ''}
          onChange={(e) => onChange(field.name, e.target.value)}
        >
          <option value="">-- select --</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'file':
      return (
        <input
          type="file"
          onChange={(e) => {
            const f = e.target.files && e.target.files[0];
            if (!f) return onChange(field.name, null);

            const reader = new FileReader();
            reader.onload = () => onChange(field.name, reader.result);
            reader.onerror = () => onChange(field.name, null);
            reader.readAsDataURL(f);
          }}
        />
      );
    default:
      return <input {...commonProps} type="text" />;
  }
}

export default function PublicForm() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchList() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/forms`);
      if (!res.ok) throw new Error('Failed to fetch forms');
      const data = await res.json();
      setForms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function startFill(form) {
    setSelected(form);
    const initial = {};
    (form.fields || []).forEach((f) => {
      if (f.type === 'checkbox') initial[f.name] = [];
      else initial[f.name] = '';
    });
    setAnswers(initial);
    setServerErrors({});
    setSuccessMsg('');
    // scroll to form on small screens
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 150);
  }

  function handleChange(name, value) {
    setAnswers((prev) => ({ ...prev, [name]: value }));
  }

  function clientValidate() {
    const errors = {};
    const fields = (selected && selected.fields) || [];
    fields.forEach((f) => {
      const v = answers[f.name];
      if (f.required) {
        const empty = v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
        if (empty) errors[f.name] = 'This field is required';
      }
      if (f.type === 'number' && v !== undefined && v !== '') {
        const num = Number(v);
        if (isNaN(num)) errors[f.name] = 'Must be a number';
        if (f.validation && typeof f.validation.min === 'number' && num < f.validation.min)
          errors[f.name] = `Minimum ${f.validation.min}`;
        if (f.validation && typeof f.validation.max === 'number' && num > f.validation.max)
          errors[f.name] = `Maximum ${f.validation.max}`;
      }
      if ((f.type === 'text' || f.type === 'textarea') && f.validation) {
        if (typeof f.validation.min === 'number' && String(v).length < f.validation.min)
          errors[f.name] = `Min length ${f.validation.min}`;
        if (typeof f.validation.max === 'number' && String(v).length > f.validation.max)
          errors[f.name] = `Max length ${f.validation.max}`;
      }
    });
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selected) return;
    setServerErrors({});
    setSuccessMsg('');

    const clientErr = clientValidate();
    if (Object.keys(clientErr).length) {
      setServerErrors(clientErr);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/forms/${selected._id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data && data.errors) setServerErrors(data.errors);
        else throw new Error(data.error || 'Submission failed');
      } else {
        setSuccessMsg('Submitted successfully!');
        setAnswers({});
      }
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Public Forms</h1>
          <p className="text-sm text-gray-500">Choose a form below and submit your response.</p>
        </header>

        {loading && <div className="text-center py-8">Loading forms...</div>}
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
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => startFill(f)} className="px-3 py-1 bg-indigo-600 text-white rounded">
                  Fill
                </button>
                <span className="text-sm text-gray-500 break-all">#id: {f._id}</span>
              </div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="mt-8 bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">{selected.title}</h2>
                <p className="text-sm text-gray-500">{selected.description}</p>
              </div>
              <div>
                <button className="text-sm text-gray-600" onClick={() => setSelected(null)}>
                  Close
                </button>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              {(selected.fields || [])
                .slice()
                .sort((a, b) => (a.order || 0) - (b.order || 0))
                .map((field) => (
                  <div key={field.name || Math.random()}>
                    <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label} {field.required ? <span className="text-red-500">*</span> : null}
                    </label>

                    <FieldInput field={field} value={answers[field.name]} onChange={handleChange} />

                    {serverErrors[field.name] && <div className="text-sm text-red-600 mt-1">{serverErrors[field.name]}</div>}
                  </div>
                ))}

              <div className="flex items-center gap-3">
                <button disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const cleared = {};
                    (selected.fields || []).forEach((f) => {
                      cleared[f.name] = f.type === 'checkbox' ? [] : '';
                    });
                    setAnswers(cleared);
                    setServerErrors({});
                    setSuccessMsg('');
                  }}
                  className="px-4 py-2 border rounded"
                >
                  Reset
                </button>
              </div>

              {successMsg && <div className="text-green-700">{successMsg}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
