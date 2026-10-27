// Reglas de validación del frontend. Replican las del backend (ClientService,
// TechnicianService y AuthService) y usan los textos exactos de la ERS, de modo
// que el usuario vea el mismo mensaje antes y después de llamar al servidor.
// El backend sigue siendo la validación definitiva.

export const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// RUT sin puntos ni guion: 7 u 8 dígitos seguidos de un dígito verificador o K.
export const RUT_FORMAT_REGEX = /^[0-9]{7,8}[0-9kK]$/;
// Solo letras (con tildes y ñ) y espacios.
export const NAME_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

export const VALIDATION_MESSAGES = {
  invalidEmail: "El correo electrónico no tiene un formato válido",
  invalidRutFormat: "El RUT debe ingresarse sin puntos ni guion (ej.: 12345670K)",
  invalidRut: "El RUT ingresado no es válido según el algoritmo de verificación",
  invalidName: "El nombre solo puede contener letras y espacios",
} as const;

// Mensaje de campo obligatorio: «Debe completar el campo <<campo>>».
export function requiredFieldMessage(fieldName: string): string {
  return `Debe completar el campo ${fieldName}`;
}

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

export function isValidRutFormat(rut: string): boolean {
  return RUT_FORMAT_REGEX.test(rut);
}

// Valida el dígito verificador de un RUT chileno con el algoritmo de módulo 11.
// Espera el RUT sin puntos ni guion (ej.: 12345670K).
export function isValidRutChecksum(rut: string): boolean {
  if (rut.length < 8) return false;

  const body = rut.slice(0, -1);
  const enteredDigit = rut.slice(-1).toUpperCase();
  if (!/^[0-9]+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;
  for (let index = body.length - 1; index >= 0; index--) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = 11 - (sum % 11);
  const expectedDigit = remainder === 11 ? "0" : remainder === 10 ? "K" : String(remainder);
  return enteredDigit === expectedDigit;
}

export function isValidPersonName(name: string): boolean {
  return NAME_REGEX.test(name);
}
