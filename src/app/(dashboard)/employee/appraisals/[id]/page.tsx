// Employee Appraisal Self-Assessment Form

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, Save, Send } from 'lucide-react'
import Link from 'next/link'

export default function EmployeeAppraisalPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [appraisal, setAppraisal] = useState<any>(null)
  const [responses, setResponses] = useState<Record<string, any>>({})
  const [overallComment, setOverallComment] = useState('')

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
      setOverallComment(data.employeeOverallComment || '')

      // Initialize responses
      const initialResponses: Record<string, any> = {}
      data.responses.forEach((resp: any) => {
        initialResponses[resp.questionId] = {
          employeeResponse: resp.employeeResponse || '',
          employeeRating: resp.employeeRating || null,
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
          employeeOverallComment: overallComment,
        }),
      })

      if (!res.ok) throw new Error('Failed to save')

      toast({
        title: 'Success',
        description: 'Progress saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save progress',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async () => {
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
          employeeOverallComment: overallComment,
          status: 'SUBMITTED',
        }),
      })

      if (!res.ok) throw new Error('Failed to submit')

      toast({
        title: 'Success',
        description: 'Appraisal submitted successfully',
      })
      router.push('/employee/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit appraisal',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!appraisal) {
    return <div className="text-center py-12">Appraisal not found</div>
  }

  const canEdit = appraisal.status === 'DRAFT'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/employee/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{appraisal.template.title}</h1>
          <p className="text-muted-foreground">{appraisal.template.description}</p>
        </div>
      </div>

      {!canEdit && (
        <Card className="border-yellow-300 bg-yellow-50">
          <CardContent className="py-4">
            <p className="text-sm text-yellow-800">
              This appraisal has been submitted and can no longer be edited.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Self-Assessment Questions</CardTitle>
          <CardDescription>
            Please provide honest and thoughtful responses to each question.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {appraisal.template.questions.map((question: any, index: number) => {
            const response = responses[question.id] || {}

            return (
              <div key={question.id} className="space-y-3 pb-6 border-b last:border-0">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-muted-foreground">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <Label className="text-base">
                      {question.questionText}
                      {question.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {question.section && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Section: {question.section}
                      </p>
                    )}
                  </div>
                </div>

                <div className="ml-6">
                  {question.questionType === 'RATING' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            disabled={!canEdit}
                            onClick={() => handleResponseChange(question.id, 'employeeRating', rating)}
                            className={`w-12 h-12 rounded-full font-semibold transition-all ${
                              response.employeeRating === rating
                                ? 'bg-primary text-white scale-110'
                                : 'bg-gray-200 hover:bg-gray-300 disabled:hover:bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">1 = Poor, 5 = Excellent</p>
                    </div>
                  )}

                  {question.questionType === 'MULTIPLE_CHOICE' && (
                    <div className="space-y-2">
                      {question.options.map((option: string) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={response.employeeResponse === option}
                            onChange={(e) => handleResponseChange(question.id, 'employeeResponse', e.target.value)}
                            disabled={!canEdit}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {(question.questionType === 'TEXT' || question.questionType === 'COMMENT') && (
                    <textarea
                      value={response.employeeResponse || ''}
                      onChange={(e) => handleResponseChange(question.id, 'employeeResponse', e.target.value)}
                      disabled={!canEdit}
                      className="w-full min-h-[100px] p-3 border rounded-md disabled:opacity-50 disabled:bg-gray-50"
                      placeholder="Enter your response..."
                    />
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Overall Comment */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Comments</CardTitle>
          <CardDescription>
            Please provide any additional comments or context for your self-assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            value={overallComment}
            onChange={(e) => setOverallComment(e.target.value)}
            disabled={!canEdit}
            className="w-full min-h-[120px] p-3 border rounded-md disabled:opacity-50 disabled:bg-gray-50"
            placeholder="Your overall comments..."
          />
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
            onClick={handleSubmit}
            disabled={isSaving}
          >
            <Send className="mr-2 h-4 w-4" />
            Submit for Review
          </Button>
        </div>
      )}
    </div>
  )
}
