// backend/controllers/Submission.controller.js
import Submission from '../models/Submission.model.js';
import Form from '../models/Form.model.js';
import { validateAnswers } from '../utils/validation.utils.js';

/**
 * Submit a form response
 */
export async function submitForm(req, res, next) {
  try {
    const { id } = req.params; // form id
    const payload = req.body || {};
    const form = await Form.findById(id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    // validate
    const { error, value } = validateAnswers(form.fields, payload);
    if (error) {
      // map errors to field -> message
      const errors = {};
      for (const d of error.details) {
        const path =
          d.path && d.path.length
            ? d.path.join('.')
            : d.context && d.context.key
            ? d.context.key
            : 'value';
        errors[path] = d.message;
      }
      return res.status(400).json({ errors });
    }

    const sub = new Submission({
      formId: form._id,
      formVersion: form.version,
      answers: value,
      meta: {
        ip: req.ip,
        userAgent: req.get('User-Agent') || '',
      },
    });

    await sub.save();
    res.status(201).json({ ok: true, submissionId: sub._id });
  } catch (err) {
    next(err);
  }
}

/**
 * List submissions for a form (admin)
 */
export async function listSubmissions(req, res, next) {
  try {
    const { id } = req.params;
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const skip = (page - 1) * limit;

    const [total, docs] = await Promise.all([
      Submission.countDocuments({ formId: id }),
      Submission.find({ formId: id })
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    res.json({ total, page, limit, submissions: docs });
  } catch (err) {
    next(err);
  }
}

// ✅ This default export makes your import work
export default {
  submitForm,
  listSubmissions,
};
