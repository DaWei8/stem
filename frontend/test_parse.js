const script = `
DEFINE CONSTANT "CURRENCY_CODES" { type: "string", value: '["USD", "EUR"]' }
DEFINE CONSTANT "FAQ_DATA" {
  type: "json",
  value: "{ \\"general\\": [ { \\"q\\": \\"What is STEM?\\", \\"a\\": \\"A logic engine.\\" } ] }"
}
DEFINE CONSTANT "DEFAULT_LANGUAGE" { type: "string", value: 'en' }
`;

console.log("Input script:", script);

// New lookahead regex to match constant blocks with nested curly braces
const constMatches = [...script.matchAll(/DEFINE CONSTANT\s+"([^"]+)"\s*\{([\s\S]*?)\}(?=\s*(?:DEFINE\s+(?:CONSTANT|VARIABLE|TABLE|FUNCTION)|ADD\s+DEPENDENCY|ADD\s+COLUMN\s+TO|$))/g)];
console.log("Matches count:", constMatches.length);

for (const match of constMatches) {
  const name = match[1];
  const body = match[2];
  const type = body.match(/type:\s*"([^"]+)"/)?.[1] || 'string';
  
  const valueMatch = body.match(/value:\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)')/);
  
  let value = '';
  if (valueMatch) {
    if (valueMatch[1] !== undefined) {
      value = valueMatch[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    } else if (valueMatch[2] !== undefined) {
      value = valueMatch[2].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
    }
  }
  
  console.log(`Parsed Name: "${name}"`);
  console.log(`Parsed Type: "${type}"`);
  console.log(`Final value: "${value}"`);
  console.log("---");
}
