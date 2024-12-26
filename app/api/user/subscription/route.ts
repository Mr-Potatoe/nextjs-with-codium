import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's current subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        endDate: {
          gte: new Date()
        }
      },
      orderBy: {
        startDate: 'desc'
      },
      include: {
        membershipPlan: true
      }
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Error fetching subscription' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planId } = await req.json()

    // Get the plan details
    const plan = await prisma.membershipPlan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Calculate subscription dates
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + plan.duration)

    // Create new subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId: planId,
        startDate,
        endDate,
        status: 'active'
      },
      include: {
        membershipPlan: true
      }
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Error creating subscription' },
      { status: 500 }
    )
  }
}
