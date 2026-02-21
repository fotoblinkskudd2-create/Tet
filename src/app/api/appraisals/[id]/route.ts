// Individual Appraisal API routes

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    return NextResponse.json(appraisal)
  } catch (error) {
    console.error('Get appraisal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status, responses, employeeOverallComment, managerOverallComment, finalRating } = body

    const appraisal = await prisma.appraisal.findUnique({
      where: { id: params.id },
      include: { employee: true, manager: true, template: true },
    })

    if (!appraisal) {
      return NextResponse.json({ error: 'Appraisal not found' }, { status: 404 })
    }

    // Check permissions
    const isEmployee = appraisal.employeeId === session.user.id
    const isManager = appraisal.managerId === session.user.id
    const isAdmin = session.user.role === 'ADMIN'

    if (!isEmployee && !isManager && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update responses if provided
    if (responses && Array.isArray(responses)) {
      for (const resp of responses) {
        await prisma.response.update({
          where: {
            appraisalId_questionId: {
              appraisalId: params.id,
              questionId: resp.questionId,
            },
          },
          data: {
            ...(isEmployee && {
              employeeResponse: resp.employeeResponse,
              employeeRating: resp.employeeRating,
            }),
            ...(isManager && {
              managerResponse: resp.managerResponse,
              managerRating: resp.managerRating,
            }),
          },
        })
      }
    }

    // Update appraisal
    const updateData: any = {}

    if (status) updateData.status = status
    if (employeeOverallComment && isEmployee) {
      updateData.employeeOverallComment = employeeOverallComment
    }
    if (managerOverallComment && isManager) {
      updateData.managerOverallComment = managerOverallComment
    }
    if (finalRating && isManager) {
      updateData.finalRating = finalRating
    }

    // Update timestamps
    if (status === 'SUBMITTED') {
      updateData.submittedAt = new Date()
      // Create notification for manager
      if (appraisal.managerId) {
        await prisma.notification.create({
          data: {
            userId: appraisal.managerId,
            appraisalId: params.id,
            type: 'APPRAISAL_SUBMITTED',
            title: 'Appraisal Submitted for Review',
            message: `${appraisal.employee.name} submitted ${appraisal.template.title}`,
          },
        })
      }
    } else if (status === 'IN_REVIEW') {
      updateData.reviewedAt = new Date()
    } else if (status === 'COMPLETED') {
      updateData.completedAt = new Date()
      // Create notification for employee
      await prisma.notification.create({
        data: {
          userId: appraisal.employeeId,
          appraisalId: params.id,
          type: 'APPRAISAL_COMPLETED',
          title: 'Appraisal Completed',
          message: `Your appraisal ${appraisal.template.title} has been completed`,
        },
      })
    }

    const updatedAppraisal = await prisma.appraisal.update({
      where: { id: params.id },
      data: updateData,
      include: {
        employee: true,
        manager: true,
        template: true,
        responses: {
          include: { question: true },
        },
      },
    })

    return NextResponse.json(updatedAppraisal)
  } catch (error) {
    console.error('Update appraisal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
