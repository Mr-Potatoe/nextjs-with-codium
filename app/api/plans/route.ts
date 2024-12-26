import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const plans = await prisma.membershipPlan.findMany({
      orderBy: {
        price: 'asc'
      }
    })

    // Parse the features JSON string for each plan
    const parsedPlans = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features as string)
    }))

    return NextResponse.json(parsedPlans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch membership plans' },
      { status: 500 }
    )
  }
}
