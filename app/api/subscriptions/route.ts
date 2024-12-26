import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany({
      include: {
        _count: {
          select: { subscriptions: true }
        }
      }
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Error fetching plans' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planId } = await req.json()

    // Validate planId
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
    endDate.setDate(endDate.getDate() + plan.duration)

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId,
        startDate,
        endDate
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
