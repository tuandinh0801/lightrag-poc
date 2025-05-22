import * as React from 'react'
import { useState, useCallback } from 'react'
import Button from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/Dialog'
import { toast } from 'sonner'
import { errorMessage } from '@/lib/utils'
import { uploadFolder } from '@/api/lightrag'
import { FolderIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Input from '@/components/ui/Input'

interface UploadFolderDialogProps {
  onFolderUploaded?: () => Promise<void>
}

export default function UploadFolderDialog({ onFolderUploaded }: UploadFolderDialogProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [folderPath, setFolderPath] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleFolderPathChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderPath(e.target.value)
    setError(null)
  }, [])

  const handleFolderUpload = useCallback(async () => {
    if (!folderPath.trim()) {
      setError(t('documentPanel.uploadFolder.errors.emptyPath', 'Please enter a folder path'))
      return
    }

    setIsUploading(true)
    setError(null)

    // Show uploading toast
    const toastId = toast.loading(t('documentPanel.uploadFolder.uploading', 'Uploading folder...'))

    try {
      const result = await uploadFolder(folderPath)

      if (result.status === 'duplicated') {
        setError(t('documentPanel.uploadFolder.errors.duplicateFolder', 'Folder already exists'))
        toast.error(t('documentPanel.uploadFolder.errors.duplicateFolder', 'Folder already exists'), { id: toastId })
      } else if (result.status === 'partial_success') {
        toast.warning(result.message, { id: toastId })
        // Close dialog on partial success
        setOpen(false)
        // Refresh document list
        if (onFolderUploaded) {
          onFolderUploaded().catch(err => {
            console.error('Error refreshing documents:', err)
          })
        }
      } else if (result.status !== 'success') {
        setError(result.message)
        toast.error(result.message, { id: toastId })
      } else {
        toast.success(t('documentPanel.uploadFolder.success', 'Folder uploaded successfully'), { id: toastId })
        // Close dialog on success
        setOpen(false)
        // Refresh document list
        if (onFolderUploaded) {
          onFolderUploaded().catch(err => {
            console.error('Error refreshing documents:', err)
          })
        }
      }
    } catch (err) {
      console.error('Error uploading folder:', err)
      const errMsg = errorMessage(err)
      setError(errMsg)
      toast.error(t('documentPanel.uploadFolder.errors.general', 'Error uploading folder: ' + errMsg), { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }, [folderPath, t, onFolderUploaded])

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (isUploading) {
          return
        }
        if (!open) {
          setFolderPath('')
          setError(null)
        }
        setOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" side="bottom" tooltip={t('documentPanel.uploadFolder.tooltip', 'Upload a folder')} size="sm">
          <FolderIcon className="mr-1" /> {t('documentPanel.uploadFolder.button', 'Upload Folder')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('documentPanel.uploadFolder.title', 'Upload Folder')}</DialogTitle>
          <DialogDescription>
            {t('documentPanel.uploadFolder.description', 'Enter the absolute path to the folder you want to upload')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="folder-path" className="text-sm font-medium">
              {t('documentPanel.uploadFolder.folderPathLabel', 'Folder Path')}
            </label>
            <Input
              id="folder-path"
              placeholder={t('documentPanel.uploadFolder.folderPathPlaceholder', '/path/to/your/folder')}
              value={folderPath}
              onChange={handleFolderPathChange}
              disabled={isUploading}
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleFolderUpload}
            disabled={isUploading || !folderPath.trim()}
          >
            {isUploading ? t('documentPanel.uploadFolder.uploading', 'Uploading...') : t('documentPanel.uploadFolder.submitButton', 'Upload')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
