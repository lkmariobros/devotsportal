"use client"

// This is a simplified version of the transaction-details component for Vercel deployment
export function TransactionDetails({ transaction }: { transaction: any }) {
  return (
    <div className="space-y-6 p-4 bg-muted/20">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            {transaction.properties?.address || 'Property Address'}
          </h2>
          <p className="text-muted-foreground">
            {transaction.properties?.city || 'City'}, {transaction.properties?.state || 'State'} {transaction.properties?.zip || 'Zip'}
          </p>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold">
              {new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(transaction.transaction_value || 0)}
            </span>
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
              {transaction.status || 'Status'}
            </span>
          </div>
          <p className="text-muted-foreground">
            Transaction Date: {transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'}
          </p>
        </div>
      </div>

      <div className="h-px w-full bg-border"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-medium">Transaction Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <p className="text-muted-foreground">Transaction Type:</p>
            <p>{transaction.transaction_types?.name || 'N/A'}</p>

            <p className="text-muted-foreground">Transaction Date:</p>
            <p>{transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : 'N/A'}</p>

            <p className="text-muted-foreground">Closing Date:</p>
            <p>{transaction.closing_date ? new Date(transaction.closing_date).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Property Information</h3>
          <div className="grid grid-cols-2 gap-2">
            <p className="text-muted-foreground">Address:</p>
            <p>{transaction.properties?.address || 'N/A'}</p>

            <p className="text-muted-foreground">City:</p>
            <p>{transaction.properties?.city || 'N/A'}</p>

            <p className="text-muted-foreground">State:</p>
            <p>{transaction.properties?.state || 'N/A'}</p>

            <p className="text-muted-foreground">Zip:</p>
            <p>{transaction.properties?.zip || 'N/A'}</p>

            <p className="text-muted-foreground">Property Type:</p>
            <p>{transaction.properties?.property_type || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
