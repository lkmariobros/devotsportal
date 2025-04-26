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

// Add missing table definitions
export const properties = pgTable('properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  address: text('address').notNull(),
  city: text('city'),
  state: text('state'),
  zip_code: text('zip_code'),
  property_type: text('property_type'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const transactionTypes = pgTable('transaction_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const commissionPaymentSchedules = pgTable('commission_payment_schedules', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

export const scheduleInstallments = pgTable('schedule_installments', {
  id: uuid('id').defaultRandom().primaryKey(),
  schedule_id: uuid('schedule_id').references(() => commissionPaymentSchedules.id, { onDelete: 'cascade' }),
  percentage: decimal('percentage', { precision: 5, scale: 2 }).notNull(),
  days_after_closing: integer('days_after_closing').notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow()
})

// Keep only the propertyTransactions table
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

// Add the auditLogs table definition
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: uuid('user_id').references(() => profiles.id),
  action: text('action').notNull(),
  entity_type: text('entity_type').notNull(),
  entity_id: text('entity_id'),
  metadata: text('metadata'),
  created_at: timestamp('created_at').defaultNow()
})
