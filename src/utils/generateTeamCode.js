const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Generate a random 6-character team code.
 * Uses only unambiguous characters (no O/0/I/1).
 */
export function generateTeamCode(length = 6) {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return code;
}

export default generateTeamCode;
