'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { trpc } from '@/utils/trpc/client'
import { toast } from 'sonner'
import { RiUploadLine } from '@remixicon/react'

interface DocumentUploadProps {
  transactionId: string
  onSuccess?: () => void
}

export function DocumentUpload({ transactionId, onSuccess }: DocumentUploadProps) {
  const [name, setName] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  
  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success('Document uploaded successfully')
      setName('')
      setDocumentType('')
      setFile(null)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`)
    }
  })
  
  const handleUpload = async () => {
    if (!file || !name || !documentType) return
    
    setIsUploading(true)
    
    try {
      // Convert file to base64
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result?.toString().split(',')[1]
        
        if (base64) {
          uploadMutation.mutate({
            transactionId,
            name,
            documentType,
            fileBase64: base64,
            mimeType: file.type
          })
        }
      }
    } catch (error) {
      console.error('Error preparing file:', error)
      toast.error('Failed to prepare file for upload')
    } finally {
      setIsUploading(false)
    }
  }
  
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <h3 className="text-lg font-medium">Upload Document</h3>
      
      <div className="space-y-3">
        <Input
          placeholder="Document name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger>
            <SelectValue placeholder="Document type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="receipt">Receipt</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        
        <Button 
          onClick={handleUpload} 
          disabled={!file || !name || !documentType || isUploading}
          className="w-full"
        >
          <RiUploadLine className="mr-2 h-4 w-4" />
          {isUploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>
    </div>
  )
}