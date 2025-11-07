// backend/routes/AdminForm.routes.js
import express from 'express';
import formController from '../controllers/Form.controller.js';
import submissionController from '../controllers/Submission.controller.js'; // ensure this file is ESM too

const router = express.Router();

// Admin routes are now public (no token auth)

// CRUD
router.post('/', formController.createForm);
router.get('/', formController.listForms);
router.get('/:id', formController.getForm);
router.put('/:id', formController.updateForm);
router.delete('/:id', formController.deleteForm);

// submissions (admin)
router.get('/:id/submissions', submissionController.listSubmissions);

export default router;
