const reader = require('xlsx');

require('./db');
const mongoose = require('mongoose');
const Stock = require('./models/Stock.model');
const Peso = require('./models/Peso.model');

const importData = async () => {
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
  const errCount = 1;

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
            serialNro:
              stock?.stockNro?.toString().trim() +
              '-' +
              stock?.loteNro?.toString().trim(),
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
        if (err.code == 11000) console.log(err.keyValue.serialNro);
        else console.log('hola -', err.message);
        // errCount++;
      }
    })
  );
  mongoose.connection.close();
};

const exportData = async () => {
  const stockArr = [];
  const stockData = await Stock.find()
    .populate('pesos')
    .populate('compra.peso')
    .populate('venta.peso')
    .populate('reposicion');

  //   console.log({ stockData });

  if (stockData.length) {
    stockData.forEach((stock, index) => {
      const newData = {
        stockNro: stock.stockNro,
        loteNro: stock.loteNro,
        fecha_compra: new Date(stock.compra.fecha),
        peso_compra: stock.compra.peso.peso,
        precio_compra: stock.compra.precio,
        vendido: stock.venta.fecha ? 'SI' : 'NO',
        fecha_venta: stock.venta.fecha ? new Date(stock.venta?.fecha) : '',
        precio_venta: stock.venta.fecha ? stock.venta?.precio : '',
        peso_venta: stock.venta?.peso?.peso,
        ultimo_peso: stock.pesos[0].peso,
      };

      stockArr.push(newData);
    });
  }

  const wb = reader.utils.book_new();
  const ws = reader.utils.json_to_sheet(stockArr);

  reader.utils.book_append_sheet(wb, ws, 'Sheet2');

  // Writing to our file
  reader.writeFile(wb, './data/test.xlsx');

  console.log('DONE');
};

importData();
