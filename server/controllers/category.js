const prisma = require("../config/prisma");
const getNextCustomId = require("../Other/CustomId");

exports.create = async (req, res) => {
  try {
    const customId = await getNextCustomId("Category", prisma);
    const { name } = req.body;
    const category = await prisma.category.create({
      data: {
        customId: customId,
        name: name,
      },
    });

    res.send(category);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.list = async (req, res) => {
  try {
    const category = await prisma.category.findMany();

    res.send(category);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.remove = async (req, res) => {
  try {
    const { customId } = req.params;

    if (!customId) {
      return res.status(400).json({ message: "customId is required!" });
    }

    const parsedCustomId = parseInt(customId, 10);
    if (isNaN(parsedCustomId)) {
      return res.status(400).json({ message: "Invalid customId provided!" });
    }

    // ลบ Category
    const category = await prisma.category.delete({
      where: { customId: parsedCustomId },
    });

    res
      .status(200)
      .json({ message: "Category deleted successfully!", category });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
