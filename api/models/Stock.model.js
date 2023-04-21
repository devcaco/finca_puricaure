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
      reposicion: { type: Schema.Types.ObjectId, ref: 'Stock' },
    },
    venta: {
      fecha: Date,
      precio: Number,
      peso: { type: Schema.Types.ObjectId, ref: 'Peso' },
      reposicion: { type: Schema.Types.ObjectId, ref: 'Stock' },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true },
  }
);

stockSchema.pre('find', async function () {
  this.populate({
    path: 'pesos',
    options: { sort: { createdAt: -1 } },
    select: 'peso',
  });

  this.populate('compra.peso');
  this.populate('venta.peso');
});

const Stock = model('Stock', stockSchema);

module.exports = Stock;
