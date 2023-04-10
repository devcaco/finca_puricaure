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
      type: Number,
      required: [true, 'Nro de Referencia es requerido'],
      unique: true,
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
    vendido: {
      type: Boolean,
      default: false,
      get: function () {
        return Object.keys(this.venta).length;
      },
    },
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

const Stock = model('Stock', stockSchema);

module.exports = Stock;
