import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    throw new Error("DATABASE_URL is not defined in environment variables");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Starting database seeding...\n");

    const seedPassword = process.env.SEED_USER_PASSWORD;

    if (!seedPassword) {
        throw new Error("SEED_USER_PASSWORD is not defined in environment variables");
    }

    // --------------------------------------------------
    // 1. USERS
    // --------------------------------------------------

    const passwordHash = await bcrypt.hash(seedPassword, 12);

    const users = [
        {
            username: "admin",
            email: "admin@example.com",
            role: "Admin" as const,
        },
        {
            username: "warehouse_manager",
            email: "manager@example.com",
            role: "WarehouseManager" as const,
        },
        {
            username: "stock_keeper",
            email: "stockkeeper@example.com",
            role: "StockKeeper" as const,
        },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {
                username: user.username,
                role: user.role,
            },
            create: {
                ...user,
                passwordHash,
            },
        });
    }

    console.log("Users seeded successfully.");

    // --------------------------------------------------
    // 2. WAREHOUSES
    // --------------------------------------------------

    const warehouses = [
        {
            code: "WH-COLD-01",
            name: "Main Cold Storage",
            type: "Cold" as const,
            address: "Main Facility",
            description: "Storage for frozen products.",
        },
        {
            code: "WH-CHILLED-01",
            name: "Chilled Storage",
            type: "Chilled" as const,
            address: "Main Facility",
            description: "Storage for chilled products.",
        },
        {
            code: "WH-DRY-01",
            name: "Dry Storage",
            type: "Dry" as const,
            address: "Main Facility",
            description: "Storage for products that do not require refrigeration.",
        },
    ];

    for (const warehouse of warehouses) {
        await prisma.warehouse.upsert({
            where: { code: warehouse.code },
            update: {
                name: warehouse.name,
                type: warehouse.type,
                address: warehouse.address,
                description: warehouse.description,
            },
            create: warehouse,
        });
    }

    console.log("Warehouses seeded successfully.");

    // --------------------------------------------------
    // 3. PRODUCTS
    // --------------------------------------------------

    const products = [
        {
            name: "Frozen Chicken Breast",
            brand: "FreshFarm",
            quantityPerBox: 10,
            unitMass: "1.5",
            boxesPerPallet: 40,
        },
        {
            name: "Frozen Whole Chicken",
            brand: "FreshFarm",
            quantityPerBox: 8,
            unitMass: "1.8",
            boxesPerPallet: 30,
        },
        {
            name: "Frozen Vegetables",
            brand: "GreenHarvest",
            quantityPerBox: 12,
            unitMass: "1.0",
            boxesPerPallet: 50,
        },
        {
            name: "Chilled Chicken Wings",
            brand: "FreshFarm",
            quantityPerBox: 10,
            unitMass: "1.2",
            boxesPerPallet: 40,
        },
    ];

    for (const product of products) {
        const existingProduct = await prisma.product.findFirst({
            where: { name: product.name },
        });

        if (existingProduct) {
            await prisma.product.update({
                where: { id: existingProduct.id },
                data: product,
            });
        } else {
            await prisma.product.create({
                data: product,
            });
        }
    }

    console.log("Products seeded successfully.");

    // --------------------------------------------------
    // 4. BATCHES
    // --------------------------------------------------

    const batchSeeds = [
        {
            batchNumber: "BAT-20261001-000001",
            productName: "Frozen Chicken Breast",
            productionDate: new Date("2026-10-01T00:00:00.000Z"),
            expiryDate: new Date("2027-10-01T00:00:00.000Z"),
            arrivalDate: new Date("2026-10-05T00:00:00.000Z"),
        },
        {
            batchNumber: "BAT-20261015-000002",
            productName: "Frozen Chicken Breast",
            productionDate: new Date("2026-10-15T00:00:00.000Z"),
            expiryDate: new Date("2027-10-15T00:00:00.000Z"),
            arrivalDate: new Date("2026-10-20T00:00:00.000Z"),
        },
        {
            batchNumber: "BAT-20261010-000003",
            productName: "Frozen Whole Chicken",
            productionDate: new Date("2026-10-10T00:00:00.000Z"),
            expiryDate: new Date("2027-10-10T00:00:00.000Z"),
            arrivalDate: new Date("2026-10-12T00:00:00.000Z"),
        },
        {
            batchNumber: "BAT-20261012-000004",
            productName: "Frozen Vegetables",
            productionDate: new Date("2026-10-12T00:00:00.000Z"),
            expiryDate: new Date("2027-04-12T00:00:00.000Z"),
            arrivalDate: new Date("2026-10-14T00:00:00.000Z"),
        },
        {
            batchNumber: "BAT-20261020-000005",
            productName: "Chilled Chicken Wings",
            productionDate: new Date("2026-10-20T00:00:00.000Z"),
            expiryDate: new Date("2026-11-20T00:00:00.000Z"),
            arrivalDate: new Date("2026-10-22T00:00:00.000Z"),
        },
    ];

    for (const batchSeed of batchSeeds) {
        const product = await prisma.product.findFirst({
            where: { name: batchSeed.productName },
        });

        if (!product) {
            throw new Error(
                `Product not found for batch ${batchSeed.batchNumber}: ${batchSeed.productName}`,
            );
        }

        await prisma.batch.upsert({
            where: { batchNumber: batchSeed.batchNumber },
            update: {
                productId: product.id,
                productionDate: batchSeed.productionDate,
                expiryDate: batchSeed.expiryDate,
                arrivalDate: batchSeed.arrivalDate,
            },
            create: {
                batchNumber: batchSeed.batchNumber,
                productId: product.id,
                productionDate: batchSeed.productionDate,
                expiryDate: batchSeed.expiryDate,
                arrivalDate: batchSeed.arrivalDate,
            },
        });
    }

    console.log("Batches seeded successfully.");

    // --------------------------------------------------
    // 5. LOCATIONS
    // --------------------------------------------------

    const locationSeeds = [
        {
            warehouseCode: "WH-COLD-01",
            roomNumber: 1,
            rack: "R-01",
            level: 1,
            pallet: "P-01",
        },
        {
            warehouseCode: "WH-COLD-01",
            roomNumber: 1,
            rack: "R-01",
            level: 1,
            pallet: "P-02",
        },
        {
            warehouseCode: "WH-COLD-01",
            roomNumber: 1,
            rack: "R-02",
            level: 1,
            pallet: "P-01",
        },
        {
            warehouseCode: "WH-CHILLED-01",
            roomNumber: 1,
            rack: "R-01",
            level: 1,
            pallet: "P-01",
        },
        {
            warehouseCode: "WH-DRY-01",
            roomNumber: 1,
            rack: "R-01",
            level: 1,
            pallet: "P-01",
        },
    ];

    for (const locationSeed of locationSeeds) {
        const warehouse = await prisma.warehouse.findUnique({
            where: { code: locationSeed.warehouseCode },
        });

        if (!warehouse) {
            throw new Error(
                `Warehouse not found: ${locationSeed.warehouseCode}`,
            );
        }

        await prisma.location.upsert({
            where: {
                warehouseId_roomNumber_rack_level_pallet: {
                    warehouseId: warehouse.id,
                    roomNumber: locationSeed.roomNumber,
                    rack: locationSeed.rack,
                    level: locationSeed.level,
                    pallet: locationSeed.pallet,
                },
            },
            update: {
                status: "Occupied",
            },
            create: {
                warehouseId: warehouse.id,
                roomNumber: locationSeed.roomNumber,
                rack: locationSeed.rack,
                level: locationSeed.level,
                pallet: locationSeed.pallet,
                status: "Occupied",
            },
        });
    }

    console.log("Locations seeded successfully.");

    // --------------------------------------------------
    // 6. BATCH LOCATIONS
    // --------------------------------------------------

    // Each physical pallet has two slots: A and B.
    // Each allocation below stays within half the pallet's
    // capacity for its product.

    const allocationSeeds = [
        {
            batchNumber: "BAT-20261001-000001",
            warehouseCode: "WH-COLD-01",
            roomNumber: 1,
            rack: "R-01",
            level: 1,
            pallet: "P-01",
            slot: "A" as const,
            allocatedQuantity: 10,
        },
        {
            batchNumber: "BAT-20261001-000001",
            warehouseCode: "WH-COLD-01",
            roomNumber: 1,
            rack: "R-02",
            level: 1,
            pallet: "P-01",
            slot: "B" as const,
            allocatedQuantity: 5,
        },
        {
            batchNumber: "BAT-20261015-000002",
            warehouseCode: "WH-COLD-01",
            roomNumber: 1,
            rack: "R-01",
            level: 1,
            pallet: "P-01",
            slot: "B" as const,
            allocatedQuantity: 12,
        },
        {
            batchNumber: "BAT-20261010-000003",
            warehouseCode: "WH-COLD-01",
            roomNumber: 1,
            rack: "R-01",
            level: 1,
            pallet: "P-02",
            slot: "A" as const,
            allocatedQuantity: 8,
        },
        {
            batchNumber: "BAT-20261012-000004",
            warehouseCode: "WH-COLD-01",
            roomNumber: 1,
            rack: "R-02",
            level: 1,
            pallet: "P-01",
            slot: "A" as const,
            allocatedQuantity: 20,
        },
        {
            batchNumber: "BAT-20261020-000005",
            warehouseCode: "WH-CHILLED-01",
            roomNumber: 1,
            rack: "R-01",
            level: 1,
            pallet: "P-01",
            slot: "A" as const,
            allocatedQuantity: 15,
        },

    ];

    for (const allocation of allocationSeeds) {
        const batch = await prisma.batch.findUnique({
            where: { batchNumber: allocation.batchNumber },
        });

        if (!batch) {
            throw new Error(`Batch not found: ${allocation.batchNumber}`);
        }

        const warehouse = await prisma.warehouse.findUnique({
            where: { code: allocation.warehouseCode },
        });

        if (!warehouse) {
            throw new Error(
                `Warehouse not found: ${allocation.warehouseCode}`,
            );
        }

        const location = await prisma.location.findUnique({
            where: {
                warehouseId_roomNumber_rack_level_pallet: {
                    warehouseId: warehouse.id,
                    roomNumber: allocation.roomNumber,
                    rack: allocation.rack,
                    level: allocation.level,
                    pallet: allocation.pallet,
                },
            },
        });

        if (!location) {
            throw new Error(
                `Location not found: ${allocation.warehouseCode}, ${allocation.pallet}`,
            );
        }

        await prisma.batchLocation.upsert({
            where: {
                locationId_slot: {
                    locationId: location.id,
                    slot: allocation.slot,
                },
            },
            update: {
                batchId: batch.id,
                allocatedQuantity: allocation.allocatedQuantity,
            },
            create: {
                batchId: batch.id,
                locationId: location.id,
                slot: allocation.slot,
                allocatedQuantity: allocation.allocatedQuantity,
            },
        });
    }

    console.log("Batch locations seeded successfully.");

    // --------------------------------------------------
    // 7. STOCK MOVEMENTS
    // --------------------------------------------------

    const movementSeeds = [
        {
            batchNumber: "BAT-20261001-000001",
            movementType: "Incoming" as const,
            fromLocation: null,
            toLocation: {
                warehouseCode: "WH-COLD-01",
                roomNumber: 1,
                rack: "R-01",
                level: 1,
                pallet: "P-01",
            },
            quantity: 15,
            movementDate: new Date("2026-10-05T09:00:00.000Z"),
            performedByEmail: "stockkeeper@example.com",
            remarks: "Initial receipt of frozen chicken breast.",
        },
        {
            batchNumber: "BAT-20261015-000002",
            movementType: "Incoming" as const,
            fromLocation: null,
            toLocation: {
                warehouseCode: "WH-COLD-01",
                roomNumber: 1,
                rack: "R-01",
                level: 1,
                pallet: "P-01",
            },
            quantity: 12,
            movementDate: new Date("2026-10-20T10:00:00.000Z"),
            performedByEmail: "stockkeeper@example.com",
            remarks: "Receipt of a second frozen chicken breast batch.",
        },
        {
            batchNumber: "BAT-20261010-000003",
            movementType: "Incoming" as const,
            fromLocation: null,
            toLocation: {
                warehouseCode: "WH-COLD-01",
                roomNumber: 1,
                rack: "R-01",
                level: 1,
                pallet: "P-02",
            },
            quantity: 10,
            movementDate: new Date("2026-10-12T08:30:00.000Z"),
            performedByEmail: "manager@example.com",
            remarks: "Receipt of frozen whole chicken.",
        },
        {
            batchNumber: "BAT-20261012-000004",
            movementType: "Incoming" as const,
            fromLocation: null,
            toLocation: {
                warehouseCode: "WH-COLD-01",
                roomNumber: 1,
                rack: "R-02",
                level: 1,
                pallet: "P-01",
            },
            quantity: 20,
            movementDate: new Date("2026-10-14T11:00:00.000Z"),
            performedByEmail: "stockkeeper@example.com",
            remarks: "Receipt of frozen vegetables.",
        },
        {
            batchNumber: "BAT-20261020-000005",
            movementType: "Incoming" as const,
            fromLocation: null,
            toLocation: {
                warehouseCode: "WH-CHILLED-01",
                roomNumber: 1,
                rack: "R-01",
                level: 1,
                pallet: "P-01",
            },
            quantity: 15,
            movementDate: new Date("2026-10-22T09:30:00.000Z"),
            performedByEmail: "stockkeeper@example.com",
            remarks: "Receipt of chilled chicken wings.",
        },
        {
            batchNumber: "BAT-20261001-000001",
            movementType: "Relocation" as const,
            fromLocation: {
                warehouseCode: "WH-COLD-01",
                roomNumber: 1,
                rack: "R-01",
                level: 1,
                pallet: "P-01",
            },
            toLocation: {
                warehouseCode: "WH-COLD-01",
                roomNumber: 1,
                rack: "R-02",
                level: 1,
                pallet: "P-01",
            },
            quantity: 5,
            movementDate: new Date("2026-10-25T13:00:00.000Z"),
            performedByEmail: "manager@example.com",
            remarks: "Sample relocation movement for testing.",
        },
        {
            batchNumber: "BAT-20261010-000003",
            movementType: "Outgoing" as const,
            fromLocation: {
                warehouseCode: "WH-COLD-01",
                roomNumber: 1,
                rack: "R-01",
                level: 1,
                pallet: "P-02",
            },
            toLocation: null,
            quantity: 2,
            movementDate: new Date("2026-10-26T14:00:00.000Z"),
            performedByEmail: "stockkeeper@example.com",
            remarks: "Sample outgoing movement for testing.",
        },
    ];

    for (const movement of movementSeeds) {
        const batch = await prisma.batch.findUnique({
            where: { batchNumber: movement.batchNumber },
        });

        if (!batch) {
            throw new Error(`Batch not found: ${movement.batchNumber}`);
        }

        const user = await prisma.user.findUnique({
            where: { email: movement.performedByEmail },
        });

        if (!user) {
            throw new Error(
                `User not found: ${movement.performedByEmail}`,
            );
        }

        async function findLocation(
            locationData:
                | {
                    warehouseCode: string;
                    roomNumber: number;
                    rack: string;
                    level: number;
                    pallet: string;
                }
                | null,
        ) {
            if (!locationData) {
                return null;
            }

            const warehouse = await prisma.warehouse.findUnique({
                where: { code: locationData.warehouseCode },
            });

            if (!warehouse) {
                throw new Error(
                    `Warehouse not found: ${locationData.warehouseCode}`,
                );
            }

            const location = await prisma.location.findUnique({
                where: {
                    warehouseId_roomNumber_rack_level_pallet: {
                        warehouseId: warehouse.id,
                        roomNumber: locationData.roomNumber,
                        rack: locationData.rack,
                        level: locationData.level,
                        pallet: locationData.pallet,
                    },
                },
            });

            if (!location) {
                throw new Error(
                    `Location not found: ${locationData.warehouseCode}, ${locationData.pallet}`,
                );
            }

            return location;
        }

        const fromLocation = await findLocation(movement.fromLocation);
        const toLocation = await findLocation(movement.toLocation);

        // StockMovement has no natural unique key, so check whether
        // this exact seed movement already exists before creating it.
        const existingMovement = await prisma.stockMovement.findFirst({
            where: {
                batchId: batch.id,
                movementType: movement.movementType,
                fromLocationId: fromLocation?.id ?? null,
                toLocationId: toLocation?.id ?? null,
                quantity: movement.quantity,
                movementDate: movement.movementDate,
                performedBy: user.id,
            },
        });

        if (!existingMovement) {
            await prisma.stockMovement.create({
                data: {
                    batchId: batch.id,
                    movementType: movement.movementType,
                    fromLocationId: fromLocation?.id ?? null,
                    toLocationId: toLocation?.id ?? null,
                    quantity: movement.quantity,
                    movementDate: movement.movementDate,
                    performedBy: user.id,
                    remarks: movement.remarks,
                },
            });
        }
    }

    console.log("Stock movements seeded successfully.");

    console.log("\nDatabase seeding completed successfully.");
}

main()
    .catch((error) => {
        console.error("Seeding failed:", error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });