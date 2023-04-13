import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, InputNumber, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import styles from './venta.module.css';

dayjs.extend(customParseFormat);
const dateFormatList = ['MM/DD/YYYY', 'MM/DD/YY', 'MM-DD-YYYY', 'MM-DD-YY'];

const Venta = ({ onClose }) => {
  const [stocks, setStocks] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [form] = Form.useForm();

  const fetchStock = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API + 'stock/stockVenta'
      );

      if (response.data.ok) {
        setStocks(response.data.stockVenta);
      } else {
        throw new Error(response.data.errorMsg);
      }
    } catch (err) {
      console.log('ERROR -> ', err.message);
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleFormError = (formError) => {
    setErrorMsg('Formulario Invalido');
  };

  const handleChange = (name, value) => {
    setErrorMsg('');
  };

  const handleSubmit = async (formInput) => {
    try {
      if (!formInput.nroStock || !formInput.fechaVenta || !formInput.precio) {
        throw new Error('Formulario Invalido.');
      }

      const response = await axios.post(
        process.env.REACT_APP_API + 'stock/venta',
        formInput
      );

      if (response.data.ok) {
        onClose(true);
      } else {
        throw new Error(response.data.errorMsg);
      }
    } catch (err) {
      console.log('ERROR -> ', err.message);
      setErrorMsg(err.message);
    }
  };

  return (
    <div className={styles.form}>
      <h2>Formulario de Venta</h2>
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      <Form
        name={'ventaForm'}
        form={form}
        onFinish={handleSubmit}
        onFinishFailed={handleFormError}
        initialValues={{
          fechaVenta: dayjs(),
          nroStock: '',
          pesoSalida: 0,
          unidadPeso: 'kg',
          precio: 0,
        }}
      >
        <label htmlFor="fechaVenta">Fecha Venta</label>
        <Form.Item
          name="fechaVenta"
          rules={[{ required: true, message: 'Favor llenar fecha de venta' }]}
          noStyle
        >
          <DatePicker
            format={dateFormatList}
            onChange={(date, dateString) => {
              handleChange('fechaVenta', dayjs(date, dateFormatList[0]));
            }}
          />
        </Form.Item>
        <label htmlFor="nroStock">Nro de Stock</label>
        <Form.Item
          name={'nroStock'}
          rules={[
            { required: true, message: 'Favor seleccionar nro de Stock' },
          ]}
          noStyle
        >
          <Select
            style={{ minWidth: '200px' }}
            placeholder={'Nro de Stock'}
            showSearch
            optionFilterProp="children"
            onChange={(value) => {
              handleChange('nroStock', value);
            }}
            disabled={stocks.length ? false : true}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              {
                value: '',
                label: '-------',
              },
              ...stocks.map((stock) => ({
                key: `${stock._id}`,
                value: `${stock._id}`,
                label: `${stock.stockNro}`,
              })),
            ]}
          />
        </Form.Item>

        <label htmlFor="pesoSalida">Peso Salida</label>
        <Form.Item
          noStyle
          name="pesoSalida"
          rules={[
            { required: true, message: 'Favor introducir el peso' },
            {
              type: 'number',
              min: 0.5,
              message: 'Favor introducir un valor valido para el peso.',
            },
          ]}
        >
          <InputNumber
            onChange={(value) => {
              handleChange('pesoSalida', value);
            }}
            step={1}
            min={1}
            addonAfter={
              <Select
                name="unidadPeso"
                onChange={(value) => {
                  handleChange('unidadPeso', value);
                }}
                options={[
                  {
                    value: 'kg',
                    label: 'Kgs',
                  },
                  {
                    value: 'lb',
                    label: 'Lbs',
                  },
                  {
                    value: 'grm',
                    label: 'Grms',
                  },
                ]}
              />
            }
          />
        </Form.Item>

        <label htmlFor="precio">Precio Por Peso</label>
        <Form.Item
          noStyle
          name="precio"
          rules={[
            { required: true, message: 'Favor llenar precio por peso' },
            {
              type: 'number',
              min: 0.1,
              message: 'Favor introducir valor valido en precio.',
            },
          ]}
        >
          <InputNumber
            onChange={(value) => {
              handleChange('precio', value);
            }}
            min={0}
            step={0.1}
            addonBefore={' $ '}
          />
        </Form.Item>

        <Form.Item noStyle>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginTop: '20px' }}
          >
            Guardar
          </Button>
        </Form.Item>
        <Button onClick={onClose}>Cerrar</Button>
      </Form>
    </div>
  );
};

export default Venta;
