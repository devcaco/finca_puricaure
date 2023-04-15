const Peso = require('./Peso.model');

const { Schema, model } = require('mongoose');

// const compraSchema = new Schema({
//   fecha: Date,
//   peso: { type: Schema.Types.ObjectId, ref: 'Peso' },
//   precio: Number,
// });

// const ventaSchema = new Schema({
//   fecha: Date,
//   peso: { type: Schema.Types.ObjectId, ref: 'Peso' },
//   precio: Number,
// });

const stockSchema = new Schema(
  {
    stockNro: {
      type: String,
      required: [true, 'Nro de Referencia es requerido'],
      unique: true,
    },
    loteNro: {
      type: String,
      required: true,
      unique: false,
    },
    pesos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Peso',
      },
    ],
    compra: {
      fecha: Date,
      precio: Number,
      peso: { type: Schema.Types.ObjectId, ref: 'Peso' },
      precio_total: {
        type: Number,
        default: 0,
        get: async function () {
          await this.compra.populate('peso');
          if (this.compra.peso) {
            return this.compra.precio * this.compra.peso.peso;
          } else {
            return;
          }
        },
      },
    },
    // compra: { type: compraSchema, required: false },
    venta: {
      fecha: Date,
      precio: Number,
      peso: { type: Schema.Types.ObjectId, ref: 'Peso' },
    },
    // venta: { type: ventaSchema, required: false },
    reposicion: { type: Schema.Types.ObjectId, ref: 'Stock' },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
  }
);

// stockSchema.virtual('peso_compra', {
//   ref: 'Peso',
//   localField: 'compra.peso',
//   foreignField: '_id',
//   justOne: true,
//   options: { virtuals: true },
// });

// stockSchema.virtual('precio_total').get(function () {
//   return this.peso_compra;
// });

stockSchema.pre('find', async function () {
  // console.log({ epale: this._conditions });
  let query = '';
  let filter = {};
  // console.log({ preFind: this });
  this.populate({
    path: 'pesos',
    options: { sort: { fecha: -1, createdAt: -1 } },
    select: 'peso',
  });

  this.populate('compra.peso', 'peso');

  // const pesos = await Peso.aggregate([
  //   {
  //     $match: { peso: { $gte: 124 } },
  //   },
  //   {
  //     $sort: { fecha: -1, createdAt: -1 },
  //   },
  //   {
  //     $group: { _id: '$stock' },
  //   },
  // ]);

  // console.log({ pesos });

  if (this._conditions && this._conditions.filter) {
    query = JSON.parse(JSON.stringify(this._conditions.filter));
    this._conditions = { ...{} };
  }

  if (query) {
    filter = { $and: [] };
    if (query.vendido) {
      if (query.vendido === 'sinreponer') {
        filter.$and.push({ venta: { $exists: true } });
        filter.$and.push({ venta: { $ne: {} } });
        filter.$and.push({
          $or: [
            { reposicion: { $exists: false } },
            { reposicion: { $eq: null } },
          ],
        });
      } else if (query.vendido === 'vendido') {
        filter.$and.push({ venta: { $exists: true } });
        filter.$and.push({ venta: { $ne: {} } });
        filter.$and.push({
          $and: [
            { reposicion: { $exists: true } },
            { reposicion: { $ne: null } },
          ],
        });
      } else if (query.vendido === 'novendido') {
        filter.$and.push({
          $or: [{ venta: { $exists: false } }, { venta: { $eq: null } }],
        });
      }
    }

    if (query.fechaVenta1 || query.fechaVenta2) {
      filter.$and.push({ venta: { $exists: true } });
      filter.$and.push({ venta: { $ne: {} } });
    }

    if (query.fechaVenta1) {
      const fechaVenta1 = new Date(fechaVenta1);
      filter.$and.push({ venta: { fecha: { $gte: fechaVenta1 } } });
    }

    if (query.fechaVenta2) {
      const fechaVenta2 = new Date(fechaVenta2);
      filter.$and.push({ venta: { fecha: { $lte: fechaVenta2 } } });
    }

    if (query.fechaCompra1) {
      const fechaCompra1 = new Date(fechaCompra1);
      filter.$and.push({ compra: { fecha: { $gte: fechaCompra1 } } });
    }

    if (query.fechaCompra2) {
      const fechaCompra2 = new Date(fechaCompra2);
      filter.$and.push({ compra: { fecha: { $lte: fechaCompra2 } } });
    }

    if (query.peso1) {
      // filter.$and.push({ 'pesos.0.peso': { $gte: query.peso1 } });
      this.where('pesos.peso').all([124]);
    }

    if (query.peso2) {
      filter.$and.push({ 'pesos.0.peso': { $lte: query.peso2 } });
    }

    console.log({ theQuery: query });
    console.log({ theFilter: filter });

    if (filter && filter.$and.length)
      this._conditions = JSON.parse(JSON.stringify(filter));
  }
});

const Stock = model('Stock', stockSchema);

module.exports = Stock;
