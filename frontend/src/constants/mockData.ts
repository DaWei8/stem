import { Project, Variable, DatabaseTable, DatabaseColumn, Constant, LogicFunction, Dependency, UserType, RLSPolicy, Screen, ScreenInput, ScreenAction, ScreenOutput } from '@/types'

export const mockProjects: Project[] = [
  {
    id: 'proj-9921',
    name: 'E-commerce Blueprint',
    description: 'Comprehensive architecture for the next-generation multi-vendor marketplace.',
    owner_id: 'user_1',
    system_type: 'SYSTEM_blueprint',
    status: 'SYNCED',
    created_at: '2026-05-01T10:00:00Z',
    updated_at: '2026-05-03T11:20:00Z'
  },
  {
    id: 'proj-8842',
    name: 'Fintech Core logic',
    description: 'Deterministic ledger system with double-entry validation.',
    owner_id: 'user_1',
    system_type: 'SYSTEM_engine',
    status: 'SYNCED',
    created_at: '2026-04-28T09:00:00Z',
    updated_at: '2026-05-02T15:45:00Z'
  }
]

export const mockVariables: Variable[] = [
  {
    id: '1',
    registry_uuid: 'var_001',
    label: 'id',
    type: 'string',
    scope: 'persistent',
    description: 'Unique identifier for an entity.',
  },
  {
    id: '2',
    registry_uuid: 'var_002',
    label: 'email',
    type: 'string',
    scope: 'persistent',
    description: 'User email address.',
  },
  {
    id: '3',
    registry_uuid: 'var_003',
    label: 'orderId',
    type: 'string',
    scope: 'persistent',
    description: 'Unique identifier for an order.',
  },
  {
    id: '4',
    registry_uuid: 'var_004',
    label: 'productQuantity',
    type: 'number',
    scope: 'transient',
    description: 'Quantity selected for a specific product.',
  },
]

export const mockTables: DatabaseTable[] = [
  { id: 't1', project_id: 'p1', name: 'users', description: 'Core user accounts' },
  { id: 't2', project_id: 'p1', name: 'orders', description: 'User purchase history' },
]

export const mockColumns: DatabaseColumn[] = [
  { id: 'c1', table_id: 't1', variable_id: 'var_001', name: 'id', is_primary_key: true, is_nullable: false, is_unique: true },
  { id: 'c2', table_id: 't1', variable_id: 'var_002', name: 'email', is_primary_key: false, is_nullable: false, is_unique: true },
  { id: 'c3', table_id: 't2', variable_id: 'var_003', name: 'id', is_primary_key: true, is_nullable: false, is_unique: true },
  { id: 'c4', table_id: 't2', variable_id: 'var_001', name: 'user_id', is_primary_key: false, is_nullable: false, is_unique: false },
]

export const mockConstants: Constant[] = [
  { id: 'cons1', project_id: 'p1', name: 'APP_NAME', value: 'STEM Shop', type: 'string' },
  { id: 'cons2', project_id: 'p1', name: 'MAX_RETRIES', value: '3', type: 'number' },
]

export const mockFunctions: LogicFunction[] = [
  { id: 'fn1', project_id: 'p1', name: 'calculateTax', parameters: [{ name: 'amount', type: 'number' }], return_type: 'number', description: 'Calculates VAT for an order.' },
  { id: 'fn2', project_id: 'p1', name: 'sendWelcomeEmail', parameters: [{ name: 'userId', type: 'string' }], return_type: 'void', description: 'Triggers welcome email via Postmark.' },
]

export const mockDependencies: Dependency[] = [
  { id: 'dep1', project_id: 'p1', name: 'stripe', version: 'latest', type: 'api' },
  { id: 'dep2', project_id: 'p1', name: 'lucide-react', version: '0.454.0', type: 'npm' },
]

export const mockUserTypes: UserType[] = [
  { id: 'ut1', project_id: 'p1', name: 'Buyer', description: 'End customers purchasing products.' },
  { id: 'ut2', project_id: 'p1', name: 'Seller', description: 'Merchants listing products.' },
  { id: 'ut3', project_id: 'p1', name: 'Admin', description: 'System administrators.' },
]

export const mockPolicies: RLSPolicy[] = [
  { id: 'pol1', table_id: 't1', name: 'Users can see their own profile', user_type_id: 'ut1', action: 'select', using_expression: 'auth.uid() = id' },
  { id: 'pol2', table_id: 't2', name: 'Buyers can see their own orders', user_type_id: 'ut1', action: 'select', using_expression: 'auth.uid() = user_id' },
]

export const mockScreens: Screen[] = [
  { id: 'scr1', project_id: 'p1', name: 'Login Page', route: '/auth/login', is_entry_point: true },
  { id: 'scr2', project_id: 'p1', name: 'Product Detail', route: '/products/:id', is_entry_point: false },
]

export const mockInputs: ScreenInput[] = [
  { id: 'in1', screen_id: 'scr1', variable_id: 'var_002', label: 'Email Address', is_required: true },
  { id: 'in2', screen_id: 'scr2', variable_id: 'var_004', label: 'Quantity to Buy', is_required: true },
]

export const mockActions: ScreenAction[] = [
  { id: 'act1', screen_id: 'scr1', function_id: 'fn2', trigger: 'submit', label: 'Sign In' },
  { id: 'act2', screen_id: 'scr2', function_id: 'fn1', trigger: 'click', label: 'Add to Cart' },
]

export const mockOutputs: ScreenOutput[] = [
  { id: 'out1', screen_id: 'scr1', type: 'success', target_screen_id: 'scr2', message: 'Logged in successfully' },
  { id: 'out2', screen_id: 'scr1', type: 'error', message: 'Invalid credentials' },
]
