import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, InputNumber, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import styles from './peso.module.css';

dayjs.extend(customParseFormat);
const dateFormatList = ['MM/DD/YYYY', 'MM/DD/YY', 'MM-DD-YYYY', 'MM-DD-YY'];

const Peso = ({ onClose, selectedStock }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [stocks, setStocks] = useState([]);

  const [form] = Form.useForm();

  const fetchStock = async () => {
    try {
      const response = await axios.get(
        process.env.REACT_APP_API + 'stock/stockVenta'
      );

      if (response.data.ok) setStocks(response.data.stockVenta);
      else throw new Error(response.data.errorMsg);
    } catch (err) {
      console.log('ERROR -> ', err);
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchStock();
    console.log({selectedStock})
  }, [selectedStock]);

  const handleFormError = (formError) => {
    console.log({ formError });

    setErrorMsg('Favor llenar todos los campos del formulario');
  };

  const handleSubmit = async (formInput) => {
    try {
      console.log(formInput);
      if (!formInput.fecha || !formInput.nroStock || !formInput.peso) {
        throw new Error('Formulario Invalido: Favor llenar campos requeridos');
      }

      const response = await axios.post(
        process.env.REACT_APP_API + 'stock/peso',
        formInput
      );

      if (response.data.ok) {
        onClose(true);
      } else {
        throw new Error(response.data.errorMsg);
      }
    } catch (err) {
      console.log('ERROR -> ', err);
      setErrorMsg(err.message);
    }
  };

  const handleChange = (name, value) => {
    setErrorMsg('');
  };

  return (
    <div className={styles.form}>
      <h2>Registrar Peso</h2>
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      <Form
        name="pesoForm"
        onFinish={handleSubmit}
        onFinishFailed={handleFormError}
        form={form}
        initialValues={{
          fecha: dayjs(),
          peso: selectedStock.pesos[0]?.peso ?? 0,
          nroStock: selectedStock?._id ?? '',
        }}
      >
        <label htmlFor="fecha">Fecha</label>
        <Form.Item
          name={'fecha'}
          rules={[{ required: true, message: 'Favor llenar fecha' }]}
          noStyle
        >
          <DatePicker
            format={dateFormatList}
            onChange={(date, dateString) => {
              handleChange('fecha', dayjs(date, dateFormatList[0]));
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

        <label htmlFor="peso">Peso</label>
        <Form.Item
          noStyle
          name="peso"
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
              handleChange('pesoEntrada', value);
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

export default Peso;
