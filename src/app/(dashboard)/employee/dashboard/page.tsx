// Employee Dashboard

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatDate, getStatusColor } from '@/lib/utils'

async function getEmployeeStats(userId: string) {
  const [total, draft, submitted, completed] = await Promise.all([
    prisma.appraisal.count({ where: { employeeId: userId } }),
    prisma.appraisal.count({ where: { employeeId: userId, status: 'DRAFT' } }),
    prisma.appraisal.count({ where: { employeeId: userId, status: { in: ['SUBMITTED', 'IN_REVIEW'] } } }),
    prisma.appraisal.count({ where: { employeeId: userId, status: 'COMPLETED' } }),
  ])

  return { total, draft, submitted, completed }
}

async function getEmployeeAppraisals(userId: string) {
  return await prisma.appraisal.findMany({
    where: { employeeId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      template: { select: { title: true, description: true } },
      manager: { select: { name: true, email: true } },
    },
  })
}

export default async function EmployeeDashboard() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/auth/signin')
  }

  const stats = await getEmployeeStats(session.user.id)
  const appraisals = await getEmployeeAppraisals(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.user.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              In Progress
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.draft}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Under Review
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.submitted}</div>
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

      {/* Appraisals List */}
      <Card>
        <CardHeader>
          <CardTitle>My Appraisals</CardTitle>
        </CardHeader>
        <CardContent>
          {appraisals.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No appraisals assigned yet.
            </p>
          ) : (
            <div className="space-y-4">
              {appraisals.map((appraisal) => (
                <div
                  key={appraisal.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors gap-4"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{appraisal.template.title}</h3>
                    {appraisal.template.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {appraisal.template.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2 text-sm">
                      <span className="text-muted-foreground">
                        Created: {formatDate(appraisal.createdAt)}
                      </span>
                      {appraisal.dueDate && (
                        <span className="text-muted-foreground">
                          • Due: {formatDate(appraisal.dueDate)}
                        </span>
                      )}
                      {appraisal.manager && (
                        <span className="text-muted-foreground">
                          • Manager: {appraisal.manager.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(appraisal.status)}`}>
                      {appraisal.status.replace('_', ' ')}
                    </span>
                    <Link href={`/employee/appraisals/${appraisal.id}`}>
                      <Button variant={appraisal.status === 'DRAFT' ? 'default' : 'outline'}>
                        {appraisal.status === 'DRAFT' ? 'Continue' : 'View'}
                      </Button>
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
