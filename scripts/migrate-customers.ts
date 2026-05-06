import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando migración de clientes...");

    // 1. Leer archivos JSON
    const customersFilePath = path.join(process.cwd(), 'ti_customers.json');
    const addressesFilePath = path.join(process.cwd(), 'ti_addresses.json');

    const customersFile = JSON.parse(fs.readFileSync(customersFilePath, 'utf8'));
    const addressesFile = JSON.parse(fs.readFileSync(addressesFilePath, 'utf8'));

    // Obtener los arrays de datos (phpMyAdmin export format)
    const customersData = customersFile.find((item: any) => item.type === 'table' && item.name === 'ti_customers')?.data || [];
    const addressesData = addressesFile.find((item: any) => item.type === 'table' && (item.name === 'ti_addresses' || item.name === 'ti_address'))?.data || [];

    console.log(`Encontrados ${customersData.length} clientes y ${addressesData.length} direcciones.`);

    // 2. Crear mapa de direcciones indexado por address_id
    const addressMap = new Map<string, string>();
    for (const addr of addressesData) {
        // Construir string de dirección
        const parts = [addr.address_1, addr.address_2, addr.city, addr.state, addr.postcode].filter(Boolean);
        const fullAddress = parts.join(", ");
        addressMap.set(addr.address_id, fullAddress);
    }

    let unassignedList: any[] = [];
    let successCount = 0;
    let errorCount = 0;

    // 3. Procesar clientes
    for (const c of customersData) {
        try {
            const customerId = parseInt(c.customer_id);
            const name = `${c.first_name} ${c.last_name}`.trim();
            const email = c.email.trim().toLowerCase();
            const password = c.password;
            const phone = c.telephone || null;
            const isActive = c.status === '1';
            const oldId = customerId;
            const lastLogin = c.last_login ? new Date(c.last_login) : null;
            const createdAt = c.created_at ? new Date(c.created_at) : new Date();

            // Mapeo de tienda
            let assignedStore = "alsina"; // fallback
            const groupId = c.customer_group_id;
            let isUnassigned = false;

            if (groupId === '2') {
                assignedStore = "malabia";
            } else if (groupId === '4') {
                assignedStore = "alsina";
            } else if (groupId === '1' || groupId === '3') {
                assignedStore = "pendiente";
                isUnassigned = true;
            }

            // Mapeo de dirección
            const address = addressMap.get(c.address_id) || null;

            // Generar username si el email ya está usado o generar uno único
            const baseUsername = email.split('@')[0];
            let username = baseUsername;
            
            // Check if user exists by email or oldId
            const existing = await prisma.user.findFirst({
                where: { OR: [{ email }, { oldId }] }
            });

            if (!existing) {
                // Ensure username is unique
                let usernameExists = await prisma.user.findUnique({ where: { username } });
                let counter = 1;
                while (usernameExists) {
                    username = `${baseUsername}${counter}`;
                    usernameExists = await prisma.user.findUnique({ where: { username } });
                    counter++;
                }

                await prisma.user.create({
                    data: {
                        oldId,
                        name,
                        email,
                        username,
                        password, // Import hash directly
                        phone,
                        address,
                        isActive,
                        assignedStore,
                        lastLogin,
                        createdAt,
                        role: "CUSTOMER"
                    }
                });
                successCount++;

                if (isUnassigned) {
                    unassignedList.push({ id: oldId, name, email, previousGroup: groupId === '1' ? 'Default' : 'Palermo', phone });
                }
            } else {
                console.log(`Usuario ya existe: ${email} (oldId: ${oldId})`);
            }

        } catch (error) {
            console.error(`Error migrando cliente ID ${c.customer_id}:`, error);
            errorCount++;
        }
    }

    console.log(`\nMigración finalizada!`);
    console.log(`- Creados: ${successCount}`);
    console.log(`- Errores: ${errorCount}`);
    
    if (unassignedList.length > 0) {
        console.log(`\nATENCIÓN: Se encontraron ${unassignedList.length} clientes sin tienda asignada (grupos 1 y 3).`);
        // Guardar lista
        const listPath = path.join(process.cwd(), 'clientes_sin_tienda.json');
        fs.writeFileSync(listPath, JSON.stringify(unassignedList, null, 2));
        console.log(`Lista guardada en: ${listPath}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
