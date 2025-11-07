// backend/utils/validation.util.js
import Joi from 'joi';

/**
 * Build a Joi schema object from array of fields.
 * Returns Joi.object(...) that validates an answers payload (object with fieldName -> value)
 */
export function buildJoiSchemaFromFields(fields = []) {
  const schemaMap = {};

  for (const f of fields) {
    const name = f.name;
    let s;

    switch (f.type) {
      case 'text':
      case 'textarea':
        s = Joi.string().allow('', null);
        if (f.validation?.min) s = s.min(f.validation.min);
        if (f.validation?.max) s = s.max(f.validation.max);
        if (f.validation?.regex) {
          try {
            s = s.pattern(new RegExp(f.validation.regex));
          } catch (err) {
            console.warn(`Invalid regex for field ${name}:`, f.validation.regex);
          }
        }
        break;

      case 'email':
        s = Joi.string().email({ tlds: { allow: false } }).allow('', null);
        break;

      case 'number':
        s = Joi.number().allow(null);
        if (typeof f.validation?.min === 'number') s = s.min(f.validation.min);
        if (typeof f.validation?.max === 'number') s = s.max(f.validation.max);
        break;

      case 'date':
        s = Joi.date().allow(null);
        break;

      case 'checkbox':
        s = Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.boolean(), Joi.string()).allow(null);
        break;

      case 'radio':
      case 'select':
        s = Joi.string().allow('', null);
        if (Array.isArray(f.options) && f.options.length) {
          s = s.valid(...f.options).allow('', null);
        }
        break;

      case 'file':
        s = Joi.string().allow('', null);
        break;

      default:
        s = Joi.any().allow(null);
    }

    if (f.required) {
      s = s.required().invalid('', null);
    }

    schemaMap[name] = s;
  }

  return Joi.object(schemaMap);
}

/**
 * Validate answers (plain object) against the form fields.
 * returns { value, error } where error is JoiValidation error or null.
 */
export function validateAnswers(fields, answers) {
  const schema = buildJoiSchemaFromFields(fields);
  const result = schema.validate(answers, { abortEarly: false, allowUnknown: true, convert: true });
  return result;
}
