const reader = require('xlsx');
const file = reader.readFile('./data/compra1.xlsx');

let data = [];

const sheets = file.SheetNames;

const headers = [
  'stockNro',
  'loteNro',
  'pesoEntrada',
  'precioPorPeso',
  'precioTotal',
  'fecha',
];

for (let i = 0; i < sheets.length; i++) {
  const temp = reader.utils.sheet_to_json(file.Sheets[file.SheetNames[i]], {
    header: headers,
    dateNF: 'mm/dd/yy',
    range: 1,
    raw: false,
  });
  data = [...temp];
  //   temp.forEach((res) => {
  //     data.push(res);
  //   });
}

const mongoose = require('mongoose');
require('./db');
const Stock = require('./models/Stock.model');
const Peso = require('./models/Peso.model');

const importData = async () => {
  await Promise.all(
    data.map(async (stock, index) => {
      try {
        if (
          stock.stockNro ||
          stock.loteNro ||
          stock.fecha ||
          stock.precioPorPeso ||
          stock.pesoEntrada
        ) {
          const newPeso = await Peso.create({
            fecha: new Date(stock.fecha) || new Date(),
            tipo: 'compra',
            unidad: 'kg',
            peso: +stock.pesoEntrada ?? 0,
          });

          const newStock = await Stock.create({
            stockNro: stock?.stockNro?.toString(),
            loteNro: stock?.loteNro?.toString(),
            compra: {
              fecha: new Date(stock.fecha) || new Date(),
              peso: newPeso._id,
              precio: +stock.precioPorPeso.replace('$', '').trim() || 0,
            },
            venta: {},
            pesos: [newPeso._id],
            reposicion: null,
          });

          await Peso.findByIdAndUpdate(
            newPeso._id,
            {
              stock: newStock._id,
            },
            { new: true }
          );
        } else {
          console.log('SKIPPED -> ', stock.nroStock);
        }
      } catch (err) {
        console.log('ERROR - > ', err.message, stock.nroStock);
      }
    })
  );
  mongoose.connection.close();
};

importData();
