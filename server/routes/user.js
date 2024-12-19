const express = require("express");
const router = express.Router();
const { listUsers } = require("../controllers/user");

router.get("/users", listUsers);
router.post("/change-status");
router.post("/change-role");
router.post("/user/cart");
router.get("/user/cart");
router.delete("/user/cart");
router.post("/user/address");
router.post("/user/order");
router.get("/user/order");

module.exports = router;
