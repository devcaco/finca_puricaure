const router = require('express').Router();
const Stock = require('../models/Stock.model');
const Peso = require('../models/Peso.model');

router.get('/', async (req, res, next) => {
  try {
    const response = await Stock.find().populate('compra.peso', 'peso');
    res.status(200).json({ ok: true, stocks: response });
  } catch (err) {
    console.log('ERROR -> ', err.message);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.get('/nro', async (req, res, next) => {
  try {
    const response = await Stock.findOne().sort({ stockNro: -1 });
    const stockNro =
      response && response.stockNro ? response.stockNro + 1 : 1001;

    res.status(200).json({ ok: true, stockNro });
  } catch (err) {
    console.log('ERROR - > ', err.message);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.get('/stockReposicion', async (req, res, next) => {
  try {
    const response = await Stock.find();

    res.status(200).json({ ok: true, stockReposicion: response });
  } catch (err) {
    console.log('ERROR -> ', err.message);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.post('/', async (req, res, next) => {
  try {
    const stockNro =
      (await Stock.findOne({ stockNro: req.body.nroStock })) || false;

    if (stockNro) throw new Error('Nro de Stock ya existe!');

    const peso = await Peso.create({
      fecha: new Date(req.body.fecha),
      tipo: 'compra',
      peso: req.body.pesoEntrada,
      unidad: 'kg',
    });

    const stock = await Stock.create({
      stockNro: req.body.nroStock,
      compra: {
        fecha: new Date(req.body.fecha),
        peso: peso._id,
        precio: req.body.precio,
      },
      venta: {},
      pesos: [peso._id],
    });

    const updatePeso = await Peso.findByIdAndUpdate(
      peso._id,
      { stock: stock._id },
      { new: true }
    );

    res.status(200).json({ ok: true, peso, stock });
  } catch (err) {
    console.log('ERROR -> ', err);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.delete('/', async (req, res, next) => {
  try {
    const data = req.body;

    data.forEach(async (stock) => {
      await Peso.deleteMany({ stock: stock });
      await Stock.findByIdAndDelete(stock);
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.log('ERROR -> ', err);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

module.exports = router;
