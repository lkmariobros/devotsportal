import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const documentsRouter = router({
  upload: protectedProcedure
    .input(z.object({
      transactionId: z.string().uuid(),
      name: z.string().min(1),
      documentType: z.string().min(1),
      fileBase64: z.string(),
      mimeType: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const { transactionId, name, documentType, fileBase64, mimeType } = input
      const userId = ctx.user.id
      const { supabase } = ctx
      
      try {
        // Convert base64 to buffer
        const buffer = Buffer.from(fileBase64, 'base64')
        
        // Generate a unique filename
        const filename = `${Date.now()}-${name.replace(/\s+/g, '-').toLowerCase()}`
        const filePath = `transactions/${transactionId}/${filename}`
        
        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
          .from('documents')
          .upload(filePath, buffer, {
            contentType: mimeType,
            upsert: false
          })
          
        if (error) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to upload file: ${error.message}`
          })
        }
        
        // Store document metadata in database
        const { error: dbError } = await supabase
          .from('documents')
          .insert({
            transaction_id: transactionId,
            name,
            document_type: documentType,
            file_path: data.path,
            uploaded_by: userId
          })
          
        if (dbError) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: `Failed to save document metadata: ${dbError.message}`
          })
        }
        
        return { success: true }
      } catch (error) {
        if (error instanceof TRPCError) throw error
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred during document upload'
        })
      }
    })
})
