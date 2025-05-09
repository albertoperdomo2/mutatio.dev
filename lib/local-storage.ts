const STORAGE_KEY = 'mutatio_api_keys_v1';

function secureEncrypt(text: string): string {
  try {
    // Use the encryption key from environment variable, injected at build time
    // and available on the client without exposing it in client-side code
    const encKey = typeof window !== 'undefined' && (window as any).__ENCRYPTION_KEY;
    
    if (!encKey) {
      console.error('Encryption key not found. Storage will not be secure.');
      return text; // Return unencrypted text as fallback
    }
    
    // XOR encryption with the key (rotating through key chars)
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ encKey.charCodeAt(i % encKey.length);
      result += String.fromCharCode(charCode);
    }
    
    const base64Result = btoa(result);
    
    return base64Result;
  } catch (e) {
    return btoa(text);
  }
}

function secureDecrypt(encryptedText: string): string {
  try {
    // Use the encryption key from environment variable, injected at build time
    const encKey = typeof window !== 'undefined' && (window as any).__ENCRYPTION_KEY;
    
    if (!encKey) {
      console.error('Encryption key not found. Storage will not be secure.');
      return encryptedText; // Return input as fallback
    }
    
    const decoded = atob(encryptedText);
    
    // XOR decryption
    let result = '';
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ encKey.charCodeAt(i % encKey.length);
      result += String.fromCharCode(charCode);
    }
    
    return result;
  } catch (e) {
    try {
      return atob(encryptedText);
    } catch (fallbackError) {
      // handle decoding errors gracefully
      return '';
    }
  }
}

export interface ApiKeys {
  [provider: string]: {
    [role: string]: string;
  };
}

export function getApiKeys(): ApiKeys {
  if (typeof window === 'undefined') {
    return {};
  }
  
  try {
    let storedKeys = localStorage.getItem(STORAGE_KEY);
    
    // fallbacks for previous versions
    if (!storedKeys) {
      storedKeys = localStorage.getItem('prompt_lab_api_keys_v2');
      
      if (!storedKeys) {
        storedKeys = localStorage.getItem('prompt_lab_api_keys');
        
        if (!storedKeys) {
          return {};
        }
      }
    }
    
    try {
      const decrypted = secureDecrypt(storedKeys);
      
      if (decrypted) {
        try {
          const parsed = JSON.parse(decrypted);
          
          if (parsed && typeof parsed === 'object') {
            // if old key found, migrate it to the new key
            if (localStorage.getItem('prompt_lab_api_keys') === storedKeys) {
              saveApiKeys(parsed);
              // clean up old storage to avoid confusion
              try { localStorage.removeItem('prompt_lab_api_keys'); } catch(e) {}
            }
            return parsed;
          }
        } catch (parseError) {
          // continue to fallback
        }
      }
    } catch (e) {
      // continue to the fallback
    }
    
    // fallback to handle legacy format (if any)
    try {
      const legacyDecoded = atob(storedKeys);
      const legacyParsed = JSON.parse(legacyDecoded);
      if (legacyParsed && typeof legacyParsed === 'object') {
        // save in the new format for next time
        saveApiKeys(legacyParsed);
        // clean up old storage if needed
        if (localStorage.getItem('prompt_lab_api_keys') === storedKeys) {
          try { localStorage.removeItem('prompt_lab_api_keys'); } catch(e) {}
        }
        return legacyParsed;
      }
    } catch (e) {
      // continue to the next fallback
    }
    
    // if all parsing methods fail, return empty object
    return {};
  } catch (error) {
    // fail silently and return empty object
    return {};
  }
}

function saveApiKeys(keys: ApiKeys): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  try {
    const keysJson = JSON.stringify(keys);
    const encrypted = secureEncrypt(keysJson);
    
    localStorage.setItem(STORAGE_KEY, encrypted);
    const storedValue = localStorage.getItem(STORAGE_KEY);
    
    return Boolean(storedValue);
  } catch (e) {
    return false;
  }
}

export function saveApiKey(provider: string, role: string, key: string): boolean {
  if (typeof window === 'undefined' || !provider || !role || !key) {
    return false;
  }
  
  try {
    const normalizedProvider = provider.toLowerCase();
    const keys = getApiKeys();
    
    if (!keys[normalizedProvider]) {
      keys[normalizedProvider] = {};
    }
    
    keys[normalizedProvider][role] = key;
    
    return saveApiKeys(keys);
  } catch (error) {
    return false;
  }
}

export function hasRequiredApiKeys(): boolean {
  try {
    const keys = getApiKeys();
    
    // dheck if any of the supported providers have both mutator and validator keys
    const hasOpenAI = keys.openai?.mutator && keys.openai?.validator;
    const hasAnthropic = keys.anthropic?.mutator && keys.anthropic?.validator;
    const hasMistral = keys.mistral?.mutator && keys.mistral?.validator;
    const hasDeepSeek = keys.deepseek?.mutator && keys.deepseek?.validator;
    
    return Boolean(hasOpenAI || hasAnthropic || hasMistral || hasDeepSeek);
  } catch (e) {
    return false;
  }
}

export function getApiKey(provider: string, role: string): string | null {
  if (!provider || !role || typeof window === 'undefined') {
    return null;
  }

  try {
    const keys = getApiKeys();
    const normalizedProvider = provider.toLowerCase();
    
    if (keys[normalizedProvider]?.[role]) {
      return keys[normalizedProvider][role];
    }
    
    const oppositeRole = role === 'mutator' ? 'validator' : 'mutator';
    if (keys[normalizedProvider]?.[oppositeRole]) {
      return keys[normalizedProvider][oppositeRole];
    }
    
    // if not found and not OpenAI, try OpenAI as a last resort (legacy)
    if (normalizedProvider !== 'openai') {
      const openaiKey = keys.openai?.[role] || keys.openai?.[oppositeRole];
      if (openaiKey) {
        return openaiKey;
      }
    }
    
    return null;
  } catch (e) {
    return null;
  }
}