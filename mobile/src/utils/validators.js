import zxcvbn from "zxcvbn";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PH_PHONE_REGEX = /^(09|639)\d{9}$/;
const POSTAL_CODE_REGEX = /^\d{4}$/;
const NAME_REGEX = /^[a-zA-Z\u00C0-\u017F\s]*$/;
const ALIAS_REGEX = /^[a-zA-Z0-9._-]+$/;

export const sanitizeDigits = (value = "") => String(value).replace(/\D/g, "");

export const normalizeEmail = (value = "") => String(value || "").trim().toLowerCase();

export function validateEmail(email = "") {
  return EMAIL_REGEX.test(String(email || "").trim());
}

export function validatePhoneNumber(phone = "") {
  const digits = sanitizeDigits(phone);
  if (!digits) return "Phone number is required.";
  if (!PH_PHONE_REGEX.test(digits)) {
    return "Please enter a valid Philippine mobile number (starts with 09 or 639).";
  }
  return null;
}

export function validatePassword(password = "") {
  if (!password) return "Password is required.";
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (password.length > 72) return "Password must not exceed 72 characters.";
  const strength = zxcvbn(password);
  const score = Math.floor(strength.guesses_log10 * 10);
  if (score < 65) return "Password is not strong enough. Aim for 'Good' strength.";
  return null;
}

export function validateLoginForm({ identifier = "", password = "" } = {}) {
  const errors = {};
  if (!identifier?.trim()) errors.identifier = "Sign-in ID is required.";
  if (!password) errors.password = "Password is required.";
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateForgotPasswordForm(email = "") {
  const errors = {};
  if (!email?.trim()) {
    errors.email = "Email is required.";
  } else if (!validateEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateAddressForm(address = {}) {
  const errors = {};
  if (!address.name?.trim()) errors.name = "Recipient name is required.";
  if (!address.region?.trim()) errors.region = "Region is required.";
  if (!address.province?.trim()) errors.province = "Province is required.";
  if (!address.city?.trim()) errors.city = "City / Municipality is required.";
  if (!address.barangay?.trim()) errors.barangay = "Barangay is required.";
  if (!address.street?.trim()) errors.street = "Street address is required.";
  if (!address.phone?.trim()) {
    errors.phone = "Phone number is required.";
  } else {
    const phoneError = validatePhoneNumber(address.phone);
    if (phoneError) errors.phone = phoneError;
  }
  if (address.postalCode?.trim() && !POSTAL_CODE_REGEX.test(address.postalCode.trim())) {
    errors.postalCode = "Postal code must be 4 digits.";
  }
  return { errors, valid: Object.keys(errors).length === 0 };
}

export function validateRegistrationForm(form = {}) {
  const errors = {};
  if (!form.name_first?.trim()) {
    errors.name_first = "First name is required.";
  } else if (form.name_first.trim().length < 2) {
    errors.name_first = "First name must be at least 2 characters.";
  } else if (!NAME_REGEX.test(form.name_first.trim())) {
    errors.name_first = "First name can only contain letters.";
  }

  if (!form.name_last?.trim()) {
    errors.name_last = "Last name is required.";
  } else if (form.name_last.trim().length < 2) {
    errors.name_last = "Last name must be at least 2 characters.";
  } else if (!NAME_REGEX.test(form.name_last.trim())) {
    errors.name_last = "Last name can only contain letters.";
  }

  if (!form.email?.trim()) {
    errors.email = "Email is required.";
  } else if (!validateEmail(form.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (form.alias?.trim()) {
    const alias = form.alias.trim();
    if (alias.length < 6) {
      errors.alias = "Alias must be at least 6 characters.";
    } else if (alias.length > 36) {
      errors.alias = "Alias must not exceed 36 characters.";
    } else if (!ALIAS_REGEX.test(alias)) {
      errors.alias = "Alias may only use letters, numbers, dot, underscore, hyphen.";
    }
  }

  if (!form.phone?.trim()) {
    errors.phone = "Phone number is required.";
  } else {
    const phoneError = validatePhoneNumber(form.phone);
    if (phoneError) errors.phone = phoneError;
  }

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.password = passwordError;
  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (!form.agreeTermsWarranty) {
    errors.agreeTermsWarranty = "Required.";
  }
  if (!form.agreeTermsService) {
    errors.agreeTermsService = "Required.";
  }
  if (!form.agreeTermsApp) {
    errors.agreeTermsApp = "Required.";
  }
  if (!form.agreePrivacyRa10173) {
    errors.agreePrivacyRa10173 = "You must acknowledge the Data Privacy Act (RA 10173) disclosure.";
  }

  if (!form.region?.trim()) {
    errors.region = "Region is required.";
  }
  if (!form.province?.trim()) {
    errors.province = "Province is required.";
  }
  if (!form.city?.trim()) {
    errors.city = "City / Municipality is required.";
  }
  if (!form.barangay?.trim()) {
    errors.barangay = "Barangay is required.";
  }
  if (!form.street?.trim()) {
    errors.street = "Street address is required.";
  }

  return { errors, valid: Object.keys(errors).length === 0 };
}
