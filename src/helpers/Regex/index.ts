const REGEX_HELPER = {
  email: /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/,
  notSpecialCharacter: /^[a-zA-Z0-9]*$/,
  postcode: /^[0-9-]*$/,
  notAllowWhiteSpaceAtFirstCharacter: /^[^\s\r][\s\S]*$/,
  onlyNumber:  /^[+\d]*$/,
  phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
}

function validateDataByRegex(field: string, byRegex: RegExp) {
  if (!byRegex) return;

  const isValid = byRegex?.test(field);
  return isValid;
}

export {
  REGEX_HELPER,
  validateDataByRegex
}
