// backend/models/Form.model.js
import mongoose from 'mongoose';

const NestedFieldSchema = new mongoose.Schema({
  optionValue: { type: String, required: true },
  fields: [] // raw objects for nested fields
}, { _id: false });

const FieldSchema = new mongoose.Schema({
  label: { type: String, required: true },
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ['text','textarea','number','email','date','checkbox','radio','select','file']
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
  validation: {
    min: Number,
    max: Number,
    regex: String
  },
  order: { type: Number, default: 0 },
  nested: [NestedFieldSchema]
}, { _id: false });

const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  version: { type: Number, default: 1 },
  fields: [FieldSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

FormSchema.index({ title: 1 });

// export as default for ESM imports
const Form = mongoose.model('Form', FormSchema);
export default Form;
