import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const plans = await prisma.membershipPlan.findMany({
      orderBy: { price: 'asc' }
    })

    // Parse the features JSON string into an array for each plan
    const parsedPlans = plans.map(plan => ({
      ...plan,
      features: plan.features ? JSON.parse(plan.features as string) : []
    }))

    return NextResponse.json(parsedPlans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const { name, description, price, duration, features } = await req.json()

    const plan = await prisma.membershipPlan.create({
      data: {
        name,
        description,
        price,
        duration,
        features: Array.isArray(features) ? JSON.stringify(features) : '[]'
      }
    })

    return NextResponse.json({
      ...plan,
      features: JSON.parse(plan.features as string)
    })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
