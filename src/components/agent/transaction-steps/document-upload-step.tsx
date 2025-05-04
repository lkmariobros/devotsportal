"use client"

import { useState } from "react"
import { useTransactionForm } from "@/contexts/transaction-form-context"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RiUpload2Line, RiCloseLine, RiFileLine } from "@remixicon/react"

export function DocumentUploadStep() {
  const { formData, updateField, errors } = useTransactionForm()
  const [dragActive, setDragActive] = useState(false)
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      updateField('documents', [...formData.documents, ...newFiles])
    }
  }
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files)
      updateField('documents', [...formData.documents, ...newFiles])
    }
  }
  
  // Remove a file
  const removeFile = (index: number) => {
    const newFiles = [...formData.documents]
    newFiles.splice(index, 1)
    updateField('documents', newFiles)
  }
  
  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-semibold">Document Upload</h2>
          <p className="text-muted-foreground">
            Upload relevant documents for this transaction.
          </p>
        </div>
        
        <div className="hidden md:block w-1/3 bg-muted/50 p-4 rounded-lg">
          <h3 className="font-medium text-sm">Tips</h3>
          <ul className="text-sm text-muted-foreground mt-2 space-y-2">
            <li>• Upload all relevant documents for faster processing</li>
            <li>• Accepted formats: PDF, JPG, PNG, DOCX</li>
            <li>• Maximum file size: 10MB per file</li>
          </ul>
        </div>
      </div>
      
      <div className="grid gap-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <RiUpload2Line className="h-8 w-8 text-muted-foreground" />
            <h3 className="font-medium">Drag and drop files here</h3>
            <p className="text-sm text-muted-foreground">
              or click to browse your files
            </p>
            
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Browse Files
            </Button>
          </div>
        </div>
        
        {formData.documents.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Uploaded Documents ({formData.documents.length})</h3>
            
            <div className="border rounded-lg divide-y">
              {formData.documents.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3">
                  <div className="flex items-center space-x-3">
                    <RiFileLine className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium truncate max-w-[200px] md:max-w-[300px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <RiCloseLine className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {formData.documents.length === 0 && (
          <div className="text-center p-4 border rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              No documents uploaded yet. You can proceed without documents, but they may be required later.
            </p>
          </div>
        )}
        
        <div className="p-3 border rounded-md bg-blue-50">
          <h4 className="font-medium text-sm">Recommended Documents</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>• Sale and Purchase Agreement</li>
            <li>• Property Valuation Report</li>
            <li>• Client Identification Documents</li>
            <li>• Property Disclosure Statement</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
