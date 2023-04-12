const router = require('express').Router();
const Stock = require('../models/Stock.model');
const Peso = require('../models/Peso.model');

router.get('/', async (req, res, next) => {
  try {
    const response = await Stock.find();
    res.status(200).json({ ok: true, stocks: response });
  } catch (err) {
    console.log('ERROR -> ', err);
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
    const response = await Stock.find({
      $and: [
        { venta: { $exists: true, $ne: {} } },
        {
          $or: [
            { reposicion: { $exists: false } },
            { reposicion: { $eq: null } },
          ],
        },
      ],
    });

    console.log({ stockReposicion: response });
    res.status(200).json({ ok: true, stockReposicion: response });
  } catch (err) {
    console.log('ERROR -> ', err.message);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.get('/stockVenta', async (req, res, next) => {
  try {
    const response = await Stock.find({
      $or: [{ venta: { $exists: false } }, { venta: { $eq: {} } }],
    });

    res.status(200).json({ ok: true, stockVenta: response });
  } catch (err) {
    console.log('ERROR -> ', err.message);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.get('/details/:id', async (req, res, next) => {
  console.log('HOWDYYYYY - ', req.params.id);
  try {
    const response = await Stock.findById(req.params.id)
      .populate({
        path: 'pesos',
        options: { sort: { fecha: 1, createdAt: 1 } },
        select: ['peso', 'fecha'],
      })
      .populate('reposicion')
      .populate('compra.peso')
      .populate('venta.peso');

    console.log({ response });
    if (!response) throw new Error('Invalid Stock ID Provided');

    res.status(200).json({ ok: true, stockDetails: response });
  } catch (err) {
    console.log('ERROR -> ', err.message);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = req.body;
    const stockNro =
      (await Stock.findOne({ stockNro: data.nroStock })) || false;

    if (stockNro) throw new Error('Nro de Stock ya existe!');

    const peso = await Peso.create({
      fecha: new Date(data.fecha.replace(/-/g, '/').replace(/T.+/, '')),
      tipo: 'compra',
      peso: data.pesoEntrada,
      unidad: 'kg',
    });

    const stock = await Stock.create({
      stockNro: data.nroStock,
      loteNro: data.nroLote,
      compra: {
        fecha: new Date(data.fecha.replace(/-/g, '/').replace(/T.+/, '')),
        peso: peso._id,
        precio: data.precio,
      },
      venta: {},
      pesos: [peso._id],
      reposicion: null,
    });

    if (data.stockReposicion) {
      const updatedStock = await Stock.findByIdAndUpdate(
        data.stockReposicion,
        {
          reposicion: stock._id,
        },
        { new: true }
      );
    }

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

router.post('/venta', async (req, res, next) => {
  try {
    const data = req.body;

    const peso = await Peso.create({
      fecha: new Date(
        req.body.fechaVenta.replace(/-/g, '/').replace(/T.+/, '')
      ),
      tipo: 'venta',
      peso: req.body.pesoSalida,
      unidad: 'kg',
    });

    const stock = await Stock.findByIdAndUpdate(
      data.nroStock,
      {
        venta: {
          fecha: new Date(
            data.fechaVenta.replace(/-/g, '/').replace(/T.+/, '')
          ),
          precio: data.precio,
          peso: peso._id,
        },
        $push: { pesos: peso._id },
      },
      { new: true }
    );

    const updatedPeso = await Peso.findByIdAndUpdate(
      peso._id,
      { stock: stock._id },
      { new: true }
    );

    res.status(200).json({ ok: true, stock, updatedPeso });
  } catch (err) {
    console.log('ERROR -> ', err.message);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.post('/peso', async (req, res, next) => {
  try {
    data = req.body;
    const response = await Peso.create({
      fecha: new Date(data.fecha.replace(/-/g, '/').replace(/T.+/, '')),
      peso: data.peso,
      stock: data.nroStock,
      tipo: 'control',
      unidad: 'kg',
    });

    const updatedStock = await Stock.findByIdAndUpdate(
      data.nroStock,
      {
        $push: { pesos: response._id },
      },
      { new: true }
    );

    console.log({ updatedStock });

    res.status(200).json({ ok: true, response });
  } catch (err) {
    console.log('ERROR -> ', err.message);
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

    setTimeout(() => {
      res.status(200).json({ ok: true });
    }, 200);
  } catch (err) {
    console.log('ERROR -> ', err);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

module.exports = router;
