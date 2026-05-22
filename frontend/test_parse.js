const script = `
DEFINE CONSTANT "CURRENCY_CODES" { type: "string", value: '["USD", "EUR", "GBP", "JPY"]' }
DEFINE CONSTANT "DEFAULT_LANGUAGE" { type: "string", value: 'en' }
DEFINE CONSTANT "PRODUCT_STATUS_TYPES" { type: "string", value: "[\\"draft\\", \\"published\\"]" }
`;

console.log("Input script:", script);

const constMatches = [...script.matchAll(/DEFINE CONSTANT\s+"([^"]+)"\s*\{([^}]*)\}/g)];
console.log("Matches count:", constMatches.length);

for (const match of constMatches) {
  const name = match[1];
  const type = match[2]?.match(/type:\s*"([^"]+)"/)?.[1] || 'string';
  
  // Robust regex matching either double-quoted or single-quoted values
  const valueMatch = match[2]?.match(/value:\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')/);
  
  let value = '';
  if (valueMatch) {
    if (valueMatch[1] !== undefined) {
      // Double-quoted string
      value = valueMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    } else if (valueMatch[2] !== undefined) {
      // Single-quoted string
      value = valueMatch[2].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    }
  }
  
  console.log(`Parsed Name: "${name}"`);
  console.log(`Parsed Type: "${type}"`);
  console.log(`Matched parts:`, valueMatch ? [valueMatch[1], valueMatch[2]] : null);
  console.log(`Final value: "${value}"`);
  console.log("---");
}
