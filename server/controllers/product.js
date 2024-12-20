const prisma = require("../config/prisma");

exports.create = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      quantity,
      categoryId,
      images = [], // ตั้งค่าเริ่มต้นให้ images เป็น array ว่าง
    } = req.body;

    // ตรวจสอบค่า images ถ้าเป็นค่าว่าง ให้ใส่ข้อมูลแบบไม่ส่งไปยัง Prisma
    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: categoryId,
        ...(images.length > 0 && {
          images: {
            create: images.map((item) => ({
              asset_id: item.asset_id,
              public_id: item.public_id,
              url: item.url,
              secure_url: item.secure_url,
            })),
          },
        }),
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.list = async (req, res) => {
  try {
    const { count } = req.params;
    const products = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: true,
      },
    });

    //console.log(products);

    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.read = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found!" });
    }

    res.status(200).json(product);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      quantity,
      categoryId,
      images = [],
    } = req.body;

    await prisma.image.deleteMany({
      where: { productId: id },
    });

    const product = await prisma.product.update({
      where: { id },
      data: {
        title,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: categoryId || null,
        ...(images.length > 0 && {
          images: {
            create: images.map((item) => ({
              asset_id: item.asset_id,
              public_id: item.public_id,
              url: item.url,
              secure_url: item.secure_url,
            })),
          },
        }),
      },
      include: {
        images: true,
      },
    });

    res.status(200).json({ message: "Product updated successfully!", product });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id },
    });

    res.send("Delete success!");
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.listby = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;
    const products = await prisma.product.findMany({
      take: limit,
      orderBy: { [sort]: order },
      include: { category: true },
    });
    console.log(sort, order, limit);
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const handleQuery = async (req, res, query) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.send(products);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Search Error" });
  }
};
const handleCategory = async (categoryIds) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryIds, // ส่งค่าเป็น array เช่น [1, 2]
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    return products; // เพิ่มการคืนค่า
  } catch (error) {
    console.log("Error finding categories:", error);
    throw new Error("Search Error");
  }
};

const handlePrice = async (priceRange) => {
  if (!Array.isArray(priceRange) || priceRange.length !== 2) {
    throw new Error("Invalid price range format.");
  }

  const products = await prisma.product.findMany({
    where: {
      price: {
        gte: priceRange[0],
        lte: priceRange[1],
      },
    },
    include: {
      category: true,
      images: true,
    },
  });

  return products;
};

exports.searchFilters = async (req, res) => {
  try {
    const { query, category, price } = req.body;

    let products = [];

    if (query) {
      console.log("Searching by query:", query);
      const queryProducts = await handleQuery(query);
      products = queryProducts;
    }

    if (category) {
      console.log("Filtering by category:", category);
      const categoryProducts = await handleCategory(category);
      console.log("Category Products Found:", categoryProducts);

      products = products.length
        ? products.filter((p) => categoryProducts.some((cp) => cp.id === p.id))
        : categoryProducts;
    }

    if (price) {
      console.log("Filtering by price range:", price);
      const priceProducts = await handlePrice(price);
      products = products.length
        ? products.filter((product) =>
            priceProducts.some((priceProd) => priceProd.id === product.id),
          )
        : priceProducts;
    }

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found!" });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
