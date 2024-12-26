import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const { id } = params
    const { name, description, price, duration, features } = await req.json()

    const plan = await prisma.membershipPlan.update({
      where: { id },
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
    console.error('Error updating plan:', error)
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      )
    }

    const { id } = params

    // Check if plan exists
    const existingPlan = await prisma.membershipPlan.findUnique({
      where: { id }
    })

    if (!existingPlan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Delete the plan
    await prisma.membershipPlan.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting plan:', error)
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    )
  }
}
