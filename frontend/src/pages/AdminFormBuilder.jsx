// src/pages/AdminFormBuilder.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'https://dynamic-admin.onrender.com';
const fieldTypes = ['text','textarea','number','email','date','checkbox','radio','select','file'];

function blankField(overrides = {}) {
  return {
    label: overrides.label ?? '',
    name: overrides.name ?? '',
    type: overrides.type ?? 'text',
    required: !!overrides.required,
    options: Array.isArray(overrides.options) ? overrides.options.slice() : [],
    validation: overrides.validation ? {...overrides.validation} : {},
    order: typeof overrides.order === 'number' ? overrides.order : 0,
    nested: Array.isArray(overrides.nested) ? overrides.nested.slice() : []
  };
}

function OptionsEditor({ field, onFieldChange }) {
  const addOpt = () => onFieldChange({ ...field, options: [...(field.options||[]), `option-${(field.options||[]).length+1}`] });
  const setOpt = (i, v) => { const o = (field.options||[]).slice(); o[i] = v; onFieldChange({ ...field, options: o }); };
  const delOpt = (i) => { const o = (field.options||[]).slice(); o.splice(i,1); onFieldChange({ ...field, options: o }); };

  return (
    <div className="bg-gray-50 p-3 rounded border border-gray-200 mt-3">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-700">Options</div>
        <button onClick={addOpt} className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add
        </button>
      </div>
      <div className="space-y-2">
        {(field.options||[]).map((o,i) => (
          <div key={i} className="flex gap-2 items-center">
            <input 
              value={o} 
              onChange={e => setOpt(i, e.target.value)} 
              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
              placeholder="Option value"
            />
            <button 
              onClick={() => delOpt(i)} 
              className="px-2 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-xs flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>
        ))}
        {(field.options||[]).length === 0 && (
          <div className="text-center text-gray-500 text-xs py-2 bg-white rounded border border-dashed border-gray-300">
            No options added yet
          </div>
        )}
      </div>
    </div>
  );
}

function NestedEditor({ field, onFieldChange }) {
  const list = field.nested || [];

  function addFor(v) {
    const n = (list||[]).slice();
    n.push({ optionValue: v, fields: [] });
    onFieldChange({ ...field, nested: n });
  }

  const removeNested = (i) => { const n = (list||[]).slice(); n.splice(i,1); onFieldChange({ ...field, nested: n }); };
  const updateNested = (i, nobj) => { const n = (list||[]).slice(); n[i] = nobj; onFieldChange({ ...field, nested: n }); };

  return (
    <div className="mt-3 bg-gray-50 p-3 rounded border border-gray-200">
      <div className="text-xs font-medium text-gray-700 mb-2">Conditional Fields</div>

      {(list||[]).map((n, idx) => (
        <div key={idx} className="p-3 border border-gray-300 rounded bg-white mb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="text-xs">
              When <span className="font-semibold text-blue-600 bg-blue-50 px-1 py-0.5 rounded">{n.optionValue}</span> selected
            </div>
            <button 
              onClick={() => removeNested(idx)} 
              className="px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-xs flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          </div>

          <div className="space-y-2">
            {(n.fields || []).map((nf, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-1 items-start">
                <input 
                  value={nf.label} 
                  onChange={e => {
                    const arr = (n.fields||[]).slice(); 
                    arr[i] = { ...arr[i], label: e.target.value }; 
                    updateNested(idx, { ...n, fields: arr });
                  }} 
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Label"
                />
                <input 
                  value={nf.name} 
                  onChange={e => {
                    const arr = (n.fields||[]).slice(); 
                    arr[i] = { ...arr[i], name: e.target.value }; 
                    updateNested(idx, { ...n, fields: arr });
                  }} 
                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Name"
                />
                <select 
                  value={nf.type} 
                  onChange={e => {
                    const arr = (n.fields||[]).slice(); 
                    arr[i] = { ...arr[i], type: e.target.value }; 
                    updateNested(idx, { ...n, fields: arr });
                  }} 
                  className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <div className="flex gap-1">
                  <button 
                    onClick={() => { 
                      const arr = (n.fields||[]).slice(); 
                      const j = i-1; 
                      if (j<0) return; 
                      const tmp = arr[j]; 
                      arr[j] = arr[i]; 
                      arr[i] = tmp; 
                      updateNested(idx, { ...n, fields: arr }); 
                    }} 
                    className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    disabled={i === 0}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => { 
                      const arr = (n.fields||[]).slice(); 
                      const j = i+1; 
                      if (j>=arr.length) return; 
                      const tmp = arr[j]; 
                      arr[j] = arr[i]; 
                      arr[i] = tmp; 
                      updateNested(idx, { ...n, fields: arr }); 
                    }} 
                    className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    disabled={i === (n.fields || []).length - 1}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => { 
                      const arr = (n.fields||[]).slice(); 
                      arr.splice(i,1); 
                      updateNested(idx, { ...n, fields: arr }); 
                    }} 
                    className="px-2 py-1 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors text-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button 
              onClick={() => {
                const arr = (n.fields||[]).slice(); 
                arr.push(blankField({})); 
                updateNested(idx, { ...n, fields: arr });
              }} 
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Field
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-col sm:flex-row gap-2 items-center mt-3">
        <select 
          className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex-1"
          defaultValue=""
        >
          <option value="">Select option</option>
          {(field.options||[]).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <button 
          onClick={() => {
            const sel = document.querySelector('select');
            const v = sel?.value;
            if (!v) return alert('Please select an option');
            if ((list||[]).some(x => x.optionValue === v)) return alert('Already exists for this option');
            addFor(v);
            sel.value = '';
          }} 
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs flex items-center gap-1 whitespace-nowrap"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Conditional
        </button>
      </div>
    </div>
  );
}

export default function AdminFormBuilder() {
  const params = useParams();
  const navigate = useNavigate();
  const formId = params?.id || null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (formId) loadForm(formId);
    // eslint-disable-next-line
  }, [formId]);

  async function loadForm(id) {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin/forms/${id}`);
      if (!res.ok) throw new Error('Failed to load form');
      const data = await res.json();
      setTitle(data.title || '');
      setDescription(data.description || '');
      setFields((data.fields || []).map((f, i) => ({ ...f, order: f.order ?? i })));
    } catch (err) {
      setError(err.message || 'Failed to load form');
    } finally {
      setLoading(false);
    }
  }

  function addField() {
    setFields(prev => [...prev, blankField({ order: prev.length })]);
  }

  function updateField(i, updated) {
    setFields(prev => { const a = prev.slice(); a[i] = { ...updated, order: updated.order ?? i }; return a; });
  }

  function removeField(i) {
    setFields(prev => { const a = prev.slice(); a.splice(i,1); return a.map((f, idx) => ({ ...f, order: idx })); });
  }

  function moveField(i, dir) {
    setFields(prev => {
      const a = prev.slice();
      const j = i + dir;
      if (j < 0 || j >= a.length) return a;
      const tmp = a[j]; a[j] = a[i]; a[i] = tmp;
      return a.map((f, idx) => ({ ...f, order: idx }));
    });
  }

  function validateBeforeSave() {
    if (!title.trim()) return 'Title is required';
    const names = fields.map(f => f.name?.trim() || '');
    for (let i = 0; i < names.length; i++) {
      if (!names[i]) return `Field ${i + 1} name is required`;
      if (names.indexOf(names[i]) !== i) return `Duplicate field name: ${names[i]}`;
    }
    return null;
  }

  async function handleSave() {
    const v = validateBeforeSave();
    if (v) return setError(v);
    setSaving(true); setError(null); setSuccess(null);
    const payload = {
      title,
      description,
      fields: fields.map(f => ({
        label: f.label, name: f.name, type: f.type, required: !!f.required,
        options: f.options || [], validation: f.validation || {}, order: f.order || 0, nested: f.nested || []
      }))
    };

    try {
      const url = formId ? `${API_BASE}/admin/forms/${formId}` : `${API_BASE}/admin/forms`;
      const method = formId ? 'PUT' : 'POST';
      const headers = { 'Content-Type': 'application/json' };
      const res = await fetch(url, { method, headers, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || JSON.stringify(data));
      setSuccess('Form saved successfully!');
      if (!formId && data._id) {
        navigate(`/admin/edit/${data._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 mb-1">Form Builder</h1>
              <p className="text-gray-600 text-sm">Create or edit forms with custom fields</p>
            </div>
            <div className="flex gap-2">
              {navigate && (
                <button 
                  onClick={() => navigate('/admin')} 
                  className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Form Info */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Form Information</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm" 
                rows="2" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Fields Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Form Fields</h2>
            <div className="flex gap-2">
              <button 
                onClick={addField} 
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Field
              </button>
              <button 
                onClick={() => { setFields([]); }} 
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-6">
              <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          )}

          <div className="space-y-3">
            {fields.length === 0 && !loading && (
              <div className="text-center py-8 bg-gray-50 rounded border-2 border-dashed border-gray-300">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500 text-sm mb-3">No fields added yet</p>
                <button 
                  onClick={addField} 
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Add First Field
                </button>
              </div>
            )}

            {fields.map((f, i) => (
              <div key={f.name || i} className="border border-gray-300 rounded bg-white p-3">
                <div className="flex flex-col gap-3">
                  {/* Basic Field Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Label</label>
                      <input 
                        value={f.label} 
                        onChange={e => updateField(i, { ...f, label: e.target.value })} 
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Field label"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                      <input 
                        value={f.name} 
                        onChange={e => updateField(i, { ...f, name: e.target.value })} 
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="field_name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select 
                        value={f.type} 
                        onChange={e => updateField(i, { ...f, type: e.target.value, options: (e.target.value === 'select' || e.target.value === 'radio' || e.target.value === 'checkbox') ? f.options : [] })} 
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!f.required} 
                          onChange={e => updateField(i, { ...f, required: e.target.checked })} 
                          className="w-3 h-3 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span>Required field</span>
                      </label>
                    </div>
                  </div>

                  {/* Validation */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Min</label>
                      <input 
                        value={f.validation?.min ?? ''} 
                        onChange={e => updateField(i, { ...f, validation: { ...f.validation, min: e.target.value === '' ? undefined : Number(e.target.value) } })} 
                        placeholder="Min" 
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max</label>
                      <input 
                        value={f.validation?.max ?? ''} 
                        onChange={e => updateField(i, { ...f, validation: { ...f.validation, max: e.target.value === '' ? undefined : Number(e.target.value) } })} 
                        placeholder="Max" 
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Regex</label>
                      <input 
                        value={f.validation?.regex ?? ''} 
                        onChange={e => updateField(i, { ...f, validation: { ...f.validation, regex: e.target.value || undefined } })} 
                        placeholder="Regex pattern" 
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Options Editor */}
                  {(f.type === 'select' || f.type === 'radio' || f.type === 'checkbox') && (
                    <OptionsEditor field={f} onFieldChange={nf => updateField(i, nf)} />
                  )}

                  {/* Nested Editor */}
                  {(f.type === 'select' || f.type === 'radio') && (
                    <NestedEditor field={f} onFieldChange={nf => updateField(i, nf)} />
                  )}

                  {/* Field Actions */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <div className="flex gap-1">
                      <button 
                        onClick={() => moveField(i, -1)} 
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        disabled={i === 0}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => moveField(i, 1)} 
                        className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        disabled={i === fields.length - 1}
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    <button 
                      onClick={() => removeField(i)} 
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-red-800 font-semibold text-sm">Error</h4>
                <p className="text-red-700 text-xs mt-0.5">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-green-800 font-semibold text-sm">Success</h4>
                <p className="text-green-700 text-xs mt-0.5">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Save Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            disabled={saving} 
            onClick={handleSave} 
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Save Form</span>
              </>
            )}
          </button>
          
          <button 
            onClick={() => { setTitle(''); setDescription(''); setFields([]); setError(null); setSuccess(null); }} 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            Reset Form
          </button>
        </div>
      </div>
    </div>
  );
}