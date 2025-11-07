// src/components/PublicForm.jsx
import React, { useEffect, useState } from 'react';

const API_BASE = 'http://localhost:5000';

function FieldInput({ field, value, onChange }) {
  const commonProps = {
    id: field.name,
    name: field.name,
    value: value ?? '',
    onChange: (e) => onChange(field.name, e.target.value),
    className: 'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white',
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
      if (Array.isArray(field.options) && field.options.length) {
        return (
          <div className="space-y-2">
            {field.options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
                <span className="text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        );
      }
      return (
        <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer">
          <input 
            type="checkbox" 
            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            checked={!!value} 
            onChange={(e) => onChange(field.name, e.target.checked)} 
          />
          <span className="text-gray-700">{field.label}</span>
        </label>
      );
    case 'radio':
      return (
        <div className="space-y-2">
          {(field.options || []).map((opt) => (
            <label key={opt} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors duration-200 cursor-pointer">
              <input 
                type="radio" 
                name={field.name} 
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={value === opt} 
                onChange={() => onChange(field.name, opt)} 
              />
              <span className="text-gray-700">{opt}</span>
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
          <option value="">-- Select an option --</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case 'file':
      return (
        <div className="space-y-2">
          <input
            type="file"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={(e) => {
              const f = e.target.files && e.target.files[0];
              if (!f) return onChange(field.name, null);

              const reader = new FileReader();
              reader.onload = () => onChange(field.name, reader.result);
              reader.onerror = () => onChange(field.name, null);
              reader.readAsDataURL(f);
            }}
          />
          {value && (
            <div className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
              ✓ File selected
            </div>
          )}
        </div>
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
  }

  function handleChange(name, value) {
    setAnswers((prev) => ({ ...prev, [name]: value }));
    if (serverErrors[name]) {
      setServerErrors(prev => ({ ...prev, [name]: '' }));
    }
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
        setSuccessMsg('Form submitted successfully! Thank you for your response.');
        setAnswers({});
        setTimeout(() => {
          setSuccessMsg('');
          setSelected(null);
        }, 3000);
      }
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Available Forms
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose a form below to submit your response. All forms are publicly accessible.
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading forms...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-500">!</span>
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold">Unable to load forms</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                <button 
                  onClick={fetchList}
                  className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Forms Grid */}
        {!loading && forms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {forms.map((f) => (
              <div 
                key={f._id} 
                className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => startFill(f)}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 truncate">{f.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {f.description || 'No description provided'}
                      </p>
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        v{f.version ?? 1}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        startFill(f);
                      }}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                    >
                      <span>Fill Form</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <span className="text-xs text-gray-400 truncate max-w-[100px]">
                      #{f._id?.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && forms.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-200 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">📝</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No forms available</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              There are no public forms available at the moment. Please check back later.
            </p>
          </div>
        )}

        {/* Selected Form Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Form Header */}
              <div className="bg-blue-600 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-bold mb-1 truncate">{selected.title}</h2>
                    <p className="text-blue-100 text-sm truncate">
                      {selected.description || 'Please fill out the form below'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelected(null)}
                    className="flex-shrink-0 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded flex items-center justify-center transition-colors ml-3"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-4 max-h-[calc(90vh-120px)] overflow-y-auto">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  {(selected.fields || [])
                    .slice()
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((field) => (
                      <div 
                        key={field.name || Math.random()} 
                        className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                      >
                        <label htmlFor={field.name} className="block font-semibold text-gray-900 mb-2">
                          {field.label} 
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </label>

                        <FieldInput field={field} value={answers[field.name]} onChange={handleChange} />

                        {serverErrors[field.name] && (
                          <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <span>{serverErrors[field.name]}</span>
                          </div>
                        )}
                      </div>
                    ))}

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Submit Form</span>
                        </>
                      )}
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
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Success Message */}
                  {successMsg && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-green-800 font-medium text-sm">Success!</h4>
                          <p className="text-green-700 text-xs">{successMsg}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}