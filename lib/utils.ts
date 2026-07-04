// convert Postgres Hex string (e.g., "\x001a2b...") back to Yjs Uint8Array
export const fromHex = (hexStr: string) => {
    // Remove the "\x" prefix that Postgres automatically adds
    const cleanHex = hexStr.startsWith('\\x') ? hexStr.slice(2) : hexStr;
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  };
  
// convert Yjs Uint8Array to Postgres Hex format
export const toHex = (bytes: Uint8Array) => {
    let hexStr = '\\x'; // Postgres bytea prefix
    for (let i = 0; i < bytes.length; i++) {
      hexStr += bytes[i].toString(16).padStart(2, '0');
    }
    return hexStr;
};