// backend/routes/AdminForm.routes.js
import express from 'express';
import auth from '../middleware/auth.middleware.js';
import formController from '../controllers/Form.controller.js';
import submissionController from '../controllers/Submission.controller.js'; // ensure this file is ESM too

const router = express.Router();

// protect all admin routes
router.use(auth);

// CRUD
router.post('/', formController.createForm);
router.get('/', formController.listForms);
router.get('/:id', formController.getForm);
router.put('/:id', formController.updateForm);
router.delete('/:id', formController.deleteForm);

// submissions (admin)
router.get('/:id/submissions', submissionController.listSubmissions);

export default router;
