const prisma = require("../config/prisma");

// สร้าง Category
exports.create = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Category name is required!" });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
      },
    });

    res.status(201).json(category);
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ดึงข้อมูล Category ทั้งหมด
exports.list = async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ลบ Category ตาม id
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({ message: "Invalid ID provided!" });
    }

    const deletedCategory = await prisma.category.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Category deleted successfully!",
      deletedCategory,
    });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
