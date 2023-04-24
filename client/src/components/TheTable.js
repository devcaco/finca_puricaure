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
      title: 'Are you sure?',
      icon: <ExclamationCircleFilled />,
      content: 'All selected items will be deleted',
      okText: 'Yes',
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

  const showConfirmExport = () => {
    confirm({
      title: 'Export Data to XLSX ?',
      icon: '',
      content: 'This will export the current table view to an XLSX file',
      okText: 'Export',
      okType: 'primary',
      width: '430px',
      cancelText: 'No',
      onOk() {
        console.log('OK');
        // onDelete(selectedRows);
        exportData();
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
          <Button type="link" onClick={() => handleDetails(record._id)}>
            {stockNro}
          </Button>
        </>
      ),
    },
    {
      title: 'Batch',
      dataIndex: 'loteNro',
      key: 'loteNro',
      sorter: (a, b) => {
        a = !!(+a.loteNro + 1) ? +a.stockNro : 99999;
        b = !!(+b.loteNro + 1) ? +b.stockNro : 99999;
        return a - b;
      },
    },
    {
      title: 'Date Purchased',
      dataIndex: 'compra',
      key: 'fechaCompra',
      render: (compra) => <>{new Date(compra.fecha).toLocaleDateString()}</>,
    },
    {
      title: 'Price Per Weight',
      dataIndex: 'compra',
      key: 'precioCompra',
      render: (compra) => <>{'$ ' + compra.precio.toFixed(2)}</>,
      responsive: ['md'],
    },
    {
      title: 'Purchased Weight',
      dataIndex: 'compra',
      key: 'pesoCompra',
      render: (compra) => <>{compra.peso ? compra.peso.peso + ' kgs' : ''}</>,
      responsive: ['md'],
    },
    {
      title: 'Total Price',
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
      title: 'Last Weight',
      dataIndex: 'pesos',
      key: 'pesos',
      render: (pesos, rows) => (
        <>{pesos.length ? pesos[0].peso + ' kgs' : ''}</>
      ),
    },
    {
      title: 'Sold',
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
      label: 'Import Data',
      key: '1',
      icon: <FileExcelOutlined />,
    },
    {
      label: 'Export to Excel',
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
              Delete
            </Button>
            <Input
              name="search"
              value={filterSearch}
              placeholder="Search by Cattle Number"
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
                Clear Filter
              </Button>
            </div>
          )}

          <div>
            <Button
              icon={<FilterOutlined />}
              onClick={() => openFilter('filter')}
              style={{ marginRight: '20px' }}
            >
              Filter
            </Button>
            <Dropdown menu={optionsProps}>
              <Button>
                <Space>
                  Options
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
