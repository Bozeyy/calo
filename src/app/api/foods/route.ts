import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''

  const foods = await prisma.food.findMany({
    where: {
      AND: [
        { name: { contains: q, mode: 'insensitive' } },
        {
          OR: [
            { isDefault: true },
            { userId: session.userId },
          ]
        }
      ]
    },
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    take: 50,
  })

  return NextResponse.json(foods)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  try {
    const { name, calories, protein, carbs, fat, unit } = await req.json()

    if (!name || calories === undefined) {
      return NextResponse.json({ error: 'Nom et calories requis' }, { status: 400 })
    }

    const food = await prisma.food.create({
      data: {
        name,
        calories: parseFloat(calories),
        protein: protein ? parseFloat(protein) : null,
        carbs: carbs ? parseFloat(carbs) : null,
        fat: fat ? parseFloat(fat) : null,
        unit: unit || 'g',
        isDefault: false,
        userId: session.userId,
      },
    })

    return NextResponse.json(food)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
