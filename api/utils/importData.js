const reader = require('xlsx');
const mongoose = require('mongoose');

const Stock = require('../models/Stock.model');
const Peso = require('../models/Peso.model');
require('../db');

const importData = async (fileName) => {
  const file = reader.readFile(`./data/${fileName}`);
  const sheets = file.SheetNames;

  const headers = [
    'stockNro',
    'loteNro',
    'pesoEntrada',
    'precioPorPeso',
    'precioTotal',
    'fecha',
  ];

  let data = [];

  for (let i = 0; i < sheets.length; i++) {
    const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], {
      header: headers,
      dateNF: 'mm/dd/yy',
      range: 1,
      raw: false,
    });
    data = [...temp];
  }

  const allOk = await Promise.all(
    data.map(async (stock, index) => {
      try {
        if (
          !stock.stockNro ||
          !stock.loteNro ||
          !stock.fecha ||
          !stock.precioPorPeso ||
          !stock.pesoEntrada
        )
          throw new Error('Data Invalida al Importar - SKIPPED');

        const serial =
          stock.stockNro.toString() + '-' + stock.loteNro.toString();
        const serialOK = await Stock.checkSerial(serial);

        if (!serialOK) throw new Error('Serial Repetido');

        const newPeso = await Peso.create({
          fecha: new Date(stock.fecha) || new Date(),
          tipo: 'compra',
          unidad: 'kg',
          peso: +stock.pesoEntrada ?? 0,
        });

        // console.log({ newPeso });

        const newStock = await Stock.create({
          serialNro: serial,
          stockNro: stock?.stockNro?.toString(),
          loteNro: +stock?.loteNro,
          compra: {
            fecha: new Date(stock.fecha) || new Date(),
            peso: newPeso._id,
            precio: +stock.precioPorPeso.replace('$', '').trim() || 0,
            reposicion: null,
          },
          venta: {},
          pesos: [newPeso._id],
        });

        // console.log({ newStock });

        await Peso.findByIdAndUpdate(
          newPeso._id,
          {
            stock: newStock._id,
          },
          { new: true }
        );
      } catch (err) {
        if (err.code == 11000) console.log(err.keyValue.serialNro);
        else console.log('hola -', err);
        // errCount++;
      }
    })
  );

  console.log({ allOk });
  return true;
  // mongoose.connection.close();
};

module.exports = importData;
