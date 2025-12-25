// Appraisals API routes

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { sendEmail, getAppraisalAssignedEmail } from '@/lib/email'

const createAppraisalSchema = z.object({
  employeeId: z.string(),
  managerId: z.string().optional(),
  templateId: z.string(),
  dueDate: z.string().optional(),
})

// GET appraisals (filtered by user role)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let whereClause: any = {}

    // Filter based on user role
    if (session.user.role === 'EMPLOYEE') {
      whereClause.employeeId = session.user.id
    } else if (session.user.role === 'MANAGER') {
      whereClause.OR = [
        { managerId: session.user.id },
        { employeeId: session.user.id },
      ]
    }
    // ADMIN sees all appraisals

    if (status) {
      whereClause.status = status
    }

    const appraisals = await prisma.appraisal.findMany({
      where: whereClause,
      include: {
        employee: {
          select: { id: true, name: true, email: true },
        },
        manager: {
          select: { id: true, name: true, email: true },
        },
        template: {
          select: { id: true, title: true, description: true },
        },
        _count: {
          select: { responses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(appraisals)
  } catch (error) {
    console.error('Get appraisals error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// CREATE new appraisal (Admin assigns)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createAppraisalSchema.parse(body)

    // Get template questions
    const template = await prisma.appraisalTemplate.findUnique({
      where: { id: validatedData.templateId },
      include: { questions: true },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    // Create appraisal with empty responses
    const appraisal = await prisma.appraisal.create({
      data: {
        employeeId: validatedData.employeeId,
        managerId: validatedData.managerId,
        templateId: validatedData.templateId,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        status: 'DRAFT',
        responses: {
          create: template.questions.map((q) => ({
            questionId: q.id,
          })),
        },
        assignment: {
          create: {
            assignedToId: validatedData.employeeId,
            dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
          },
        },
      },
      include: {
        employee: true,
        template: true,
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: validatedData.employeeId,
        appraisalId: appraisal.id,
        type: 'APPRAISAL_ASSIGNED',
        title: 'New Appraisal Assigned',
        message: `You have been assigned: ${template.title}`,
      },
    })

    // Send email notification
    if (appraisal.employee.email) {
      await sendEmail({
        to: appraisal.employee.email,
        subject: 'New Performance Appraisal Assigned',
        html: getAppraisalAssignedEmail(
          appraisal.employee.name || 'Employee',
          template.title,
          appraisal.dueDate || undefined
        ),
      })
    }

    return NextResponse.json(appraisal, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Create appraisal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
