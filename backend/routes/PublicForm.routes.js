// backend/routes/PublicForm.routes.js
import express from 'express';
import Form from '../models/Form.model.js';
import submissionController from '../controllers/Submission.controller.js';

const router = express.Router();

// GET /forms - list brief
router.get('/', async (req, res, next) => {
  try {
    const forms = await Form.find({}, { title: 1, description: 1 }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    next(err);
  }
});

// GET /forms/:id - fetch form definition
router.get('/:id', async (req, res, next) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json(form);
  } catch (err) {
    next(err);
  }
});

// POST /forms/:id/submissions - submit answers
router.post('/:id/submissions', submissionController.submitForm);

export default router;
