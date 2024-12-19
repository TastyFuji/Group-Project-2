// CustomId.js
async function getNextCustomId(collectionName, prisma) {
  try {
    if (!collectionName || typeof collectionName !== "string") {
      throw new Error("Invalid collection name.");
    }

    const updatedCounter = await prisma.counter.upsert({
      where: { name: collectionName },
      update: { sequence: { increment: 1 } },
      create: { name: collectionName, sequence: 1 },
    });

    if (!updatedCounter || typeof updatedCounter.sequence !== "number") {
      throw new Error("Failed to retrieve sequence.");
    }

    return updatedCounter.sequence;
  } catch (error) {
    console.error("Error getting next customId:", error.message);
    throw new Error("Failed to generate customId.");
  }
}

module.exports = getNextCustomId;
