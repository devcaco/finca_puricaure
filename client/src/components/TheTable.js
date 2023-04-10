import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import axios from 'axios';

import { CheckSquareOutlined } from '@ant-design/icons';

import styles from './TheTable.module.css';

const columns = [
  {
    title: 'Stock Nro',
    dataIndex: 'stockNro',
    key: 'stockNro',
  },
  {
    title: 'Fecha Compra',
    dataIndex: 'compra',
    key: 'fechaCompra',
    render: (compra) => <>{new Date(compra.fecha).toDateString()}</>,
  },
  {
    title: 'Precio Por Kg',
    dataIndex: 'compra',
    key: 'precioCompra',
    render: (compra) => <>{'$ ' + compra.precio.toFixed(2)}</>,
  },
  {
    title: 'Peso Compra',
    dataIndex: 'compra',
    key: 'pesoCompra',
    render: (compra) => <>{compra.peso ? compra.peso.peso + ' kgs' : ''}</>,
  },
  {
    title: 'Precio Total',
    dataIndex: 'compra',
    key: 'precioTotal',
    render: (compra) => (
      <>
        {' '}
        {'$ ' +
          (compra.peso ? compra.peso.peso * compra.precio : 0)
            .toFixed(2)
            .toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </>
    ),
  },
  {
    title: 'Ultimo Peso',
    dataIndex: 'pesos',
    key: 'pesos',
    render: (pesos, rows) => <>{pesos.length ? pesos[0].peso + ' kgs' : ''}</>,
  },
  {
    title: 'Vendido',
    dataIndex: 'venta',
    key: 'venta',
    render: (venta, rows) => (
      <>{venta && <CheckSquareOutlined className={styles.vendido} />}</>
    ),
  },
];

const TheTable = ({ stocks, onDelete }) => {
  const [selectedRows, setSelectedRows] = useState([]);

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        'selectedRows: ',
        selectedRows
      );
      setSelectedRows(selectedRowKeys);
    },
    onSelect: (record, selected, selectedRows) => {
      console.log(record, selected, selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log(selected, selectedRows, changeRows);
    },
  };
  return (
    <>
      <div className={styles.table}>
        <div className={styles.header}>
          {stocks.length > 0 && (
            <button
              disabled={!selectedRows.length ? 'disabled' : ''}
              onClick={() => {
                if (window.confirm('Esta usted seguro?')) {
                  onDelete(selectedRows);
                }
              }}
            >
              Borrar
            </button>
          )}
        </div>
        <Table
          columns={columns}
          rowKey={(record) => record._id}
          dataSource={stocks}
          pagination={false}
          rowSelection={{ ...rowSelection }}
        />
      </div>
    </>
  );
};

export default TheTable;
