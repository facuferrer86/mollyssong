-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "prompt" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryImage" (
    "id" SERIAL NOT NULL,
    "characterId" TEXT NOT NULL,
    "u" TEXT NOT NULL,
    "l" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zone" (
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "w" DOUBLE PRECISION NOT NULL,
    "h" DOUBLE PRECISION NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Zone_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Beat" (
    "id" TEXT NOT NULL,
    "act" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "meta" TEXT NOT NULL,
    "links" JSONB NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Beat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeatPosition" (
    "id" SERIAL NOT NULL,
    "beatId" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "zoneKey" TEXT NOT NULL,
    "s" TEXT NOT NULL,

    CONSTRAINT "BeatPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zoneKey" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "pk" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lighting" TEXT NOT NULL,
    "sounds" TEXT NOT NULL,
    "ambient" TEXT NOT NULL,
    "furniture" TEXT NOT NULL,
    "map" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("pk")
);

-- CreateTable
CREATE TABLE "RoomImage" (
    "id" TEXT NOT NULL,
    "roomPk" TEXT NOT NULL,
    "u" TEXT NOT NULL,
    "l" TEXT NOT NULL,
    "cam" JSONB,
    "base" BOOLEAN NOT NULL DEFAULT false,
    "remote" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "RoomImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "act" TEXT NOT NULL,
    "actKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GalleryImage_characterId_idx" ON "GalleryImage"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "BeatPosition_beatId_characterId_key" ON "BeatPosition"("beatId", "characterId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_locationId_id_key" ON "Room"("locationId", "id");

-- CreateIndex
CREATE INDEX "RoomImage_roomPk_idx" ON "RoomImage"("roomPk");

-- CreateIndex
CREATE UNIQUE INDEX "Scene_actKey_slug_key" ON "Scene"("actKey", "slug");

-- AddForeignKey
ALTER TABLE "GalleryImage" ADD CONSTRAINT "GalleryImage_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeatPosition" ADD CONSTRAINT "BeatPosition_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeatPosition" ADD CONSTRAINT "BeatPosition_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomImage" ADD CONSTRAINT "RoomImage_roomPk_fkey" FOREIGN KEY ("roomPk") REFERENCES "Room"("pk") ON DELETE CASCADE ON UPDATE CASCADE;
