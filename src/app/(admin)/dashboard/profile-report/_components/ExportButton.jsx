'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { exportProfileCompletionToCSV } from '@/server/actions/profile-completion'
import { toast } from 'sonner'

export default function ExportButton() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    try {
      setIsExporting(true)
      toast.info('Generating CSV export...')

      const csvData = await exportProfileCompletionToCSV()

      // Create blob and download
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)

      const timestamp = new Date().toISOString().split('T')[0]
      link.setAttribute('href', url)
      link.setAttribute('download', `profile-completion-report-${timestamp}.csv`)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success('CSV export downloaded successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export CSV. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant='outline'
    >
      {isExporting ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Exporting...
        </>
      ) : (
        <>
          <Download className='mr-2 h-4 w-4' />
          Export to CSV
        </>
      )}
    </Button>
  )
}
