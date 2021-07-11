const conection = require("../conection");
const {
  productErrors,
  verifyIfIdIsNumber,
  validatingDataType,
} = require("../utils/fieldsValidation");


async function productsList(req, res) {
  const { category: categoryFilter, minPrice, maxPrice } = req.query;

  try {
    let query =
      "select * from products where user_id = $1 and category ilike $2 || '%' and price >= $3";
    let values = [req.user.id, categoryFilter ?? "", minPrice || 0];

    if (maxPrice) {
      query = query + " and price <= $4";
      values.push(maxPrice);
    }

    const { rows: products, rowCount: wereProductsFound } =
      await conection.query(query, values);

    if (!wereProductsFound) {
      return res
        .status(400)
        .json({ error: "Você ainda não tem produtos adicionados." });
    }

    return res.status(200).json(products);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function productDetails(req, res) {
  const { id: productId } = req.params;

  verifyIfIdIsNumber(productId, res);

  try {
    const query = "select * from products where id = $1";

    const { rows: productsArray, rowCount: wasTheProductFound } =
      await conection.query(query, [productId]);

    if (!wasTheProductFound) {
      return res
        .status(400)
        .json({ error: "Por favor, tente um id do produto diferente." });
    }

    return res.status(200).json(productsArray[0]);
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function registerProduct(req, res) {
  const { name, stock, category, price, description, image } = req.body;

  const errorMandatory = productErrors(req.body);
  if (errorMandatory) {
    return res
      .status(400)
      .json({ error: `O campo ${errorMandatory} é obrigatório.` });
  }

  validatingDataType(req.body, res);

  try {
    let query =
      " insert into products (user_id, name, stock, price, description, image) values ($1, $2, $3, $4, $5, $6)";
    let values = [req.user.id, name, stock, price, description, image];

    if (category) {
      query =
        " insert into products (user_id, name, stock, price, description, image, category) values ($1, $2, $3, $4, $5, $6, $7)";
      values = [req.user.id, name, stock, price, description, image, category];
    }

    const { rowCount: registration } = await conection.query(query, values);

    if (!registration) {
      return res
        .status(400)
        .json({ error: "Desculpe, não foi possível registrar o produto." });
    }

    return res.status(200).json("Oba! Seu produto foi cadastrado foi sucesso.");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

async function updateProduct(req, res) {
  const { id: productId } = req.params;
  const { id: userId } = req.user;
  const {
    name: newName,
    stock: newStock,
    category: newCategory,
    price: newPrice,
    description: newDescription,
    image: newImage,
  } = req.body;

  verifyIfIdIsNumber(productId, res);

  validatingDataType(req.body, res);

  try {
    const query = "select * from products where id = $1";
    const { rows, rowCount: wasTheProductFound } = await conection.query(
      query,
      [productId]
    );

    if (!wasTheProductFound) {
      return res
        .status(400)
        .json({ error: "Por favor, tente outro id de produto." });
    }
    const {
      user_id: userIdFromProduct,
      name,
      stock,
      category,
      price,
      description,
      image,
    } = rows[0];

    if (userIdFromProduct !== userId) {
      return res
        .status(400)
        .json({ error: "Desculpe, você não pode editar esse produto." });
    }

    const updatedName = newName ?? name;
    const updatedStock = newStock ?? stock;
    const updatedCategory = newCategory ?? category;
    const updatedPrice = newPrice ?? price;
    const updatedDescription = newDescription ?? description;
    const updatedImage = newImage ?? image;

    const queryUpdatedProduct =
      "update products set name = $1, stock = $2, category = $3, price = $4, description = $5, image = $6 where id = $7";
    const values = [
      updatedName,
      updatedStock,
      updatedCategory,
      updatedPrice,
      updatedDescription,
      updatedImage,
      productId,
    ];

    const { rowCount: wasProductUpdated } = await conection.query(
      queryUpdatedProduct,
      values
    );
    if (!wasProductUpdated) {
      return res
        .status(400)
        .json({ error: "Desculpe, não foi possível atualizar o produto." });
    }

    return res.status(200).json("O produto foi atualizado com sucesso!");
  } catch (error) {
    return res.status(400).json(error.message);
  }
}

async function deleteProduct(req, res) {
  const { id: productId } = req.params;
  const { id: userId } = req.user;

  verifyIfIdIsNumber(productId, res);

  try {
    const query = "select user_id from products where id = $1";

    const { rows: user, rowCount: wasTheProductFound } = await conection.query(
      query,
      [productId]
    );

    if (!wasTheProductFound) {
      return res.status(400).json({ error: "Tente outro id de produto." });
    }

    const { user_id: userIdFromProduct } = user[0];

    if (userIdFromProduct !== userId) {
      return res
        .status(400)
        .json({ error: "Desculpe, você não pode deletar esse produto." });
    }

    const deleteQuery = "delete from products where id = $1";
    const { rowCount: productDeleted } = await conection.query(deleteQuery, [
      productId,
    ]);

    if (!productDeleted) {
      return res
        .status(500)
        .json({ error: "Algo deu errado. Por favor tente novamente." });
    }

    return res.status(200).json("O produto foi deletado com sucesso.");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

module.exports = {
  productsList,
  productDetails,
  registerProduct,
  updateProduct,
  deleteProduct,
};
