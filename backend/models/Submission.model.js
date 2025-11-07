// backend/models/Submission.model.js
import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  formVersion: Number,
  answers: { type: Object, required: true },
  submittedAt: { type: Date, default: Date.now },
  meta: {
    ip: String,
    userAgent: String
  }
});

SubmissionSchema.index({ formId: 1, submittedAt: -1 });

const Submission = mongoose.model('Submission', SubmissionSchema);
export default Submission;
