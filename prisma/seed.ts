import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const CATEGORIES = ["Almacén", "Bebidas", "Frescos", "Limpieza", "Congelados", "Perfumería"];

async function main() {
    console.log('Start seeding ...')

    // Create Admin User (requested by user)
    const hashedPassword = await bcrypt.hash('1998ari2003', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'lilayrton' },
        update: {},
        create: {
            username: 'lilayrton',
            email: 'lilayrton@community.com',
            name: 'Ayrton Admin',
            role: 'ADMIN',
            password: hashedPassword,
        },
    })
    console.log(`Created user: ${admin.username} (${admin.email})`)

    // Create Products
    const count = await prisma.product.count()
    if (count === 0) {
        console.log('Generating 300 products...')
        const products = Array.from({ length: 300 }, (_, i) => ({
            name: `Producto Ejemplo ${i + 1}`,
            description: `Esta es una descripción corta para el producto ejemplo número ${i + 1}.`,
            price: 500 + ((i * 157) % 4501),
            category: CATEGORIES[i % CATEGORIES.length],
            image: i < 10 ? `https://placehold.co/600x400?text=Producto+${i + 1}` : null,
            stock: 100
        }));

        for (const p of products) {
            await prisma.product.create({ data: p })
        }
        console.log('Products seeded.')
    } else {
        console.log('Products already exist.')
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
