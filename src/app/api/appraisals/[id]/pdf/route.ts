// PDF Generation API Route

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { createElement } from 'react'

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #3b82f6',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    fontWeight: 'bold',
    width: 120,
    color: '#374151',
  },
  value: {
    flex: 1,
    color: '#6b7280',
  },
  question: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  questionText: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#111827',
  },
  responseBlock: {
    marginLeft: 10,
    marginBottom: 8,
  },
  responseLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 3,
  },
  responseText: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.4,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  overallSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
  },
  finalRating: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
    marginVertical: 10,
  },
  footer: {
    marginTop: 30,
    paddingTop: 10,
    borderTop: '1 solid #e5e7eb',
    fontSize: 9,
    color: '#9ca3af',
    textAlign: 'center',
  },
})

// PDF Document Component
const AppraisalPDF = ({ appraisal }: { appraisal: any }) => (
  createElement(Document, {},
    createElement(Page, { size: 'A4', style: styles.page },
      // Header
      createElement(View, { style: styles.header },
        createElement(Text, { style: styles.title }, 'Performance Appraisal Report'),
        createElement(Text, { style: styles.subtitle }, `Generated on ${new Date().toLocaleDateString()}`)
      ),

      // Employee Info
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, 'Employee Information'),
        createElement(View, { style: styles.infoRow },
          createElement(Text, { style: styles.label }, 'Employee:'),
          createElement(Text, { style: styles.value }, appraisal.employee.name)
        ),
        createElement(View, { style: styles.infoRow },
          createElement(Text, { style: styles.label }, 'Email:'),
          createElement(Text, { style: styles.value }, appraisal.employee.email)
        ),
        appraisal.manager && createElement(View, { style: styles.infoRow },
          createElement(Text, { style: styles.label }, 'Manager:'),
          createElement(Text, { style: styles.value }, appraisal.manager.name)
        ),
        createElement(View, { style: styles.infoRow },
          createElement(Text, { style: styles.label }, 'Template:'),
          createElement(Text, { style: styles.value }, appraisal.template.title)
        ),
        createElement(View, { style: styles.infoRow },
          createElement(Text, { style: styles.label }, 'Status:'),
          createElement(Text, { style: styles.value }, appraisal.status)
        ),
        appraisal.completedAt && createElement(View, { style: styles.infoRow },
          createElement(Text, { style: styles.label }, 'Completed:'),
          createElement(Text, { style: styles.value }, new Date(appraisal.completedAt).toLocaleDateString())
        )
      ),

      // Questions and Responses
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, 'Appraisal Details'),
        ...appraisal.template.questions.map((question: any, index: number) => {
          const response = appraisal.responses.find((r: any) => r.questionId === question.id)
          return createElement(View, { key: question.id, style: styles.question },
            createElement(Text, { style: styles.questionText }, `${index + 1}. ${question.questionText}`),

            // Employee Response
            response?.employeeResponse && createElement(View, { style: styles.responseBlock },
              createElement(Text, { style: styles.responseLabel }, 'Employee Response:'),
              createElement(Text, { style: styles.responseText }, response.employeeResponse)
            ),
            response?.employeeRating && createElement(View, { style: styles.responseBlock },
              createElement(Text, { style: styles.responseLabel }, 'Employee Rating:'),
              createElement(Text, { style: styles.rating }, `${response.employeeRating}/5`)
            ),

            // Manager Response
            response?.managerResponse && createElement(View, { style: styles.responseBlock },
              createElement(Text, { style: styles.responseLabel }, 'Manager Feedback:'),
              createElement(Text, { style: styles.responseText }, response.managerResponse)
            ),
            response?.managerRating && createElement(View, { style: styles.responseBlock },
              createElement(Text, { style: styles.responseLabel }, 'Manager Rating:'),
              createElement(Text, { style: styles.rating }, `${response.managerRating}/5`)
            )
          )
        })
      ),

      // Overall Comments
      createElement(View, { style: styles.section },
        createElement(Text, { style: styles.sectionTitle }, 'Overall Assessment'),
        appraisal.employeeOverallComment && createElement(View, { style: styles.responseBlock },
          createElement(Text, { style: styles.responseLabel }, 'Employee Comments:'),
          createElement(Text, { style: styles.responseText }, appraisal.employeeOverallComment)
        ),
        appraisal.managerOverallComment && createElement(View, { style: styles.responseBlock },
          createElement(Text, { style: styles.responseLabel }, 'Manager Comments:'),
          createElement(Text, { style: styles.responseText }, appraisal.managerOverallComment)
        )
      ),

      // Final Rating
      appraisal.finalRating && createElement(View, { style: styles.overallSection },
        createElement(Text, { style: styles.sectionTitle }, 'Final Rating'),
        createElement(Text, { style: styles.finalRating }, `${appraisal.finalRating}/5`)
      ),

      // Footer
      createElement(View, { style: styles.footer },
        createElement(Text, {}, 'This is an official performance appraisal document.')
      )
    )
  )
)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const appraisal = await prisma.appraisal.findUnique({
      where: { id: params.id },
      include: {
        employee: {
          select: { id: true, name: true, email: true },
        },
        manager: {
          select: { id: true, name: true, email: true },
        },
        template: {
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
        responses: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!appraisal) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 })
    }

    // Check access permissions
    const hasAccess =
      session.user.role === 'ADMIN' ||
      appraisal.employeeId === session.user.id ||
      appraisal.managerId === session.user.id

    if (!hasAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate PDF
    const pdfDoc = createElement(AppraisalPDF, { appraisal })
    const pdfBytes = await pdf(pdfDoc).toBuffer()

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="appraisal-${appraisal.employee.name}-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}
