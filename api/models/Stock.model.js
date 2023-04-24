const Peso = require('./Peso.model');

const { Schema, model } = require('mongoose');

const stockSchema = new Schema(
  {
    serialNro: {
      type: String,
      required: [true, 'Nro de Serial es requerido'],
      unique: true,
    },
    stockNro: {
      type: String,
      required: [true, 'Nro de Referencia es requerido'],
      unique: false,
    },
    loteNro: {
      type: Number,
      required: true,
      unique: false,
    },
    stockTipo: {
      type: String,
      enum: [
        'Holstein Friesian',
        'Hereford',
        'Simmental',
        'Aberdeen Angus',
        'Belgian Blue',
        'Limousin',
        'Brangus',
        'Red Angus',
        'Braford',
        'Belted Galloway',
        'Brown Swiss',
        'Beefalo',
        'Other',
      ],
      required: false,
    },
    pesos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Peso',
      },
    ],
    muerte: {
      fecha: Date,
    },
    compra: {
      fecha: Date,
      precio: Number,
      peso: { type: Schema.Types.ObjectId, ref: 'Peso' },
      reposicion: { type: Schema.Types.ObjectId, ref: 'Stock' },
      notas: String,
    },
    venta: {
      tipo: {
        type: String,
        enum: ['venta', 'perdida'],
      },
      fecha: Date,
      precio: Number,
      peso: { type: Schema.Types.ObjectId, ref: 'Peso' },
      reposicion: { type: Schema.Types.ObjectId, ref: 'Stock' },
      notas: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
  }
);
stockSchema.virtual('repo', {
  ref: 'Stock',
  localField: 'venta.reposicion',
  foreignField: '_id',
});

stockSchema.pre(/^find/, async function (next) {
  this.populate({
    path: 'pesos',
    options: { sort: { fecha: -1, createdAt: -1 } },
    select: 'fecha peso tipo unidad',
  });

  this.populate('compra.peso');
  this.populate('venta.peso');
  this.populate('venta.reposicion');

  if (this.venta?.reposicion) {
    console.log('CALCULANDO GANACIA');
    let precioVenta = this.totalPrecioVenta;
    let precioCompra = this.totalPrecioCompra;
    this.ganancia2 = precioVenta - precioCompra;
  }
  next();
});

const Stock = model('Stock', stockSchema);

stockSchema.virtual('totalPrecioVenta').get(function () {
  if (this.venta?.fecha) {
    this.populate('venta.peso');
    return this.venta?.precio * this.venta?.peso.peso;
  }
});

stockSchema.virtual('totalPrecioCompra').get(function () {
  if (this.compra?.fecha) {
    this.populate('compra.peso');
    return this.compra?.precio * this.compra?.peso?.peso;
  }
});

stockSchema.virtual('ganancia2').get(async function () {
  // this.populate('venta.reposicion');
  // this.populate('compra.reposicion');
  // if (this.venta?.fecha && this.venta?.reposicion) {
  //   let stockReposicion = this.populate('venta.reposicion');
  //   // console.log({ stockReposicion });
  //   let totalPrecioVenta = this.venta?.peso?.peso * this.venta?.precio;
  //   let totalPrecioCompra =
  //     stockReposicion?.compra?.peso?.peso * stockReposicion?.compra?.precio;
  //   console.log({
  //     totalPrecioCompra,
  //     totalPrecioVenta,
  //     theTotal: totalPrecioVenta - totalPrecioCompra,
  //   });
  //   // return totalPrecioVenta - totalPrecioCompra;
  //   return 1
  // }
  return 0;
});

stockSchema.virtual('diasTranscurridos').get(function () {
  if (this.venta?.fecha) {
    return Math.ceil(
      (new Date(this.venta?.fecha) - new Date(this.compra?.fecha)) /
        (1000 * 3600 * 24)
    );
  }
});



stockSchema.virtual('pesoPromedio').get(function () {
  if (this.venta?.fecha) {
    let dias = Math.ceil(
      (new Date(this.venta?.fecha) - new Date(this.compra?.fecha)) /
        (1000 * 3600 * 24)
    );
    let pesoDiff = this.venta?.peso?.peso - this.compra?.peso?.peso;
    console.log({ pesoVenta: this.venta?.peso?.peso, dias });
    return pesoDiff / dias;
  }
});

module.exports = Stock;
