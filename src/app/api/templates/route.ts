// Appraisal Templates API routes

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const questionSchema = z.object({
  questionText: z.string().min(1),
  questionType: z.enum(['TEXT', 'RATING', 'MULTIPLE_CHOICE', 'COMMENT']),
  options: z.array(z.string()).optional().default([]),
  isRequired: z.boolean().default(true),
  section: z.string().optional(),
})

const templateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
})

// GET all templates
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templates = await prisma.appraisalTemplate.findMany({
      where: { isActive: true },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { appraisals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error('Get templates error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// CREATE new template
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = templateSchema.parse(body)

    const template = await prisma.appraisalTemplate.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        createdById: session.user.id,
        questions: {
          create: validatedData.questions.map((q, index) => ({
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options || [],
            isRequired: q.isRequired,
            order: index,
            section: q.section,
          })),
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Create template error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
