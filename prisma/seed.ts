const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create default plans
  const plans = [
    {
      name: 'Basic',
      description: 'Perfect for beginners',
      price: 29.99,
      duration: 30, // 30 days
      features: JSON.stringify([
        'Access to gym equipment',
        'Basic fitness assessment',
        'Locker room access',
        'Standard gym hours'
      ])
    },
    {
      name: 'Pro',
      description: 'For serious fitness enthusiasts',
      price: 49.99,
      duration: 30,
      features: JSON.stringify([
        'All Basic features',
        'Personal trainer sessions',
        'Group fitness classes',
        'Extended gym hours'
      ])
    },
    {
      name: 'Elite',
      description: 'The ultimate fitness experience',
      price: 99.99,
      duration: 30,
      features: JSON.stringify([
        'All Pro features',
        'Nutrition consultation',
        'Recovery spa access',
        '24/7 gym access'
      ])
    }
  ]

  for (const plan of plans) {
    await prisma.membershipPlan.create({
      data: plan
    })
  }

  // Create admin user
  const adminPassword = await hash('admin123', 12)
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@gymflex.com',
      password: adminPassword,
      role: 'admin',
      profile: {
        create: {}
      }
    }
  })

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
