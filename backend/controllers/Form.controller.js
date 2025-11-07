// backend/controllers/Form.controller.js
import Form from '../models/Form.model.js';

/**
 * Create form
 */
export async function createForm(req, res, next) {
  try {
    const payload = req.body;
    if (!payload.title) return res.status(400).json({ error: 'title required' });

    // Basic: ensure field names are unique within fields
    if (Array.isArray(payload.fields)) {
      const names = payload.fields.map(f => f.name);
      const dup = names.find((v, i) => names.indexOf(v) !== i);
      if (dup) return res.status(400).json({ error: `Duplicate field name: ${dup}` });
    }

    const form = new Form(payload);
    await form.save();
    res.status(201).json(form);
  } catch (err) {
    next(err);
  }
}

/**
 * List forms (brief)
 */
export async function listForms(req, res, next) {
  try {
    const forms = await Form.find({}, { title: 1, description: 1, version: 1, createdAt: 1 }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) { next(err); }
}

/**
 * Get form by id (full)
 */
export async function getForm(req, res, next) {
  try {
    const { id } = req.params;
    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) { next(err); }
}

/**
 * Update form - increments version if fields changed
 */
export async function updateForm(req, res, next) {
  try {
    const { id } = req.params;
    const payload = req.body;
    const existing = await Form.findById(id);
    if (!existing) return res.status(404).json({ error: 'Form not found' });

    // basic check: if fields changed (naive), bump version
    const fieldsChanged = JSON.stringify(existing.fields || []) !== JSON.stringify(payload.fields || []);
    existing.title = payload.title ?? existing.title;
    existing.description = payload.description ?? existing.description;
    if (payload.fields) existing.fields = payload.fields;
    if (fieldsChanged) existing.version = (existing.version || 1) + 1;
    existing.updatedAt = new Date();

    await existing.save();
    res.json(existing);
  } catch (err) { next(err); }
}

/**
 * Delete form
 */
export async function deleteForm(req, res, next) {
  try {
    const { id } = req.params;
    const deleted = await Form.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Form not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
}

/**
 * Export default object so `import formController from './Form.controller.js'` works
 */
export default {
  createForm,
  listForms,
  getForm,
  updateForm,
  deleteForm
};
