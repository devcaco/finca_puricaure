// require('../db');
const reader = require('xlsx');

// const mongoose = require('mongoose');
// const Stock = require('../models/Stock.model');
// const Peso = require('../models/Peso.model');

const exportData = async (dataToExport) => {
  const stockArr = [];
  console.log({ DataToExport: dataToExport[0] });
  if (dataToExport.length) {
    dataToExport.forEach((stock, index) => {
      const newData = {
        serialNro: stock.serialNro,
        stockNro: stock.stockNro,
        loteNro: stock.loteNro,
        Estatus: getStatus(stock),
        tipoStock: stock.stockTipo,
        ultimo_peso: stock.pesos[0].peso,
        fecha_compra: new Date(stock.compra.fecha),
        peso_compra: stock.compra.peso.peso,
        precio_compra: stock.compra.precio,
        total_compra: stock.totalPrecioCompra,
        reposicion_compra: stock.compra?.reposicion?.serialNro,
        notas_compra: stock.compra.notas,
        vendido: stock.venta?.fecha
          ? stock.venta.tipo === 'venta'
            ? 'SI'
            : 'PERDIDA'
          : 'NO',
        reposicion: stock.venta?.reposicion?.serialNro,
        fecha_venta: stock.venta?.fecha ? new Date(stock.venta?.fecha) : '',
        peso_venta: stock.venta?.peso?.peso,
        precio_venta: stock.venta?.fecha ? stock.venta?.precio : '',
        total_venta: stock.totalPrecioVenta,
        ganancia: calculateGanacia(stock),
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
      'Serial',
      'Nro',
      'Lote',
      'Estatus',
      'Tipo Stock',
      'Ultimo Peso',
      'Fecha Compra',
      'Peso Compra',
      'Precio Compra',
      'Total Compra',
      'Reposicion Compra',
      'Notas Compra',
      'Vendido',
      'Reposicion Venta',
      'Fecha Venta',
      'Peso Venta',
      'Precio Venta',
      'Total Venta',
      'Ganancia',
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

const getStatus = (stock) => {
  if (stock.compra?.fecha && !stock.venta?.fecha) return 'ACTIVO';
  if (stock.venta?.fecha && stock.venta?.tipo === 'perdida') return 'PERDIDA';
  if (stock.venta?.fecha && !stock.venta?.reposicion?.serialNro)
    return 'VENDIDO SIN REPONER';
  if (stock.venta?.fecha && stock.venta?.reposicion?.serialNro)
    return 'VENDIDO Y REPUESTO';
  return 'INVALIDO';
};

const calculateGanacia = (stock) => {
  console.log('CALCULANDO GANACIA 1');

  // if (stock.venta.fecha && !stock.venta?.reposicion) return '';
  console.log({ StockVentaRepo: stock.venta});
  if (stock.venta?.reposicion) {
    console.log('CALCULANDO GANACIA 2');
    totalPrecioVenta = stock.venta.peso.peso * stock.venta.precio;
    precioReposicion =
      stock.venta.reposicion.compra.peso.peso *
      stock.venta.reposicion.compra.precio;
    console.log({ totalPrecioVenta, precioReposicion });
    return totalPrecioVenta - precioReposicion;
  } else {
    return '';
  }
};

module.exports = exportData;
