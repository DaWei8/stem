# STEM Database Schema: Complexity Analysis

## Why the Original Schema Was Insufficient

The original schema had approximately **8 tables**. The production-grade schema has **21 tables + 3 views + 5 functions**. Here's why:

---

## The Original Schema Problems

```
Original Tables (8):
- users
- projects
- collaborators
- variables
- pages
- components
- constraints
- test_cases
```

### Critical Missing Concepts

1. **No Variable Change Tracking**: Couldn't audit when/why variables were renamed
2. **No User Type Modeling**: Couldn't define different user roles (Buyer, Seller, Admin, Visitor)
3. **No Database ERD**: Couldn't model the actual database schema being designed
4. **No RLS Policy Modeling**: Couldn't document Row Level Security rules
5. **No Logic Layer**: Couldn't store constants, functions, or dependencies
6. **No Design System**: No way to define reusable components and tokens
7. **No Page Architecture**: Missing inputs/outputs/actions on pages
8. **No Test Results**: Couldn't store Logic Bot simulation results
9. **No Audit Trail**: Couldn't track who changed what and when
10. **No Collaboration**: No comments, notifications, or activity logging

---

## The Comprehensive Schema (21 Tables)

### 1. Identity & Permissions (3 tables)
```
users
  ├── Full user profiles with subscription tier
  └── Links to auth.users for secure isolation

collaborators
  └── Project team membership with granular permissions

user_types
  ├── Define Buyer, Seller, Admin, Visitor, etc.
  └── user_type_page_access: Which UserTypes can access which pages
```

**Why needed**: The Logic Bot needs to simulate behavior as different user types. "Can a Seller see the Admin Dashboard?" must be answerable.

### 2. Variable Registry (2 tables)
```
variables
  ├── Immutable registry_uuid (never changes)
  ├── Mutable label (can be renamed)
  ├── Type, scope, validation schema
  └── Links database columns to UI inputs

variable_changes
  └── Complete audit trail of all variable modifications
```

**Why needed**: When a variable is renamed, STEM must:
- Update all dependent nodes automatically
- Never break references (uses UUID not label)
- Show history of changes (Slack-like "Variable X was renamed from Y by @user on date")

### 3. Database Schema (4 tables)
```
database_tables
  └── The actual tables being designed

database_columns
  ├── Each column must map to Variable Registry
  └── Enforces single source of truth

database_relationships
  └── Foreign keys, cardinality, cascade rules

rls_policies
  └── Document Row Level Security rules for the database
```

**Why needed**: STEM isn't just a UI tool. It's designing the ENTIRE system including:
- Database structure
- Permission rules at the DB level
- Data relationships and constraints

### 4. Logic Layer (3 tables)
```
constants
  └── APP_NAME = "Acme", MAX_RETRIES = 3, CURRENCY = "NGN"

functions
  ├── calculateTax(amount, rate)
  ├── validateEmail(email)
  └── These can be called from pages

dependencies
  └── "npm: react-hook-form", "api: Flutterwave"

page_dependencies
  └── Maps which pages use which functions/constants/APIs
```

**Why needed**: The Logic Bot needs to know:
- "If Flutterwave API goes down, which user flows break?"
- "Can we delete this helper function or is it still used?"
- Dependencies must be validated against the tech stack

### 5. Design System (5 tables)
```
design_tokens
  └── Colors, typography, spacing, shadows

components
  ├── Button, Input, Modal, etc.
  ├── Atomic design hierarchy
  └── Accessibility metadata

component_variants
  └── Button: primary, secondary, outline, ghost

component_props
  └── Button.size, Button.disabled, etc.

component_events
  └── Button emits onClick, onHover, onLongPress
```

**Why needed**: Design consistency across the entire app. Also needed for:
- Code generation (export to React/Next.js)
- Type safety (TypeScript interfaces generated from props)
- Accessibility audits

### 6. Pages & Flows (3 tables)
```
pages
  └── Canvas screen nodes with positioning

page_flows
  ├── Transitions between pages
  ├── Trigger conditions (click, submit, auto)
  └── Conditional navigation

constraints
  ├── Gatekeepers: isLoggedIn, userRole, walletBalance > 0
  ├── Error messages
  └── Fallback pages
```

**Why needed**: These are the CORE of the Logic Bot. The bot walks through pages checking every constraint.

### 7. Page Architecture (4 tables)
```
page_inputs
  ├── Form fields, URL params, query strings
  ├── MUST map to Variable Registry
  └── Validation schemas

page_outputs
  ├── Success/error modals, redirects, webhooks
  └── Triggered on success or error

page_actions
  ├── Functions/APIs to call on page
  ├── Parameter mapping (page input → function input)
  └── on_ Katt success or error outputs

page_component_instances
  ├── Specific instances of components on page
  ├── Props, data binding, event handlers
  └── Canvas positioning
```

**Why needed**: This is the "contract" between UI and backend. Defines:
- What inputs the page accepts
- What functions it calls
- What outputs it produces

### 8. Goals & Testing (4 tables)
```
user_goals
  └── "User Buys Product", "Reset Password"

test_cases
  ├── Arrange: Initial state
  ├── Act: User actions
  └── Assert: Expected outcomes

simulations
  ├── Logic Bot execution record
  ├── Results summary
  └── Issues found

test_results
  └── Individual test run outcomes
```

**Why needed**: STEM's killer feature is the Logic Bot. It:
1. Takes a goal ("User Buys Product")
2. Simulates the entire user journey
3. Checks every constraint
4. Reports any "dead ends" or security issues

### 9. Collaboration & Audit (4 tables)
```
activity_log
  └── Every change: who, what, when, before/after

comments
  ├── Threaded discussions on specific elements
  ├── @mentions of collaborators
  └── Resolution tracking

notifications
  └── "You were invited to Project X"
     "Your simulation is complete"

exports
  └── Track downloads/exports for audit
```

**Why needed**: Design is collaborative. Must support:
- Team conversations about specific constraints
- Change history (when did we add this constraint and why?)
- Notifications for async work

---

## Key Relationships

### The Variable Registry is the Center
```
variables
  ↓ (mapped by)
database_columns ← Used by pages → page_inputs
                   ← Referenced by
              constraints
              page_actions (parameter_mapping)
              page_outputs
```

When you rename a variable:
1. `variable_changes` table records the audit
2. All dependent `page_inputs` auto-update (via UUID)
3. All `constraints` referencing it still work (UUID-based)
4. The system CANNOT break (because we use UUID, not label)

### The Logic Bot's Graph
```
user_goal
  → Start at page_id
  → Check constraints (via variables)
  → Follow page_flows (conditional on variables)
  → Call page_actions (functions/APIs)
  → Produce page_outputs
  → Reach end_page_id (success!)
  OR fail at constraint/dead end (failure)
```

---

## The Immutable UUID Pattern

This is the KEY innovation that makes STEM deterministic:

```sql
-- Every variable has TWO identifiers:
variables
  ├── id (UUID PRIMARY KEY) - For internal DB relationships
  ├── registry_uuid (varCHAR UNIQUE) - Immutable identifier
  └── label (varCHAR) - User-facing name (can change)

-- When renaming:
UPDATE variables SET label = 'customer_email' WHERE registry_uuid = 'var_001'
-- All dependent nodes STILL WORK because they reference registry_uuid
```

Without this:
- Renaming a variable breaks all dependent pages
- "Silent failures" where pages have stale variable names
- No deterministic path through the system

---

## Scope Handling

Variables have THREE scopes:

```
persistent (Database):
  ├── Stored in actual database
  ├── Examples: User.email, Order.total
  ├── Changes require migration
  └── Visible to database RLS policies

transient (Local State):
  ├── Temporary UI state
  ├── Examples: isModalOpen, stepCount, formErrors
  ├── Lost on page reload
  └── Never persisted

contextual (Global):
  ├── App-wide state
  ├── Examples: currentUser, theme, language
  ├── Shared across all pages
  └── Cleared on logout
```

The Logic Bot must track scope-specific behavior:
- "Can this persistent variable be NULL at this point?"
- "Will this transient variable still exist on the next page?"

---

## RLS Policies at Database Level

Instead of just documenting constraints in STEM, we capture the actual RLS policies:

```sql
-- Users can only see their own orders
rls_policies:
{
  table: "orders",
  policy_type: "select",
  policy_logic: "auth.uid() = user_id"
}

-- Sellers can only edit their own listings
{
  table: "listings",
  policy_type: "update",
  user_type: "seller",
  policy_logic: "auth.uid() = seller_id"
}
```

The Logic Bot can then verify:
- "Does a Buyer trying to DELETE an Order get caught by RLS?"
- "Is there a 'backdoor' where someone can access another user's data?"

---

## Test Case Complexity

A simple test case is NOT just one assertion:

```sql
test_cases:
{
  name: "User Buys Product",
  user_type: "buyer",
  
  arrange: {
    userType: "Buyer",
    walletBalance: 5000,
    productAvailable: true,
    isLoggedIn: true
  },
  
  act: {
    startPage: "product_detail",
    actions: [
      { type: "click", target: "button_add_to_cart" },
      { type: "input", target: "quantity", value: 2 },
      { type: "click", target: "button_checkout" },
      { type: "input", target: "card_number", value: "4111..." }
    ]
  },
  
  assert: {
    expectedFinalPage: "order_confirmation",
    expectedEvents: ["payment_processed", "email_sent", "inventory_updated"],
    expectedState: { walletBalance: 3000 }
  }
}
```

But then we also need permission-aware variations:

```sql
-- Same test but as a Seller (should fail)
test_cases:
{
  name: "User Buys Product (Seller should NOT have access)",
  user_type: "seller",
  is_permission_test: true,
  
  arrange: { ... same as above ... },
  act: { ... same as above ... },
  
  assert: {
    expectedFinalPage: "product_detail",
    expectedError: "Unauthorized",
    expectedState: { walletBalance: 5000 } -- No change
  }
}
```

The Logic Bot must run BOTH variants and report:
- "✓ Buyer can successfully buy"
- "✓ Seller cannot buy (security check passed)"

---

## Exports & Boilerplate

When exporting, STEM generates:

```
exports table:
{
  export_type: "stem_manifest",
  config: {
    includeVariables: true,
    includeDatabase: true,
    includeFunctions: true,
    includeComponents: true,
    includeTests: true,
    techStack: "Next.js + Supabase + Go"
  },
  file_url: "s3://stem-exports/project-123-export.json"
}
```

The .stem manifest includes EVERYTHING needed for AI code generation:
- Variable registry with types
- Database schema (SQL)
- Component definitions (TypeScript interfaces)
- Page flows (state machine)
- Test cases (Jest format)
- Function signatures (to be implemented)

---

## Summary: Why 21 Tables?

| Concept | Tables | Why |
|---------|--------|-----|
| Users & Permissions | 3 | Multi-tenant, granular roles |
| Variable Registry | 2 | Immutable IDs + audit trail |
| Database Design | 4 | Full ERD + RLS policies |
| Logic/Functions | 3 | Dependencies, function calls |
| Design System | 5 | Tokens, components, variants, props, events |
| Pages & Flows | 3 | Nodes, edges, constraints |
| Page Architecture | 4 | Inputs, outputs, actions, instances |
| Goals & Testing | 4 | Goals, tests, simulations, results |
| Collaboration | 4 | Activity, comments, notifications, exports |
| **TOTAL** | **21** | **A production system** |
