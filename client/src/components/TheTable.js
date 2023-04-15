import React, { useEffect, useState, useContext } from 'react';
import { Table, Modal, Button, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  CheckSquareOutlined,
  ExclamationCircleFilled,
  DeleteOutlined,
} from '@ant-design/icons';

import styles from './TheTable.module.css';

import FilterContext from '../context/Filter.context';

const { confirm } = Modal;
const TheTable = ({
  stocks,
  onDelete,
  openFilter,
  onClick,
  onLastSelected,
}) => {
  const { filterSearch, setFilterSearch, isFilterActive, clearFilterData } =
    useContext(FilterContext);

  const [selectedRows, setSelectedRows] = useState([]);

  const showConfirm = () => {
    confirm({
      title: 'Esta usted seguro?',
      icon: <ExclamationCircleFilled />,
      content: 'Se borraran todos los registros seleccinados',
      okText: 'Si',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        console.log('OK');
        onDelete(selectedRows);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns = [
    {
      title: 'Nro',
      dataIndex: 'stockNro',
      key: 'stockNro',
      sorter: (a, b) => {
        // if (!+a.stockNro) console.log(a.stockNro);
        // return a.stockNro.toString().length - b.stockNro.toString().length;
        a = !!(+a.stockNro + 1) ? +a.stockNro : 99999;
        b = !!(+b.stockNro + 1) ? +b.stockNro : 99999;
        return a - b;
      },
      render: (stockNro, record) => (
        <>
          <Button type='link' onClick={() => handleDetails(record._id)}>{stockNro}</Button>
        </>
      ),
    },
    {
      title: 'Lote',
      dataIndex: 'loteNro',
      key: 'loteNro',
      sorter: (a, b) => {
        a = !!(+a.loteNro + 1) ? +a.stockNro : 99999;
        b = !!(+b.loteNro + 1) ? +b.stockNro : 99999;
        return a - b;
      },
    },
    {
      title: 'Fecha Compra',
      dataIndex: 'compra',
      key: 'fechaCompra',
      render: (compra) => <>{new Date(compra.fecha).toLocaleDateString()}</>,
    },
    {
      title: 'Precio Por Kg',
      dataIndex: 'compra',
      key: 'precioCompra',
      render: (compra) => <>{'$ ' + compra.precio.toFixed(2)}</>,
      responsive: ['md'],
    },
    {
      title: 'Peso Compra',
      dataIndex: 'compra',
      key: 'pesoCompra',
      render: (compra) => <>{compra.peso ? compra.peso.peso + ' kgs' : ''}</>,
      responsive: ['md'],
    },
    {
      title: 'Precio Total',
      dataIndex: 'compra',
      key: 'precioTotal',
      render: (compra) => (
        <>
          {'$ ' +
            (compra.peso ? compra.peso.peso * compra.precio : 0)
              .toFixed(2)
              .toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </>
      ),
      responsive: ['md'],
    },
    {
      title: 'Ultimo Peso',
      dataIndex: 'pesos',
      key: 'pesos',
      render: (pesos, rows) => (
        <>{pesos.length ? pesos[0].peso + ' kgs' : ''}</>
      ),
    },
    {
      title: 'Vendido',
      dataIndex: 'venta',
      key: 'venta',
      responsive: ['md'],
      render: (venta, rows) => {
        return (
          <>
            {venta && (
              <CheckSquareOutlined
                className={styles.vendido}
                style={{ color: rows.reposicion ? 'green' : 'orange' }}
              />
            )}
          </>
        );
      },
    },
  ];

  const handleDetails = (id) => {
    console.log({ theIDFromTheTable: id });

    onClick(id);
  };

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
      console.log({ record, selected, selectedRows });

      onLastSelected(selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      console.log(selected, selectedRows, changeRows);
    },
  };
  return (
    <>
      <div className={styles.table}>
        <div className={styles.header}>
          <div className={styles.table__actions}>
            <Button
              danger
              type="primary"
              icon={<DeleteOutlined />}
              disabled={!selectedRows.length ? 'disabled' : ''}
              onClick={showConfirm}
            >
              Borrar
            </Button>
            <Input
              name="search"
              value={filterSearch}
              placeholder="Buscar por Nro"
              allowClear={true}
              addonBefore={<SearchOutlined />}
              onChange={(e) => {
                setFilterSearch(e.target.value);
              }}
            />
          </div>
          {isFilterActive() && (
            <div>
              <Button
                onClick={() => {
                  clearFilterData();
                }}
              >
                Borrar Filtro
              </Button>
            </div>
          )}

          <div>
            <Button onClick={() => openFilter('filter')}>Filtrar</Button>
          </div>
        </div>
        <Table
          columns={columns}
          rowKey={(record) => record._id}
          dataSource={stocks}
          pagination={{
            defaultPageSize: 20,
          }}
          rowSelection={{ ...rowSelection }}
        />
      </div>
    </>
  );
};

export default TheTable;
