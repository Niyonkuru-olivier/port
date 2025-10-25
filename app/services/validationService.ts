/**
 * Utility service for validating emails and passwords
 * Mirrors Angular ValidationService
 */
export const validationService = {
    validateEmail(email: string): boolean {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(email);
    },
  
    validatePassword(password: string): { isValid: boolean; errors: string[] } {
      const hasUpperCase = /[A-Z]/;
      const hasLowerCase = /[a-z]/;
      const hasNumber = /[0-9]/;
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;
  
      const errors: string[] = [];
  
      if (password.length < 8) {
        errors.push("Password must be at least 8 characters long");
      }
      if (!hasUpperCase.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }
      if (!hasLowerCase.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }
      if (!hasNumber.test(password)) {
        errors.push("Password must contain at least one number");
      }
      if (!hasSpecialChar.test(password)) {
        errors.push("Password must contain at least one special character");
      }
  
      return { isValid: errors.length === 0, errors };
    },
  };
  