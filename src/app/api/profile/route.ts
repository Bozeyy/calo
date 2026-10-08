import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { weight: true, height: true, age: true, gender: true, activityLevel: true, dailyTarget: true, objective: true, weightGoalRate: true, name: true, email: true }
    })
    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await req.json()
    const { weight, height, age, gender, activityLevel, dailyTarget, objective, weightGoalRate } = data

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        activityLevel: activityLevel || null,
        dailyTarget: dailyTarget ? parseInt(dailyTarget) : null,
        objective: objective || null,
        weightGoalRate: weightGoalRate ? parseFloat(weightGoalRate) : null,
      },
      select: { weight: true, height: true, age: true, gender: true, activityLevel: true, dailyTarget: true, objective: true, weightGoalRate: true, name: true, email: true }
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
