const express = require("express");
const {
  registerUser,
  login,
  profile,
  updateProfile,
} = require("./controllers/users");
const {
  productsList,
  productDetails,
  registerProduct,
  updateProduct,
  deleteProduct,
} = require("./controllers/products");
const { getStoreProducts } = require("./controllers/stores");
const verifyLogin = require("./filter/login");

const router = express();

// Visit stores
router.get("/stores/:storeName", getStoreProducts);

// users
router.post("/register", registerUser);
router.post("/login", login);

router.use(verifyLogin);

router.get("/profile", profile);
router.put("/profile/edit", updateProfile);

// products
router.get("/products", productsList);
router.get("/products/:id", productDetails);
router.post("/products", registerProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

module.exports = router;
