import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Table, Modal, Button, Input, Dropdown, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import {
  CheckSquareOutlined,
  ExclamationCircleFilled,
  DeleteOutlined,
  DownOutlined,
  FileExcelOutlined,
  FilterOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSkullCrossbones } from '@fortawesome/free-solid-svg-icons';

import styles from './TheTable.module.css';

import FilterContext from '../context/Filter.context';
import UploadFile from './forms/UploadFile';

const { confirm } = Modal;

const TheTable = ({
  stocks,
  onDelete,
  openFilter,
  onClick,
  onLastSelected,
  loading,
  clearSelected,
  openUpload,
}) => {
  const { filterSearch, setFilterSearch, isFilterActive, clearFilterData } =
    useContext(FilterContext);

  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    setSelectedRows([]);
    onLastSelected([]);
  }, [clearSelected, stocks, onLastSelected]);

  const showConfirm = () => {
    confirm({
      title: 'Esta usted seguro?',
      icon: <ExclamationCircleFilled />,
      content: 'Se borraran todo el ganado seleccionado',
      okText: 'Si',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        onDelete(selectedRows);
      },
      onCancel() {
        // console.log('Cancel');
      },
    });
  };

  const showConfirmExport = () => {
    confirm({
      title: 'Exportar data a XLSX ?',
      icon: '',
      content: 'Se exportará la tabla actual a un archivo XLSX',
      okText: 'Exportar',
      okType: 'primary',
      width: '430px',
      cancelText: 'Cancelar',
      onOk() {
        // console.log('OK');
        exportData();
      },
      onCancel() {
        // console.log('Cancel');
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
          <Button type="link" onClick={() => handleDetails(record._id)}>
            {stockNro}
          </Button>
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
      title: 'Precio Compra',
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
      title: 'Total Precio Compra',
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
            {venta.fecha && venta.tipo === 'venta' && (
              <CheckSquareOutlined
                className={styles.vendido}
                style={{ color: rows.venta.reposicion ? 'green' : 'orange' }}
              />
            )}
            {venta.fecha && venta.tipo === 'perdida' && (
              <FontAwesomeIcon
                icon={faSkullCrossbones}
                className={styles.vendido}
                style={{ color: 'red' }}
              />
            )}
          </>
        );
      },
    },
  ];

  const handleDetails = (id) => {
    onClick(id);
  };

  const exportData = async () => {
    try {
      const response = await axios.post(
        process.env.REACT_APP_API + 'stock/export',
        { data: stocks }
      );

      if (!response.data.ok) throw new Error(response.data.errorMsg);
      else window.open(process.env.REACT_APP_API + 'stock/export');
    } catch (err) {
      console.log('ERROR -> ', err);
    }
  };

  const rowSelection = {
    selectedRowKeys: selectedRows,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRows(selectedRowKeys);
    },
    onSelect: (record, selected, selectedRows) => {
      setSelectedRows(selectedRows);
      onLastSelected(selectedRows);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      setSelectedRows(selectedRows);
      onLastSelected(selectedRows);
    },
  };

  const handleMenuClick = (e) => {
    console.log(e);

    if (e.key === '1') {
      openUpload('upload');
    }

    if (e.key === '2') {
      showConfirmExport();
    }
  };

  const items = [
    {
      label: 'Importar Data',
      key: '1',
      icon: <FileExcelOutlined />,
    },
    {
      label: 'Exportar Data',
      key: '2',
      icon: <FileExcelOutlined />,
    },
  ];
  const optionsProps = {
    items,
    onClick: handleMenuClick,
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
              placeholder="Nro de Ganado"
              allowClear={true}
              addonBefore={<SearchOutlined />}
              onChange={(e) => {
                setFilterSearch(e.target.value);
              }}
              className={styles.hidden}
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
            <Button
              icon={<FilterOutlined />}
              onClick={() => openFilter('filter')}
              style={{ marginRight: '20px' }}
            >
              Filtrar
            </Button>
            <Dropdown menu={optionsProps}>
              <Button>
                <Space>
                  Opciones
                  <DownOutlined />
                </Space>
              </Button>
            </Dropdown>
          </div>
        </div>
        <Table
          columns={columns}
          rowKey={(record) => record._id}
          dataSource={stocks}
          loading={loading}
          pagination={{
            defaultPageSize: 20,
            total: stocks.length,
            showTotal: (total) => `Total ${total} `,
          }}
          rowSelection={{ ...rowSelection }}
        />
      </div>
    </>
  );
};

export default TheTable;
