-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('Admin', 'WarehouseManager', 'StockKeeper');

-- CreateEnum
CREATE TYPE "WarehouseType" AS ENUM ('Cold', 'Chilled', 'Dry');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('Incoming', 'Relocation', 'Outgoing');

-- CreateEnum
CREATE TYPE "LocationStatus" AS ENUM ('Empty', 'Occupied', 'Maintenance');

-- CreateEnum
CREATE TYPE "PalletSlot" AS ENUM ('A', 'B');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WarehouseType" NOT NULL,
    "address" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "quantity_per_box" INTEGER NOT NULL,
    "unit_mass" DECIMAL(65,30),
    "boxes_per_pallet" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "batch_number" TEXT NOT NULL,
    "description" TEXT,
    "production_date" DATE NOT NULL,
    "expiry_date" DATE NOT NULL,
    "arrival_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" UUID NOT NULL,
    "warehouse_id" UUID NOT NULL,
    "room_number" INTEGER NOT NULL,
    "rack" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "pallet" TEXT NOT NULL,
    "status" "LocationStatus" NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchLocation" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "location_id" UUID NOT NULL,
    "slot" "PalletSlot" NOT NULL,
    "allocated_quantity" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" UUID NOT NULL,
    "batch_id" UUID NOT NULL,
    "from_location_id" UUID,
    "to_location_id" UUID,
    "quantity" INTEGER NOT NULL,
    "movement_type" "MovementType" NOT NULL,
    "movement_date" TIMESTAMP(3) NOT NULL,
    "performed_by" UUID NOT NULL,
    "remarks" TEXT,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batch_number_key" ON "Batch"("batch_number");

-- CreateIndex
CREATE UNIQUE INDEX "Location_warehouse_id_room_number_rack_level_pallet_key" ON "Location"("warehouse_id", "room_number", "rack", "level", "pallet");

-- CreateIndex
CREATE UNIQUE INDEX "BatchLocation_location_id_slot_key" ON "BatchLocation"("location_id", "slot");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_warehouse_id_fkey" FOREIGN KEY ("warehouse_id") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchLocation" ADD CONSTRAINT "BatchLocation_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchLocation" ADD CONSTRAINT "BatchLocation_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Product"
  ADD CONSTRAINT "Product_quantity_per_box_positive"
  CHECK ("quantity_per_box" > 0),
  ADD CONSTRAINT "Product_boxes_per_pallet_positive"
  CHECK ("boxes_per_pallet" > 0),
  ADD CONSTRAINT "Product_unit_mass_positive"
  CHECK ("unit_mass" IS NULL OR "unit_mass" > 0);

ALTER TABLE "Batch"
  ADD CONSTRAINT "Batch_expiry_on_or_after_production"
  CHECK ("expiry_date" >= "production_date"),
  ADD CONSTRAINT "Batch_arrival_on_or_after_production"
  CHECK ("arrival_date" >= "production_date");

ALTER TABLE "Location"
  ADD CONSTRAINT "Location_room_number_positive"
  CHECK ("room_number" > 0),
  ADD CONSTRAINT "Location_level_positive"
  CHECK ("level" > 0);

ALTER TABLE "BatchLocation"
  ADD CONSTRAINT "BatchLocation_allocated_quantity_positive"
  CHECK ("allocated_quantity" > 0);

ALTER TABLE "StockMovement"
  ADD CONSTRAINT "StockMovement_quantity_positive"
  CHECK ("quantity" > 0);