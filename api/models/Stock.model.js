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
    toObject: { virtuals: true, getters: true },
  }
);
stockSchema.virtual('repo', {
  ref: 'Stock',
  localField: 'venta.reposicion',
  foreignField: '_id',
});

stockSchema.pre(/^find/, async function () {
  this.populate({
    path: 'pesos',
    options: { sort: { fecha: -1, createdAt: -1 } },
    select: 'fecha peso tipo unidad',
  });

  this.populate('compra.peso');
  this.populate('venta.peso');
  this.populate('venta.reposicion');
});

stockSchema.methods.getProfit = function () {
  const precioVenta = this.toObject().totalPrecioVenta;
  const precioReposicion = this.toObject().venta?.reposicion?.totalPrecioCompra;
  if (this.toObject().venta?.reposicion) return precioVenta - precioReposicion;
  else return 0;
};

stockSchema.statics.checkSerial = async function (serial) {
  const found = await Stock.findOne({ serialNro: serial });
  // console.log({ found: !!!found });
  return !!!found;
};

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
    return pesoDiff / dias;
  }
});

module.exports = Stock;
