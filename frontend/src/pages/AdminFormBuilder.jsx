// src/pages/AdminFormBuilder.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // optional if you use react-router

const API_BASE = 'http://localhost:5000';
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
    <div className="bg-gray-50 p-2 rounded mt-2">
      <div className="flex justify-between items-center mb-2 text-sm">
        <div>Options</div>
        <button onClick={addOpt} className="px-2 py-1 bg-indigo-600 text-white text-sm rounded">Add</button>
      </div>
      <div className="space-y-2">
        {(field.options||[]).map((o,i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={o} onChange={e => setOpt(i, e.target.value)} className="flex-1 px-2 py-1 border rounded text-sm" />
            <button onClick={() => delOpt(i)} className="px-2 py-1 border rounded text-sm">Remove</button>
          </div>
        ))}
        {(field.options||[]).length === 0 && <div className="text-xs text-gray-500">No options</div>}
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
    <div className="mt-3 bg-gray-50 p-3 rounded">
      <div className="text-sm mb-2">Nested fields (per option)</div>

      {(list||[]).map((n, idx) => (
        <div key={idx} className="p-2 border rounded bg-white mb-3">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm">When option: <strong>{n.optionValue}</strong></div>
            <div className="flex gap-2">
              <button onClick={() => removeNested(idx)} className="px-2 py-1 border rounded text-sm">Remove</button>
            </div>
          </div>

          <div className="space-y-2">
            {(n.fields || []).map((nf, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={nf.label} onChange={e => {
                  const arr = (n.fields||[]).slice(); arr[i] = { ...arr[i], label: e.target.value }; updateNested(idx, { ...n, fields: arr });
                }} className="px-2 py-1 border rounded w-48 text-sm" placeholder="label" />
                <input value={nf.name} onChange={e => {
                  const arr = (n.fields||[]).slice(); arr[i] = { ...arr[i], name: e.target.value }; updateNested(idx, { ...n, fields: arr });
                }} className="px-2 py-1 border rounded w-36 text-sm" placeholder="name" />
                <select value={nf.type} onChange={e => {
                  const arr = (n.fields||[]).slice(); arr[i] = { ...arr[i], type: e.target.value }; updateNested(idx, { ...n, fields: arr });
                }} className="px-2 py-1 border rounded text-sm">
                  {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <div className="ml-auto flex gap-1">
                  <button onClick={() => { const arr = (n.fields||[]).slice(); const j = i-1; if (j<0) return; const tmp = arr[j]; arr[j] = arr[i]; arr[i] = tmp; updateNested(idx, { ...n, fields: arr }); }} className="px-2 py-1 border rounded text-sm">▲</button>
                  <button onClick={() => { const arr = (n.fields||[]).slice(); const j = i+1; if (j>=arr.length) return; const tmp = arr[j]; arr[j] = arr[i]; arr[i] = tmp; updateNested(idx, { ...n, fields: arr }); }} className="px-2 py-1 border rounded text-sm">▼</button>
                  <button onClick={() => { const arr = (n.fields||[]).slice(); arr.splice(i,1); updateNested(idx, { ...n, fields: arr }); }} className="px-2 py-1 border rounded text-sm text-red-600">Remove</button>
                </div>
              </div>
            ))}

            <div>
              <button onClick={() => {
                const arr = (n.fields||[]).slice(); arr.push(blankField({})); updateNested(idx, { ...n, fields: arr });
              }} className="px-2 py-1 bg-green-600 text-white rounded text-sm">Add nested field</button>
            </div>
          </div>
        </div>
      ))}

      <div className="flex gap-2 items-center">
        <select id="opt-for-nested" className="px-2 py-1 border rounded text-sm">
          <option value="">Choose option</option>
          {(field.options||[]).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <button onClick={() => {
          const sel = document.getElementById('opt-for-nested');
          const v = sel?.value;
          if (!v) return alert('Select option');
          if ((list||[]).some(x => x.optionValue === v)) return alert('Already exists');
          addFor(v);
          sel.value = '';
        }} className="px-2 py-1 bg-indigo-600 text-white text-sm rounded">Add nested for option</button>
      </div>
    </div>
  );
}

export default function AdminFormBuilder() {
  // if using react-router edit route, use useParams to get :id
  const params = typeof useParams === 'function' ? useParams() : {};
  const navigate = typeof useNavigate === 'function' ? useNavigate() : null;
  const formId = params?.id || null;

  // admin endpoints are public
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
      if (!res.ok) throw new Error('Load failed');
      const data = await res.json();
      setTitle(data.title || '');
      setDescription(data.description || '');
      setFields((data.fields || []).map((f, i) => ({ ...f, order: f.order ?? i })));
    } catch (err) {
      setError(err.message || 'Load failed');
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
      if (!names[i]) return `Field ${i + 1} name required`;
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
      setSuccess('Saved successfully');
      if (!formId && data._id && navigate) {
        navigate(`/admin/edit/${data._id}`);
      }
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Admin — Form Builder</h1>
            <p className="text-sm text-gray-500">Create or edit forms. Data saved to backend endpoints.</p>
          </div>
          <div className="flex gap-2">
            {/* Admin token removed — admin routes are public now */}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="mb-3">
            <label className="text-sm text-gray-700 block">Title</label>
            <input className="w-full px-3 py-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-gray-700 block">Description</label>
            <textarea className="w-full px-3 py-2 border rounded" rows="2" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3 gap-4">
          <h2 className="text-lg font-medium">Fields</h2>
          <div className="flex gap-2">
            <button onClick={addField} className="px-3 py-2 bg-green-600 text-white rounded">Add Field</button>
            <button onClick={() => { setFields([]); }} className="px-3 py-2 border rounded">Clear</button>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {fields.length === 0 && <div className="text-sm text-gray-500">No fields yet. Click Add Field to start.</div>}
          {fields.map((f, i) => (
            <div key={f.name || i} className="p-3 border rounded bg-white shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex gap-2 items-center flex-wrap">
                    <input value={f.label} onChange={e => updateField(i, { ...f, label: e.target.value })} className="px-2 py-1 border rounded w-48 text-sm" placeholder="Label" />
                    <input value={f.name} onChange={e => updateField(i, { ...f, name: e.target.value })} className="px-2 py-1 border rounded w-40 text-sm" placeholder="name (unique)" />
                    <select value={f.type} onChange={e => updateField(i, { ...f, type: e.target.value, options: (e.target.value === 'select' || e.target.value === 'radio' || e.target.value === 'checkbox') ? f.options : [] })} className="px-2 py-1 border rounded text-sm">
                      {fieldTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>

                    <label className="inline-flex items-center gap-2 text-sm ml-2">
                      <input type="checkbox" checked={!!f.required} onChange={e => updateField(i, { ...f, required: e.target.checked })} />
                      <span>required</span>
                    </label>
                  </div>

                  {(f.type === 'select' || f.type === 'radio' || f.type === 'checkbox') && (
                    <OptionsEditor field={f} onFieldChange={nf => updateField(i, nf)} />
                  )}

                  <div className="mt-3 flex gap-2 items-center text-sm">
                    <input value={f.validation?.min ?? ''} onChange={e => updateField(i, { ...f, validation: { ...f.validation, min: e.target.value === '' ? undefined : Number(e.target.value) } })} placeholder="min" className="px-2 py-1 border rounded w-20" />
                    <input value={f.validation?.max ?? ''} onChange={e => updateField(i, { ...f, validation: { ...f.validation, max: e.target.value === '' ? undefined : Number(e.target.value) } })} placeholder="max" className="px-2 py-1 border rounded w-20" />
                    <input value={f.validation?.regex ?? ''} onChange={e => updateField(i, { ...f, validation: { ...f.validation, regex: e.target.value || undefined } })} placeholder="regex (optional)" className="px-2 py-1 border rounded flex-1" />
                  </div>

                  {(f.type === 'select' || f.type === 'radio') && (
                    <NestedEditor field={f} onFieldChange={nf => updateField(i, nf)} />
                  )}
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-1">
                    <button onClick={() => moveField(i, -1)} className="px-2 py-1 rounded border text-sm">▲</button>
                    <button onClick={() => moveField(i, 1)} className="px-2 py-1 rounded border text-sm">▼</button>
                  </div>
                  <button onClick={() => removeField(i)} className="px-2 py-1 rounded bg-red-50 text-red-600 border">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-3">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-3">{success}</div>}

        <div className="flex gap-3">
          <button disabled={saving} onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded">{saving ? 'Saving...' : 'Save Form'}</button>
          <button onClick={() => { setTitle(''); setDescription(''); setFields([]); setError(null); setSuccess(null); }} className="px-4 py-2 border rounded">Reset</button>
          {navigate && <button onClick={() => navigate('/admin')} className="px-4 py-2 border rounded">Back</button>}
        </div>
      </div>
    </div>
  );
}
