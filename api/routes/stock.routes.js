const router = require('express').Router();
const Stock = require('../models/Stock.model');
const Peso = require('../models/Peso.model');
const exportToExcel = require('../utils/exportToExcel');

router.get('/', async (req, res, next) => {
  try {
    const theList = await Stock.find();
    res.status(200).json({ ok: true, stocks: theList });
  } catch (err) {
    console.log('ERROR -> ', err);
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

router.get('/loteNros', async (req, res, next) => {
  try {
    const response = await Stock.distinct('loteNro');

    console.log({ response });
    if (response) res.json({ ok: true, loteNros: response });
  } catch (err) {
    console.log('ERROR -> ', err);
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
      .populate('compra.reposicion')
      .populate('compra.peso')
      .populate('venta.peso')
      .populate('venta.reposicion');

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
    console.log({ data });
    const serialNro =
      data.nroStock.toString().trim() + '-' + data.nroLote.toString().trim();
    const isSerial = (await Stock.findOne({ serialNro: serialNro })) || false;

    if (isSerial) throw new Error('Nro de Serial ya existe!');

    if (!data.nroStock || !data.nroLote || !data.fecha || !+data.precio)
      throw new Error('Campos Invalidos');

    const newStock = await Stock.create({
      serialNro: serialNro,
      stockNro: data?.nroStock?.toString(),
      loteNro: data?.nroLote?.toString(),
      compra: {
        fecha: new Date(data.fecha.replace(/-/g, '/').replace(/T.+/, '')),
        peso: null,
        precio: data.precio,
        reposicion: !!data.stockReposicion ? data.stockReposicion : null,
      },
      venta: {},
      pesos: [],
    });

    const newPeso = await Peso.create({
      fecha: new Date(data.fecha.replace(/-/g, '/').replace(/T.+/, '')),
      stock: newStock._id,
      tipo: 'compra',
      peso: data.pesoEntrada,
      unidad: 'kg',
    });

    const assignPesoToStock = await Stock.findByIdAndUpdate(newStock._id, {
      $push: { pesos: newPeso._id },
      $set: { 'compra.peso': newPeso._id },
    });

    if (data.stockReposicion) {
      const setReposicionVenta = await Stock.findByIdAndUpdate(
        data.stockReposicion,
        {
          $set: { 'venta.reposicion': newStock._id },
        },
        { new: true }
      );
    }

    res.status(200).json({ ok: true, newPeso, newStock });
  } catch (err) {
    console.log('ERROR -> ', err);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.post('/venta', async (req, res, next) => {
  try {
    const data = req.body;

    const newPeso = await Peso.create({
      fecha: new Date(
        req.body.fechaVenta.replace(/-/g, '/').replace(/T.+/, '')
      ),
      stock: data.nroStock,
      tipo: 'venta',
      peso: req.body.pesoSalida,
      unidad: 'kg',
    });

    const updatedStock = await Stock.findByIdAndUpdate(
      data.nroStock,
      {
        venta: {
          fecha: new Date(
            data.fechaVenta.replace(/-/g, '/').replace(/T.+/, '')
          ),
          precio: data.precio,
          peso: newPeso._id,
        },
        $push: { pesos: newPeso._id },
      },
      { new: true }
    );

    res.status(200).json({ ok: true, updatedStock, newPeso });
  } catch (err) {
    console.log('ERROR -> ', err.message);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.post('/peso', async (req, res, next) => {
  try {
    data = req.body;
    const newPeso = await Peso.create({
      fecha: new Date(data.fecha.replace(/-/g, '/').replace(/T.+/, '')),
      stock: data.nroStock,
      peso: data.peso,
      tipo: 'control',
      unidad: 'kg',
    });

    const addPesoToStock = await Stock.findByIdAndUpdate(
      data.nroStock,
      {
        $push: { pesos: newPeso._id },
      },
      { new: true }
    );

    res.status(200).json({ ok: true, newPeso });
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

    setTimeout(() => {
      res.status(200).json({ ok: true });
    }, 200);
  } catch (err) {
    console.log('ERROR -> ', err);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.post('/export', async (req, res, next) => {
  console.log('EXPORTING FROM API');
  try {
    const data = req.body.data;

    exportToExcel(data);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.log('ERROR -> ', err);
    res.status(200).json({ ok: false, errorMsg: err.message });
  }
});

router.get('/export', async (req, res, next) => {
  try {
    res.download('./data/finca_puricaure.xlsx');
  } catch (err) {
    console.log('ERROR -> ', err.message);
  }
});

module.exports = router;
