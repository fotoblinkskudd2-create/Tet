// Manager Dashboard

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Clock, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDate, getStatusColor } from '@/lib/utils'

async function getManagerStats(userId: string) {
  const [total, pending, completed] = await Promise.all([
    prisma.appraisal.count({ where: { managerId: userId } }),
    prisma.appraisal.count({ where: { managerId: userId, status: { in: ['SUBMITTED', 'IN_REVIEW'] } } }),
    prisma.appraisal.count({ where: { managerId: userId, status: 'COMPLETED' } }),
  ])

  return { total, pending, completed }
}

async function getPendingAppraisals(userId: string) {
  return await prisma.appraisal.findMany({
    where: {
      managerId: userId,
      status: { in: ['SUBMITTED', 'IN_REVIEW'] },
    },
    orderBy: { submittedAt: 'asc' },
    include: {
      employee: { select: { name: true, email: true } },
      template: { select: { title: true } },
    },
  })
}

export default async function ManagerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== 'MANAGER' && session.user.role !== 'ADMIN')) {
    redirect('/')
  }

  const stats = await getManagerStats(session.user.id)
  const pendingAppraisals = await getPendingAppraisals(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Manager Dashboard</h1>
        <p className="text-muted-foreground">Review and approve employee appraisals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Appraisals
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Reviews */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingAppraisals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No pending reviews at this time.
            </p>
          ) : (
            <div className="space-y-4">
              {pendingAppraisals.map((appraisal) => (
                <div
                  key={appraisal.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{appraisal.employee.name}</h3>
                    <p className="text-sm text-muted-foreground">{appraisal.template.title}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-sm text-muted-foreground">
                      {appraisal.submittedAt && (
                        <span>Submitted: {formatDate(appraisal.submittedAt)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appraisal.status)}`}>
                      {appraisal.status.replace('_', ' ')}
                    </span>
                    <Link href={`/manager/reviews/${appraisal.id}`}>
                      <Button>Review</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
