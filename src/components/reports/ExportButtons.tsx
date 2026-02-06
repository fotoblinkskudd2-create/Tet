import { useStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { getCategoryName } from '@/lib/categories'
import { formatDateNO } from '@/lib/format'
import { Download } from 'lucide-react'

export function ExportButtons() {
  const transactions = useStore((s) => s.transactions)
  const accounts = useStore((s) => s.accounts)

  function exportCSV() {
    const headers = ['Dato', 'Beskrivelse', 'Belop', 'Type', 'Kategori', 'Konto', 'Tagger']
    const rows = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .map((tx) => [
        formatDateNO(tx.date),
        tx.description,
        tx.amount.toFixed(2).replace('.', ','),
        tx.type,
        getCategoryName(tx.categoryId),
        accounts.find((a) => a.id === tx.accountId)?.name ?? '',
        tx.tags.join('; '),
      ])

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(';')).join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bergenbudget-eksport-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex gap-3">
      <Button onClick={exportCSV} variant="secondary" size="sm">
        <Download size={16} />
        Eksporter CSV
      </Button>
    </div>
  )
}
