// require('../db');
const reader = require('xlsx');

// const mongoose = require('mongoose');
// const Stock = require('../models/Stock.model');
// const Peso = require('../models/Peso.model');

const exportData = async (dataToExport) => {
  const stockArr = [];

  if (dataToExport.length) {
    dataToExport.forEach((stock, index) => {
      const newData = {
        stockNro: stock.stockNro,
        loteNro: stock.loteNro,
        fecha_compra: new Date(stock.compra.fecha),
        peso_compra: stock.compra.peso.peso,
        precio_compra: stock.compra.precio,
        vendido: stock.venta?.fecha ? 'SI' : 'NO',
        fecha_venta: stock.venta?.fecha ? new Date(stock.venta?.fecha) : '',
        precio_venta: stock.venta?.fecha ? stock.venta?.precio : '',
        peso_venta: stock.venta?.peso?.peso,
        ultimo_peso: stock.pesos[0].peso,
      };

      stockArr.push(newData);
    });
  }

  const wb = reader.utils.book_new();
  const ws = reader.utils.json_to_sheet([]);
  // ws['!rows'] = [];
  // ws['!cols'] = [];

  // set the header row style
  const headerStyle = {
    font: { bold: true },
    fill: { type: 'pattern', patternType: 'solid', fgColor: { rgb: 'FFFF00' } },
  };

  // ws['!rows'] = [{ height: 30 }];
  // ws['!header'] = [
  //   'Nro',
  //   'Lote',
  //   'Fecha Compra',
  //   'Peso Compra',
  //   'Precio Compra',
  //   'Vendido',
  //   'Fecha Venta',
  //   'Peso Venta',
  //   'Precio Venta',
  //   'Ultimo Peso',
  // ];

  let heading = [
    [
      'Nro',
      'Lote',
      'Fecha Compra',
      'Peso Compra',
      'Precio Compra',
      'Vendido',
      'Fecha Venta',
      'Peso Venta',
      'Precio Venta',
      'Ultimo Peso',
    ],
  ];
  ws['!rows'] = [
    {
      hpt: 25,
    },
  ];
  // ws['!header'].forEach((cell, index) => {
  //   const cellRef = reader.utils.encode_cell({ c: index, r: 0 });
  //   ws[cellRef] = { ...ws[cellRef], s: headerStyle };
  //   ws['!cols'][index] = { wch: cell.v.length + 5 };
  // });
  // Writing to our file
  reader.utils.sheet_add_aoa(ws, heading);
  reader.utils.sheet_add_json(ws, stockArr, { origin: 'A2', skipHeader: true });
  reader.utils.book_append_sheet(wb, ws, 'Sheet1');
  reader.writeFile(wb, './data/finca_puricaure.xlsx');

  console.log('DONE');
};

module.exports = exportData;
