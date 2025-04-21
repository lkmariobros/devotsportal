import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import { RiDownloadLine, RiFileLine } from "@remixicon/react"

interface TransactionDocument {
  id: string
  name: string
  document_type: string
  file_path?: string
  uploaded_by?: string
  created_at: string
}

interface TransactionDocumentsProps {
  documents: TransactionDocument[]
}

export function TransactionDocuments({ documents }: TransactionDocumentsProps) {
  if (documents.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No documents have been uploaded for this transaction.
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-4">
      {documents.map((document) => (
        <Card key={document.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RiFileLine className="h-6 w-6 text-muted-foreground" />
              <div>
                <p className="font-medium">{document.name}</p>
                <p className="text-sm text-muted-foreground">
                  {document.document_type} • Uploaded {formatDate(document.created_at)}
                </p>
              </div>
            </div>
            
            {document.file_path && (
              <Button size="sm" variant="outline">
                <RiDownloadLine className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}