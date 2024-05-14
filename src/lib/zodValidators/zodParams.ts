export const minNameLen = 3;
export const maxNameLen = 50;
export const maxEmailLen = 254;
export const minPwrdLen = 8;
export const maxPwrdLen = 128;
export const pwrdChars = '@$!%*?&';
export const emailVerificationCodeLen = 8;

export const NAME_MIN_ERROR_MESSAGE = `Name must be at least ${minNameLen} characters long`;
export const NAME_MAX_ERROR_MESSAGE = `Name must be less than ${maxNameLen} characters long`;
export const EMAIL_MAX_ERROR_MESSAGE = `Email must be less than ${maxEmailLen} characters long`;
export const PASSWORD_MIN_ERROR_MESSAGE = `Password must be at least ${minPwrdLen} characters long`;
export const PASSWORD_MAX_ERROR_MESSAGE = `Password must be less than ${maxPwrdLen} characters long`;
export const PASSWORD_SPECIAL_CHARS_MESSAGE = ` Requires a special character: (${pwrdChars.split('').join(', ')})`;
