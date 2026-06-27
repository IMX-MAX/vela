import { z } from 'zod';

const textSchema = z.string()
  .max(25000, "Content too long")
  .regex(/^[a-zA-Z0-9\s.,!?@#$%^&*()\-_+=\[\]{};:'"<>\\|`~\/\n\r\t]*$/, "Invalid characters");

const promptSchema = z.string()
  .max(5000, "Prompt too long")
  .min(1, "Prompt required");

export const emailSchema = z.object({
  content: textSchema,
  prompt: promptSchema.optional(),
  context: z.string().max(2000).optional()
});

export function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  // Remove potential prompt injection patterns and control characters
  let sanitized = input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/\b(ignore|forget|disregard)\b/gi, '')
    .trim();
  
  return sanitized.slice(0, 25000);
}
