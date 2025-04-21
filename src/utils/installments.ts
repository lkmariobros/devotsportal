import { addDays, format } from 'date-fns'

export interface ScheduleInstallment {
  installment_number: number
  percentage: number
  days_after_transaction: number
  description?: string
}

export interface PaymentSchedule {
  id: string
  name: string
  installments: ScheduleInstallment[]
}

export interface Transaction {
  id: string
  transaction_date: string
  agent_id: string
  commission_amount: number
  payment_schedule_id?: string
}

export async function generateInstallments(
  supabase: any,
  transaction: Transaction,
  paymentSchedule: PaymentSchedule
) {
  if (!transaction || !paymentSchedule) {
    throw new Error('Transaction or payment schedule not found')
  }

  const agentCommission = transaction.commission_amount

  // Generate installments based on the payment schedule
  const installments = paymentSchedule.installments.map((installment: ScheduleInstallment) => {
    // Calculate the scheduled date
    const transactionDate = new Date(transaction.transaction_date)
    const scheduledDate = addDays(transactionDate, installment.days_after_transaction)

    // Calculate the amount for this installment
    const amount = (agentCommission * installment.percentage) / 100

    return {
      commission_id: transaction.id,
      schedule_installment_id: installment.installment_number.toString(),
      amount,
      due_date: format(scheduledDate, 'yyyy-MM-dd'),
      status: 'Pending',
      notes: installment.description || `Installment ${installment.installment_number}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })

  // Insert the installments
  const { data: insertedInstallments, error: insertError } = await supabase
    .from('commission_installments')
    .insert(installments)
    .select()

  if (insertError) {
    throw new Error(`Failed to insert installments: ${insertError.message}`)
  }

  // Update the transaction to mark that installments have been generated
  const { error: updateError } = await supabase
    .from('property_transactions')
    .update({ installments_generated: true })
    .eq('id', transaction.id)

  if (updateError) {
    throw new Error(`Failed to update transaction: ${updateError.message}`)
  }

  return insertedInstallments
}