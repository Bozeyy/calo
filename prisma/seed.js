const { PrismaClient } = require('@prisma/client')

const client = new PrismaClient()

const defaultFoods = [
  // Protéines
  { name: 'Poulet (blanc, cuit)', calories: 165, protein: 31, carbs: 0, fat: 3.6, unit: 'g' },
  { name: 'Oeuf entier', calories: 155, protein: 13, carbs: 1.1, fat: 11, unit: 'g' },
  { name: 'Saumon (cuit)', calories: 208, protein: 20, carbs: 0, fat: 13, unit: 'g' },
  { name: 'Thon en conserve (naturel)', calories: 116, protein: 26, carbs: 0, fat: 1, unit: 'g' },
  { name: 'Boeuf hache (5% MG)', calories: 137, protein: 21, carbs: 0, fat: 5.5, unit: 'g' },
  { name: 'Fromage blanc 0%', calories: 45, protein: 8, carbs: 4, fat: 0.1, unit: 'g' },
  { name: 'Yaourt nature', calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, unit: 'g' },
  // Glucides
  { name: 'Riz blanc (cuit)', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, unit: 'g' },
  { name: 'Pates (cuites)', calories: 131, protein: 5, carbs: 25, fat: 1.1, unit: 'g' },
  { name: 'Pain complet', calories: 247, protein: 8.5, carbs: 41, fat: 3.4, unit: 'g' },
  { name: 'Flocons d avoine', calories: 389, protein: 17, carbs: 66, fat: 7, unit: 'g' },
  { name: 'Pomme de terre (cuite)', calories: 87, protein: 1.9, carbs: 20, fat: 0.1, unit: 'g' },
  { name: 'Patate douce (cuite)', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, unit: 'g' },
  { name: 'Lentilles (cuites)', calories: 116, protein: 9, carbs: 20, fat: 0.4, unit: 'g' },
  { name: 'Pois chiches (cuits)', calories: 164, protein: 8.9, carbs: 27, fat: 2.6, unit: 'g' },
  // Legumes
  { name: 'Brocoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, unit: 'g' },
  { name: 'Epinards', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, unit: 'g' },
  { name: 'Tomate', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, unit: 'g' },
  { name: 'Concombre', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, unit: 'g' },
  { name: 'Salade verte', calories: 17, protein: 1.3, carbs: 2.9, fat: 0.3, unit: 'g' },
  { name: 'Carotte', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, unit: 'g' },
  { name: 'Courgette', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, unit: 'g' },
  { name: 'Champignons', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, unit: 'g' },
  // Fruits
  { name: 'Banane', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, unit: 'g' },
  { name: 'Pomme', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, unit: 'g' },
  { name: 'Fraises', calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, unit: 'g' },
  { name: 'Myrtilles', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, unit: 'g' },
  { name: 'Avocat', calories: 160, protein: 2, carbs: 9, fat: 15, unit: 'g' },
  { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, unit: 'g' },
  // Graisses et noix
  { name: 'Huile d olive', calories: 884, protein: 0, carbs: 0, fat: 100, unit: 'ml' },
  { name: 'Beurre', calories: 717, protein: 0.9, carbs: 0.1, fat: 81, unit: 'g' },
  { name: 'Amandes', calories: 579, protein: 21, carbs: 22, fat: 50, unit: 'g' },
  { name: 'Noix de cajou', calories: 553, protein: 18, carbs: 30, fat: 44, unit: 'g' },
  // Boissons
  { name: 'Lait entier', calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, unit: 'ml' },
  { name: 'Lait demi-ecreme', calories: 46, protein: 3.2, carbs: 4.8, fat: 1.5, unit: 'ml' },
  { name: 'Jus d orange', calories: 45, protein: 0.7, carbs: 10, fat: 0.2, unit: 'ml' },
  // Fromages
  { name: 'Emmental', calories: 379, protein: 28, carbs: 0.5, fat: 29, unit: 'g' },
  { name: 'Mozzarella', calories: 280, protein: 28, carbs: 2.2, fat: 17, unit: 'g' },
  { name: 'Parmesan', calories: 431, protein: 38, carbs: 0, fat: 29, unit: 'g' },
]

async function main() {
  console.log('Seeding database...')
  let created = 0
  let skipped = 0

  for (const food of defaultFoods) {
    const existing = await client.food.findFirst({
      where: { name: food.name, isDefault: true }
    })
    if (!existing) {
      await client.food.create({
        data: { ...food, isDefault: true }
      })
      created++
    } else {
      skipped++
    }
  }

  console.log(`Done: ${created} created, ${skipped} skipped`)
}

main()
  .catch(console.error)
  .finally(() => client.$disconnect())
