const conection = require("../conection");

async function getStoreProducts(req, res) {
  const { storeName } = req.params;

  try {
    const query =
      "select a.store_name, b.id, b.name, b.stock, b.category, b.price, b.description, b.image from users a join products b on a.id = b.user_id where store_name ILIKE '%' || $1 || '%'";
    const { rows: products, rowCount: wereProductsFound } =
      await conection.query(query, [storeName]);

    if (!wereProductsFound) {
      return res
        .status(400)
        .json({ error: "Não encontramos nenhuma loja com esse nome." });
    }

    return res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = { getStoreProducts };
