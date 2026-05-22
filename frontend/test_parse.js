const script = `
DEFINE CONSTANT "CURRENCY_CODES" { type: "string", value: "[\\"USD\\", \\"EUR\\", \\"GBP\\", \\"JPY\\"]" }
DEFINE CONSTANT "PRODUCT_STATUS_TYPES" { type: "string", value: "[\\"draft\\", \\"published\\", \\"archived\\", \\"out_of_stock\\", \\"pending_review\\"]" }
DEFINE CONSTANT "APPLICATION_STATUS_TYPES" { type: "string", value: "[\\"pending\\", \\"approved\\", \\"rejected\\", \\"in_review\\", \\"cancelled\\"]" }
DEFINE CONSTANT "MESSAGE_TYPES" { type: "string", value: "[\\"text\\", \\"image\\", \\"video\\", \\"file\\", \\"system\\"]" }
`;

console.log("Input script:", script);

const constMatches = [...script.matchAll(/DEFINE CONSTANT\s+"([^"]+)"\s*\{([^}]*)\}/g)];
console.log("Matches count:", constMatches.length);

for (const match of constMatches) {
  const name = match[1];
  const type = match[2]?.match(/type:\s*"([^"]+)"/)?.[1] || 'string';
  const valueMatch = match[2]?.match(/value:\s*"((?:\\.|[^"\\])*)"/);
  const rawValue = valueMatch ? valueMatch[1] : '';
  let value = rawValue.replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  
  console.log(`Parsed Name: "${name}"`);
  console.log(`Parsed Type: "${type}"`);
  console.log(`Raw captured value: "${rawValue}"`);
  console.log(`Replaced value: "${value}"`);
  console.log("---");
}
