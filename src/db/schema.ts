import { pgTable, serial, text, timestamp, integer, boolean, uuid, decimal, date } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  role: text('role').default('agent'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  propertyType: text('property_type').notNull(),
  transactionType: text('transaction_type').notNull(),
  amount: integer('amount').notNull(),
  status: text('status').default('pending'),
  isCoBroking: boolean('is_co_broking').default(false),
  coAgentId: uuid('co_agent_id').references(() => profiles.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// New tables for transaction pipeline
export const transactionTypes = pgTable('transaction_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  address: text('address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  zip: text('zip').notNull(),
  property_type: text('property_type').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const commissionPaymentSchedules = pgTable('commission_payment_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  is_default: boolean('is_default').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const scheduleInstallments = pgTable('schedule_installments', {
  id: uuid('id').defaultRandom().primaryKey(),
  schedule_id: uuid('schedule_id').references(() => commissionPaymentSchedules.id, { onDelete: 'cascade' }),
  installment_number: integer('installment_number').notNull(),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  days_after_transaction: integer('days_after_transaction').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const propertyTransactions = pgTable('property_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_type_id: uuid('transaction_type_id').references(() => transactionTypes.id),
  property_id: uuid('property_id').references(() => properties.id),
  transaction_date: date('transaction_date').notNull(),
  closing_date: date('closing_date'),
  transaction_value: decimal('transaction_value', { precision: 12, scale: 2 }),
  commission_rate: decimal('commission_rate', { precision: 5, scale: 2 }),
  commission_amount: decimal('commission_amount', { precision: 12, scale: 2 }),
  commission_split: boolean('commission_split').default(false),
  co_agent_id: uuid('co_agent_id'),
  co_agent_commission_percentage: decimal('co_agent_commission_percentage', { precision: 5, scale: 2 }),
  agent_id: uuid('agent_id'),
  status: text('status').default('Pending'),
  buyer_name: text('buyer_name'),
  buyer_email: text('buyer_email'),
  buyer_phone: text('buyer_phone'),
  seller_name: text('seller_name'),
  seller_email: text('seller_email'),
  seller_phone: text('seller_phone'),
  notes: text('notes'),
  payment_schedule_id: uuid('payment_schedule_id').references(() => commissionPaymentSchedules.id),
  installments_generated: boolean('installments_generated').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const commissions = pgTable('commissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_id: uuid('transaction_id').references(() => propertyTransactions.id, { onDelete: 'cascade' }),
  agent_id: uuid('agent_id'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  payment_schedule_id: uuid('payment_schedule_id').references(() => commissionPaymentSchedules.id),
  status: text('status').default('Pending'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const commissionInstallments = pgTable('commission_installments', {
  id: uuid('id').defaultRandom().primaryKey(),
  commission_id: uuid('commission_id').references(() => commissions.id, { onDelete: 'cascade' }),
  schedule_installment_id: uuid('schedule_installment_id').references(() => scheduleInstallments.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  due_date: date('due_date').notNull(),
  status: text('status').default('Pending'),
  paid_date: date('paid_date'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const commissionApprovals = pgTable('commission_approvals', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_id: uuid('transaction_id').references(() => propertyTransactions.id, { onDelete: 'cascade' }),
  status: text('status').default('Pending'),
  submitted_by: text('submitted_by'),
  reviewer_id: text('reviewer_id'),
  reviewed_at: timestamp('reviewed_at'),
  notes: text('notes'),
  threshold_exceeded: boolean('threshold_exceeded').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const transactionDocuments = pgTable('transaction_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_id: uuid('transaction_id').references(() => propertyTransactions.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  document_type: text('document_type').notNull(),
  file_path: text('file_path'),
  uploaded_by: text('uploaded_by'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

// New table for transaction notes
export const transactionNotes = pgTable('transaction_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  transaction_id: uuid('transaction_id').references(() => propertyTransactions.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  created_by: uuid('created_by').references(() => profiles.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id').references(() => profiles.id),
    action: text('action').notNull(), // APPROVE_TRANSACTION, REJECT_TRANSACTION, etc.
    entity_type: text('entity_type').notNull(), // TRANSACTION, COMMISSION, etc.
    entity_id: uuid('entity_id').notNull(),
    previous_state: text('previous_state'), // JSON stored as text
    new_state: text('new_state'), // JSON stored as text
    metadata: text('metadata'), // JSON stored as text
    ip_address: text('ip_address'),
    user_agent: text('user_agent'),
    created_at: timestamp('created_at').defaultNow()
  })
  
  export const commissionAdjustments = pgTable('commission_adjustments', {
    id: uuid('id').defaultRandom().primaryKey(),
    commission_id: uuid('commission_id').references(() => commissions.id, { onDelete: 'cascade' }),
    previous_amount: decimal('previous_amount', { precision: 12, scale: 2 }).notNull(),
    new_amount: decimal('new_amount', { precision: 12, scale: 2 }).notNull(),
    adjustment_reason: text('adjustment_reason').notNull(),
    adjusted_by: uuid('adjusted_by').references(() => profiles.id),
    created_at: timestamp('created_at').defaultNow()
  })