function userErrors({ name, email, password, store_name }) {
  if (!name) return "'nome'";
  if (!store_name) return "'nome da loja'";
  if (!email) return "'email'";
  if (!password) return "'senha'";
}

function productErrors({ name, stock, price, description, image }) {
  if (!name) return "nome";

  if (!stock) return "estoque";

  if (!price) return "preço";

  if (!description) return "descrição";

  if (!image) return "imagem";
}

function validatingDataType({ name, price, stock }, res) {
  if (!isNaN(name))
    return res.status(400).json(`O campo nome não deve conter apenas números.`);

  if (price && isNaN(price))
    return res.status(400).json(`O campo 'preço' deve ser um número.`);

  if (stock && isNaN(stock))
    return res.status(400).json(`O campo 'estoque' deve ser um número.`);
}

function verifyIfIdIsNumber(id, res) {
  if (isNaN(id)) {
    return res.status(400).json("O id deve ser um número.");
  }
}

module.exports = {
  userErrors,
  productErrors,
  verifyIfIdIsNumber,
  validatingDataType,
};
