const express = require("express");
const router = express.Router();

//controllers
const {
  create,
  list,
  read,
  remove,
  listby,
  searchFilters,
  update,
} = require("../controllers/product");

//Endpoint
router.post("/product", create); //create
router.get("/products/:count", list); //list
router.get("/product/:customId", read); //read
router.put("/product/:customId", update); //update
router.delete("/product/:customId", remove); //remove
router.post("/productby", listby); //listby
router.post("/search/filters", searchFilters); //searchFilters

//export
module.exports = router;
