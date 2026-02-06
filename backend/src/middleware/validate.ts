import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

type ValidationRule = {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'email' | 'date' | 'boolean';
  min?: number;
  max?: number;
  enum?: string[];
  pattern?: RegExp;
  message?: string;
};

export function validate(rules: ValidationRule[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: string[] = [];
    const body = req.body || {};

    for (const rule of rules) {
      const value = body[rule.field];

      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `${rule.field} er påkrevd`);
        continue;
      }

      if (value === undefined || value === null) continue;

      if (rule.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(value))) {
          errors.push(`${rule.field} må være en gyldig e-postadresse`);
        }
      }

      if (rule.type === 'number' && typeof value !== 'number' && isNaN(Number(value))) {
        errors.push(`${rule.field} må være et tall`);
      }

      if (rule.type === 'date') {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(String(value))) {
          errors.push(`${rule.field} må være en gyldig dato (YYYY-MM-DD)`);
        }
      }

      if (rule.min !== undefined) {
        if (typeof value === 'string' && value.length < rule.min) {
          errors.push(`${rule.field} må være minst ${rule.min} tegn`);
        }
        if (typeof value === 'number' && value < rule.min) {
          errors.push(`${rule.field} må være minst ${rule.min}`);
        }
      }

      if (rule.max !== undefined) {
        if (typeof value === 'string' && value.length > rule.max) {
          errors.push(`${rule.field} kan ikke overstige ${rule.max} tegn`);
        }
        if (typeof value === 'number' && value > rule.max) {
          errors.push(`${rule.field} kan ikke overstige ${rule.max}`);
        }
      }

      if (rule.enum && !rule.enum.includes(String(value))) {
        errors.push(`${rule.field} må være en av: ${rule.enum.join(', ')}`);
      }

      if (rule.pattern && !rule.pattern.test(String(value))) {
        errors.push(rule.message || `${rule.field} har ugyldig format`);
      }
    }

    if (errors.length > 0) {
      next(new AppError(errors.join('. '), 400));
      return;
    }

    next();
  };
}

export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim();
}
