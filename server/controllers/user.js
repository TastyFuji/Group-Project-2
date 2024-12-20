const prisma = require("../config/prisma");

// แสดงรายการผู้ใช้
exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        address: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// เปลี่ยนสถานะผู้ใช้
exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;

    if (!id) {
      return res.status(400).json({ message: "User ID is required!" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { enabled: Boolean(enabled) },
    });

    res.status(200).json({ message: "Update Status Success", user });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// เปลี่ยนบทบาทผู้ใช้
exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;

    if (!id || !role) {
      return res.status(400).json({ message: "ID and role are required!" });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    res.status(200).json({ message: "Update Role Success", user });
  } catch (error) {
    console.error("Error updating role:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// สร้างตะกร้าสินค้าใหม่
exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body;
    const userEmail = req.user.email;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty!" });
    }

    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ลบตะกร้าเก่า
    await prisma.productOnCart.deleteMany({
      where: { cart: { orderedById: user.id } },
    });

    await prisma.cart.deleteMany({
      where: { orderedById: user.id },
    });

    // เตรียมข้อมูลสินค้า
    const products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));

    const cartTotal = products.reduce(
      (sum, item) => sum + item.price * item.count,
      0,
    );

    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products,
        },
        cartTotal,
        orderedById: user.id,
      },
    });
    console.log(newCart);
    res.status(201).json({
      message: "Cart created successfully!",
      newCart,
    });
  } catch (err) {
    console.error("Error creating user cart:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ฟังก์ชันว่างสำหรับการทดสอบ
exports.getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: req.user.id,
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(cart);
    res.send(cart);
  } catch (error) {
    console.error("Error creating user cart:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.emptyCart = async (req, res) => res.send("Hello EmptyCart");
exports.saveAddress = async (req, res) => res.send("Hello SaveAddress");
exports.saveOrder = async (req, res) => res.send("Hello SaveOrder");
exports.getOrder = async (req, res) => res.send("Hello GetOrder");
