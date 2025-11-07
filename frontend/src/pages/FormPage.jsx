// src/pages/FormPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000";

// Reuse FieldInput implementation (same behavior as you provided)
function FieldInput({ field, value, onChange }) {
  const commonProps = {
    id: field.name,
    name: field.name,
    value: value ?? "",
    onChange: (e) => onChange(field.name, e.target.value),
    className: "w-full px-3 py-2 border rounded",
  };

  switch (field.type) {
    case "textarea":
      return <textarea {...commonProps} rows={4} />;
    case "number":
      return <input {...commonProps} type="number" min={field?.validation?.min} max={field?.validation?.max} />;
    case "email":
      return <input {...commonProps} type="email" />;
    case "date":
      return <input {...commonProps} type="date" />;
    case "checkbox":
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
    case "radio":
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
    case "select":
      return (
        <select {...commonProps} value={value ?? ""} onChange={(e) => onChange(field.name, e.target.value)}>
          <option value="">-- select --</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "file":
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

export default function FormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    loadForm(id);
  }, [id]);

  async function loadForm(formId) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/forms/${formId}`);
      if (!res.ok) throw new Error("Failed to load form");
      const data = await res.json();
      setForm(data);
      // init answers
      const init = {};
      (data.fields || []).forEach((f) => {
        init[f.name] = f.type === "checkbox" ? [] : "";
      });
      setAnswers(init);
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(name, value) {
    setAnswers((p) => ({ ...p, [name]: value }));
  }

  function clientValidate() {
    const errors = {};
    (form.fields || []).forEach((f) => {
      const v = answers[f.name];
      if (f.required) {
        const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
        if (empty) errors[f.name] = "This field is required";
      }
      if (f.type === "number" && v !== undefined && v !== "") {
        const num = Number(v);
        if (isNaN(num)) errors[f.name] = "Must be a number";
        if (f.validation && typeof f.validation.min === "number" && num < f.validation.min)
          errors[f.name] = `Minimum ${f.validation.min}`;
        if (f.validation && typeof f.validation.max === "number" && num > f.validation.max)
          errors[f.name] = `Maximum ${f.validation.max}`;
      }
    });
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form) return;
    setServerErrors({});
    setSuccessMsg("");
    setError(null);

    const clientErr = clientValidate();
    if (Object.keys(clientErr).length) {
      setServerErrors(clientErr);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/forms/${id}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data && data.errors) setServerErrors(data.errors);
        else throw new Error(data.error || "Submission failed");
      } else {
        setSuccessMsg("Submitted successfully!");
        // reset answers
        const cleared = {};
        (form.fields || []).forEach((f) => (cleared[f.name] = f.type === "checkbox" ? [] : ""));
        setAnswers(cleared);
      }
    } catch (err) {
      setError(err.message || "Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="p-6 text-center">Loading form...</div>;
  if (!form) return <div className="p-6 text-center text-gray-500">Form not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">{form.title}</h1>
            <p className="text-sm text-gray-500">{form.description}</p>
          </div>
          <div>
            <button onClick={() => navigate(-1)} className="px-3 py-1 border rounded">Back</button>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(form.fields || []).slice().sort((a,b)=> (a.order||0)-(b.order||0)).map((field) => (
            <div key={field.name || Math.random()}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label} {field.required ? <span className="text-red-500">*</span> : null}
              </label>

              <FieldInput field={field} value={answers[field.name]} onChange={handleChange} />
              {serverErrors[field.name] && <div className="text-sm text-red-600 mt-1">{serverErrors[field.name]}</div>}
            </div>
          ))}

          <div className="flex items-center gap-3">
            <button disabled={submitting} className="px-4 py-2 bg-green-600 text-white rounded">{submitting ? "Submitting..." : "Submit"}</button>
            <button type="button" onClick={() => {
              const cleared = {};
              (form.fields || []).forEach((f) => (cleared[f.name] = f.type === "checkbox" ? [] : ""));
              setAnswers(cleared);
              setServerErrors({});
              setSuccessMsg("");
            }} className="px-4 py-2 border rounded">Reset</button>
            <button type="button" onClick={() => navigate(`/forms/${id}/submissions`)} className="px-4 py-2 border rounded">View Submissions</button>
          </div>

          {successMsg && <div className="text-green-700">{successMsg}</div>}
        </form>
      </div>
    </div>
  );
}
