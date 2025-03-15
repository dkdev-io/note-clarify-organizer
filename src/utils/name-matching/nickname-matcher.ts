
/**
 * Utilities for matching nicknames and shortened versions of names
 */

/**
 * Checks if a name might be a shortened version of another name
 * e.g., "Dan" could be short for "Daniel", "Mat" for "Matthew", etc.
 */
export function isNicknameOrShortened(input: string, target: string): boolean {
  // Convert both to lowercase for case-insensitive comparison
  const inputLower = input.toLowerCase().trim();
  const targetLower = target.toLowerCase().trim();
  
  // Direct check if input is completely contained in target
  if (targetLower.includes(inputLower)) {
    return true;
  }
  
  // Nickname mapping database
  const commonNicknames: Record<string, string[]> = {
    'dan': ['daniel', 'danny', 'danielle'],
    'mat': ['matthew', 'matt', 'mateo', 'matteo'],
    'mtt': ['matthew', 'matt', 'mateo'],
    'dn': ['dan', 'daniel', 'danny', 'dean', 'deon'],
    'mt': ['matt', 'matthew', 'mateo'],
    'matt': ['matthew', 'matthias'],
    'dave': ['david', 'davey'],
    'jim': ['james', 'jimmy', 'jimbo'],
    'bob': ['robert', 'bobby', 'rob'],
    'bill': ['william', 'billy', 'will'],
    'mike': ['michael', 'micky', 'mick'],
    'tom': ['thomas', 'tommy'],
    'joe': ['joseph', 'joey'],
    'josh': ['joshua'],
    'ben': ['benjamin', 'benji'],
    'chris': ['christopher', 'christian', 'christoph'],
    'alex': ['alexander', 'alexandra', 'alexis', 'alejandro'],
    'nick': ['nicholas', 'nico', 'nicolas'],
    'rick': ['richard', 'ricky', 'ricardo'],
    'tony': ['anthony', 'antonio', 'antoine'],
    'sam': ['samuel', 'samantha', 'sammy'],
    'beth': ['elizabeth', 'elisabeth', 'betsy'],
    'juan': ['juanito', 'juanita'],
    'da': ['dan', 'daniel', 'dave', 'david'],
    'j': ['john', 'james', 'joseph', 'jack', 'jim', 'josh'],
    'm': ['michael', 'mark', 'mike', 'matthew', 'matt'],
    'd': ['david', 'daniel', 'dave', 'dan', 'derek'],
  };
  
  // Check if input is a known nickname
  if (commonNicknames[inputLower]) {
    return commonNicknames[inputLower].some(nick => targetLower.includes(nick));
  }
  
  // If target is a known nickname, check if input is in its variations
  for (const [nick, variations] of Object.entries(commonNicknames)) {
    if (targetLower.includes(nick) && variations.some(v => inputLower.includes(v))) {
      return true;
    }
  }
  
  // Check for first letter matching (e.g., "J" might refer to "Juan")
  if (inputLower.length === 1 && targetLower.startsWith(inputLower)) {
    return true;
  }
  
  // Check for significant substring match (more than 2 characters)
  if (inputLower.length > 2 && targetLower.includes(inputLower)) {
    return true;
  }
  
  return false;
}
