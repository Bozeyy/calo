import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/logs?date=2024-01-15
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const dateParam = searchParams.get('date')

  if (dateParam) {
    const date = new Date(dateParam)
    date.setUTCHours(0, 0, 0, 0)

    const log = await prisma.foodLog.findUnique({
      where: { userId_date: { userId: session.userId, date } },
      include: {
        items: {
          include: { food: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json(log || { date: dateParam, items: [] })
  }

  // Return last 30 days summary
  const logs = await prisma.foodLog.findMany({
    where: { userId: session.userId },
    include: {
      items: { include: { food: true } },
    },
    orderBy: { date: 'desc' },
    take: 30,
  })

  return NextResponse.json(logs)
}

// POST /api/logs — add item to today's log
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { foodId, quantity, mealType, date } = await req.json()

    if (!foodId || !quantity) {
      return NextResponse.json({ error: 'foodId et quantity requis' }, { status: 400 })
    }

    const logDate = new Date(date || new Date().toISOString().split('T')[0])
    logDate.setUTCHours(0, 0, 0, 0)

    // Upsert the day log
    const log = await prisma.foodLog.upsert({
      where: { userId_date: { userId: session.userId, date: logDate } },
      update: {},
      create: { userId: session.userId, date: logDate },
    })

    const item = await prisma.foodLogItem.create({
      data: {
        foodLogId: log.id,
        foodId,
        quantity: parseFloat(quantity),
        mealType: mealType || 'other',
      },
      include: { food: true },
    })

    return NextResponse.json(item)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
