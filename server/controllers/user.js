const { message } = require("statuses");
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

    // ตรวจสอบว่ามีตะกร้าสินค้าหรือไม่
    if (!cart || !cart.products || cart.products.length === 0) {
      return res.status(404).json({ message: "Your cart is empty!" });
    }

    res.json({
      products: cart.products,
      cartTotal: cart.cartTotal,
    });
  } catch (error) {
    console.error("Error fetching user cart:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.emptyCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: req.user.id,
      },
    });

    if (!cart) {
      return res.status(400).json({ message: "No cart" });
    }

    await prisma.productOnCart.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    const result = await prisma.cart.deleteMany({
      where: { orderedById: req.user.id },
    });

    console.log(result);
    res.json({ message: "Cart empty success!", deletedCount: result.count });
  } catch (error) {
    console.error("Error emptying user cart:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.saveAddress = async (req, res) => {
  try {
    const { address } = req.body;

    console.log(address);
    const addressUser = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        address: address,
      },
    });
    res.json({ ok: true, message: "Update success" });
  } catch (error) {
    console.error("Error saveAddress:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.saveOrder = async (req, res) => {
  try {
    //step 1 get user cart
    const userCart = await prisma.cart.findFirst({
      where: { orderedById: req.user.id },
      include: {
        products: true,
      },
    });
    //check empty
    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({ ok: false, message: "Cart is empty!" });
    }

    //check quantity
    for (const item of userCart.products) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { quantity: true, title: true },
      });
      console.log(item);
      console.log(product);
      if (!product || item.count > product.quantity) {
        return res.status(400).json({
          ok: false,
          message: `ขออภัย. สินค้า ${product?.title || "product"} ไม่พอต่อความต้องการ.`,
        });
      }
    }

    //create a new Order
    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: { id: req.user.id, email: req.user.email },
        },
        cartTotal: userCart.cartTotal,
      },
    });

    //update product
    const update = userCart.products.map((item) => ({
      where: { id: item.productId },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }));
    console.log(update);

    await Promise.all(update.map((updated) => prisma.product.update(updated)));
    await prisma.cart.deleteMany({
      where: { orderedById: req.user.id },
    });

    res.json({ ok: true, order });
  } catch (error) {
    console.error("Error saveOrder:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
exports.getOrder = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { orderedById: req.user.id },
      include: {
        products: {
          include: { product: true },
        },
      },
    });
    if (orders.length === 0) {
      return res.status(400).json({ ok: false, message: "No orders" });
    }
    //console.log(orders);
    res.json({ ok: true, orders });
  } catch (error) {
    console.error("Error getOrder:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
