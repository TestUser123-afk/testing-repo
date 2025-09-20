const blockedWords = [
  'anal', 'anus', 'arsehole', 'arse', 'ass', 'asshat', 'asshole', 'ass hole', 'bastard', 'bitch',
  'bollocks', 'booty', 'bullshit', 'buthole', 'butthole', 'cocksucker', 'cock', 'coon', 'crap',
  'cummy', 'cum', 'cunt', 'dammit', 'damn', 'dick', 'dildo', 'douche', 'douchebag', 'fag',
  'faggot', 'feck', 'fucker', 'fucking', 'fuck', 'dong', 'goddamn', 'god damnit', 'god damn',
  'goddamnit', 'go to hell', 'hell', 'hecking', 'heck', 'hentai', 'horse cock', 'jack off',
  'jerk off', 'jizz', 'knob', 'lmao', 'lmfao', 'motherfucker', 'motherfucking', 'nigga', 'nigger',
  'nig', 'orgasm', 'penis', 'piss', 'pissed', 'porno', 'porn', 'pussy', 'retard', 'retarded',
  'sexy', 'shat', 'shitty', 'shit', 'slut', 'stfu', 'tard', 'tits', 'titty', 'titties', 'tit',
  'twat', 'twit', 'vagina', 'vore', 'wanker', 'weiner', 'whore', 'yiff'
];

export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();

  return blockedWords.some(word => {
    // Check for exact word matches with word boundaries
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(lowerText)) return true;

    // Check for spaced out versions (e.g., "a s s" for "ass")
    const spacedWord = word.split('').join('\\s*');
    const spacedRegex = new RegExp(`\\b${spacedWord}\\b`, 'i');
    if (spacedRegex.test(lowerText)) return true;

    // Check for versions with symbols/numbers (e.g., "@ss" for "ass")
    const symbolRegex = new RegExp(`\\b${word.replace(/[aeiou]/gi, '[aeiou@0]').replace(/s/gi, '[s$5]')}\\b`, 'i');
    if (symbolRegex.test(lowerText)) return true;

    return false;
  });
}

export function filterProfanity(text: string): string {
  let filteredText = text;

  blockedWords.forEach(word => {
    const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    filteredText = filteredText.replace(regex, '*'.repeat(word.length));

    // Also filter spaced out versions
    const spacedWord = word.split('').join('\\s*');
    const spacedRegex = new RegExp(`\\b${spacedWord}\\b`, 'gi');
    filteredText = filteredText.replace(spacedRegex, '*'.repeat(word.length));
  });

  return filteredText;
}
