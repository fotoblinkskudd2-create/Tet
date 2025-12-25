// Manager Review Page

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Save, CheckCircle, Download } from 'lucide-react'
import Link from 'next/link'

export default function ManagerReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [appraisal, setAppraisal] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [managerComment, setManagerComment] = useState('')
  const [finalRating, setFinalRating] = useState<number | null>(null)

  useEffect(() => {
    fetchAppraisal()
  }, [params.id])

  const fetchAppraisal = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/appraisals/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch appraisal')
      const data = await res.json()
      setAppraisal(data)
      setManagerComment(data.managerOverallComment || '')
      setFinalRating(data.finalRating || null)

      const initialResponses: Record<string, any> = {}
      data.responses.forEach((resp: any) => {
        initialResponses[resp.questionId] = {
          managerResponse: resp.managerResponse || '',
          managerRating: resp.managerRating || null,
        }
      })
      setResponses(initialResponses)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load appraisal',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResponseChange = (questionId: string, field: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const responsesArray = Object.entries(responses).map(([questionId, data]) => ({
        questionId,
        ...data,
      }))

      const res = await fetch(`/api/appraisals/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: responsesArray,
          managerOverallComment: managerComment,
          finalRating,
          status: 'IN_REVIEW',
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast({
        title: 'Success',
        description: 'Review saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save review',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleComplete = async () => {
    if (!finalRating) {
      toast({
        title: 'Error',
        description: 'Please provide a final rating before completing',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)
    try {
      const responsesArray = Object.entries(responses).map(([questionId, data]) => ({
        questionId,
        ...data,
      }))

      const res = await fetch(`/api/appraisals/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses: responsesArray,
          managerOverallComment: managerComment,
          finalRating,
          status: 'COMPLETED',
        }),
      })

      if (!res.ok) throw new Error('Failed to complete')

      toast({
        title: 'Success',
        description: 'Appraisal completed successfully',
      })
      router.push('/manager/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete appraisal',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const res = await fetch(`/api/appraisals/${params.id}/pdf`)
      if (!res.ok) throw new Error('Failed to generate PDF')

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `appraisal-${appraisal.employee.name}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Success',
        description: 'PDF downloaded successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download PDF',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!appraisal) {
    return <div className="text-center py-12">Appraisal not found</div>
  }

  const canEdit = appraisal.status !== 'COMPLETED'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/manager/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Review: {appraisal.employee.name}</h1>
            <p className="text-muted-foreground">{appraisal.template.title}</p>
          </div>
        </div>
        {appraisal.status === 'COMPLETED' && (
          <Button onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      {appraisal.status === 'COMPLETED' && (
        <Card className="border-green-300 bg-green-50">
          <CardContent className="py-4">
            <p className="text-sm text-green-800">
              This appraisal has been completed and is now read-only.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Questions and Responses */}
      <Card>
        <CardHeader>
          <CardTitle>Appraisal Review</CardTitle>
          <CardDescription>
            Review employee responses and provide your feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {appraisal.template.questions.map((question: any, index: number) => {
            const response = appraisal.responses.find((r: any) => r.questionId === question.id)
            const managerResp = responses[question.id] || {}

            return (
              <div key={question.id} className="space-y-4 pb-6 border-b last:border-0">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <Label className="text-base font-semibold">
                      {question.questionText}
                    </Label>
                  </div>
                </div>

                {/* Employee Response */}
                <div className="ml-6 bg-blue-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm font-semibold text-blue-900">Employee Response:</p>
                  {question.questionType === 'RATING' && response?.employeeRating && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-700">
                        {response.employeeRating}/5
                      </span>
                    </div>
                  )}
                  {response?.employeeResponse && (
                    <p className="text-sm text-gray-700">{response.employeeResponse}</p>
                  )}
                </div>

                {/* Manager Response */}
                <div className="ml-6 space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Manager Feedback:
                  </Label>

                  {question.questionType === 'RATING' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            disabled={!canEdit}
                            onClick={() => handleResponseChange(question.id, 'managerRating', rating)}
                            className={`w-12 h-12 rounded-full font-semibold transition-all ${
                              managerResp.managerRating === rating
                                ? 'bg-primary text-white scale-110'
                                : 'bg-gray-200 hover:bg-gray-300 disabled:hover:bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Your rating for this aspect</p>
                    </div>
                  )}

                  <textarea
                    value={managerResp.managerResponse || ''}
                    onChange={(e) => handleResponseChange(question.id, 'managerResponse', e.target.value)}
                    disabled={!canEdit}
                    className="w-full min-h-[80px] p-3 border rounded-md disabled:opacity-50 disabled:bg-gray-50"
                    placeholder="Your comments and feedback..."
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Employee Overall Comment */}
      {appraisal.employeeOverallComment && (
        <Card>
          <CardHeader>
            <CardTitle>Employee Overall Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700">{appraisal.employeeOverallComment}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manager Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Manager Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Final Rating *</Label>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  disabled={!canEdit}
                  onClick={() => setFinalRating(rating)}
                  className={`w-16 h-16 rounded-full font-bold text-lg transition-all ${
                    finalRating === rating
                      ? 'bg-primary text-white scale-110 shadow-lg'
                      : 'bg-gray-200 hover:bg-gray-300 disabled:hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {rating}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              1 = Needs Improvement, 5 = Outstanding Performance
            </p>
          </div>

          <div>
            <Label>Overall Comments</Label>
            <textarea
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
              disabled={!canEdit}
              className="w-full min-h-[150px] p-3 border rounded-md mt-2 disabled:opacity-50 disabled:bg-gray-50"
              placeholder="Provide your overall assessment and recommendations..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {canEdit && (
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Progress
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isSaving}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Review
          </Button>
        </div>
      )}
    </div>
  )
}
