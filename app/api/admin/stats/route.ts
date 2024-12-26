import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      console.log('Unauthorized access attempt:', session?.user)
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    // Get total members
    const totalMembers = await prisma.user.count({
      where: { role: 'user' }
    })

    // Get active subscriptions
    const activeSubscriptions = await prisma.subscription.count({
      where: { status: 'active' }
    })

    // Calculate monthly revenue
    const currentMonth = new Date()
    currentMonth.setDate(1) // First day of current month
    
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: 'active',
        startDate: {
          gte: currentMonth
        }
      },
      include: {
        membershipPlan: true
      }
    })

    const monthlyRevenue = subscriptions.reduce((total, sub) => {
      return total + (sub.membershipPlan?.price || 0)
    }, 0)

    // Calculate membership growth (comparing to last month)
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    lastMonth.setDate(1)

    const lastMonthMembers = await prisma.user.count({
      where: {
        role: 'user',
        createdAt: {
          lt: currentMonth,
          gte: lastMonth
        }
      }
    })

    const membershipGrowth = lastMonthMembers === 0 
      ? 0 
      : Math.round(((totalMembers - lastMonthMembers) / lastMonthMembers) * 100)

    return NextResponse.json({
      totalMembers,
      activeSubscriptions,
      monthlyRevenue,
      membershipGrowth
    })
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
