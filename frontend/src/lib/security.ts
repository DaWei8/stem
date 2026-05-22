/**
 * Security utility to prevent code injection attacks
 * Checks for dangerous Node.js, Shell, SQL, and HTML/JS script injection patterns.
 */
export function validateLogicInput(input: string | null | undefined): { isValid: boolean; reason?: string } {
  if (!input) return { isValid: true };

  const normalized = input.trim();

  // 1. Check for HTML script tags & event handlers (XSS prevention)
  if (/<\s*script\b/i.test(normalized)) {
    return { isValid: false, reason: "Script tags ('<script>') are forbidden for security reasons." };
  }
  if (/javascript:/i.test(normalized)) {
    return { isValid: false, reason: "JavaScript protocol execution ('javascript:') is forbidden." };
  }
  if (/\bon(?:error|load|click|mouseover|submit)\s*=/i.test(normalized)) {
    return { isValid: false, reason: "HTML inline event handlers (e.g. 'onerror=') are forbidden." };
  }

  // 2. Check for dangerous Node.js / JS execution contexts
  if (/eval\s*\(/i.test(normalized)) {
    return { isValid: false, reason: "Use of direct 'eval()' execution is forbidden." };
  }
  if (/new\s+Function\s*\(/i.test(normalized)) {
    return { isValid: false, reason: "Dynamic function constructor instantiation is forbidden." };
  }
  if (/require\s*\(\s*['"`]/i.test(normalized)) {
    return { isValid: false, reason: "Node.js dynamic module loading ('require(...)') is forbidden." };
  }
  if (/import\s*\(\s*['"`]/i.test(normalized)) {
    return { isValid: false, reason: "JavaScript dynamic imports ('import(...)') are forbidden." };
  }
  if (/\bprocess\.(?:exit|mainModule|execPath|env|stdout|stderr|stdin|argv|kill|cwd)\b/i.test(normalized)) {
    return { isValid: false, reason: "Access to Node.js 'process' properties is forbidden." };
  }
  if (/\bchild_process\b/i.test(normalized)) {
    return { isValid: false, reason: "Access to the Node.js 'child_process' module is forbidden." };
  }
  if (/\bexec\s*\(\s*['"`]/i.test(normalized) || /\bspawn\s*\(\s*['"`]/i.test(normalized)) {
    return { isValid: false, reason: "System process spawning functions ('exec', 'spawn') are forbidden." };
  }

  // 3. Check for shell command injection patterns
  if (/(?:;|&&|\|)\s*(?:rm|cat|ls|pwd|whoami|sh|bash|cmd|powershell)\b/i.test(normalized)) {
    return { isValid: false, reason: "Shell command injection patterns (e.g., '; rm') are forbidden." };
  }
  if (/\bsudo\s+(?:rm|apt|yum|systemctl|service|shutdown|reboot)\b/i.test(normalized)) {
    return { isValid: false, reason: "Superuser console operations ('sudo') are forbidden." };
  }

  // 4. Check for basic SQL Injection command chaining
  if (/\bUNION\s+SELECT\b/i.test(normalized)) {
    return { isValid: false, reason: "SQL 'UNION SELECT' injection queries are forbidden." };
  }
  if (/;\s*DROP\s+TABLE\b/i.test(normalized)) {
    return { isValid: false, reason: "SQL 'DROP TABLE' execution sequences are forbidden." };
  }

  return { isValid: true };
}
