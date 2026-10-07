import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { id } = await params

  try {
    const item = await prisma.foodLogItem.findUnique({
      where: { id },
      include: { foodLog: true },
    })

    if (!item || item.foodLog.userId !== session.userId) {
      return NextResponse.json({ error: 'Non trouvé' }, { status: 404 })
    }

    await prisma.foodLogItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
