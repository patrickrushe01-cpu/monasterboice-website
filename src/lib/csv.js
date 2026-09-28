export const EMAIL_OK = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Spreadsheet programs run text that starts with = + - @ as a formula, so neutralise those
export const csvSafe = v => (/^[=+\-@\t\r]/.test(v) ? `'${v}` : v)
