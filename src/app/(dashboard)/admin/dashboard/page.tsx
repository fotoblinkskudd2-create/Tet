// Admin Dashboard

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ClipboardList, FileText, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

async function getStats() {
  const [totalUsers, totalTemplates, totalAppraisals, activeAppraisals] = await Promise.all([
    prisma.user.count(),
    prisma.appraisalTemplate.count({ where: { isActive: true } }),
    prisma.appraisal.count(),
    prisma.appraisal.count({ where: { status: { in: ['DRAFT', 'SUBMITTED', 'IN_REVIEW'] } } }),
  ])

  return { totalUsers, totalTemplates, totalAppraisals, activeAppraisals }
}

async function getRecentAppraisals() {
  return await prisma.appraisal.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      employee: { select: { name: true, email: true } },
      template: { select: { title: true } },
    },
  })
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (session?.user?.role !== 'ADMIN') {
    redirect('/')
  }

  const stats = await getStats()
  const recentAppraisals = await getRecentAppraisals()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/templates/new">
          <Button>Create Template</Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Templates
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Appraisals
            </CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAppraisals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Appraisals
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAppraisals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appraisals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Appraisals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAppraisals.map((appraisal) => (
              <div
                key={appraisal.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="font-medium">{appraisal.employee.name}</p>
                  <p className="text-sm text-muted-foreground">{appraisal.template.title}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    appraisal.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : appraisal.status === 'IN_REVIEW'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {appraisal.status}
                  </span>
                  <Link href={`/appraisals/${appraisal.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/templates">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Manage Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create and edit appraisal templates
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/assign">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Assign Appraisals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Assign appraisals to employees
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Manage Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and manage user accounts
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
