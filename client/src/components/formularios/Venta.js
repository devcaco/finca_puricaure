import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, InputNumber, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import styles from './venta.module.css';

dayjs.extend(customParseFormat);
const dateFormatList = ['MM/DD/YYYY', 'MM/DD/YY', 'MM-DD-YYYY', 'MM-DD-YY'];

const { TextArea } = Input;

const Venta = ({ onClose, selectedStock }) => {
  const [stocks, setStocks] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [form] = Form.useForm();
  const [isDisabled, setIsDisabled] = useState(false);

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
  }, [selectedStock]);

  const handleFormError = (formError) => {
    console.log({ formError });
    setErrorMsg('Formulario Invalido');
  };

  const handleChange = (name, value) => {
    setErrorMsg('');

    if (name === 'tipoVenta') {
      setIsDisabled(!!(value === 'perdida'));
    }
  };

  const handleSubmit = async (formInput) => {
    console.log({ formInput });
    try {
      if (
        !formInput.nroStock ||
        !formInput.fechaVenta ||
        (formInput.tipoVenta === 'venta' && !formInput.precio) ||
        (formInput.tipoVenta === 'venta' && !formInput.pesoSalida)
      ) {
        throw new Error('Campos Invalido.');
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
        form={form}
        name={'ventaForm'}
        layout="horizontal"
        labelCol={{ span: 9 }}
        labelAlign="left"
        wrapperCol={{ offset: 0 }}
        onFinish={handleSubmit}
        onFinishFailed={handleFormError}
        requiredMark={false}
        initialValues={{
          tipoVenta: 'venta',
          fechaVenta: dayjs(),
          nroStock: selectedStock?._id ?? '',
          pesoSalida: selectedStock?.pesos[0]?.peso,
          unidadPeso: 'kg',
          precio: 0,
        }}
      >
        <Form.Item
          label="Tipo"
          name="tipoVenta"
          rules={[
            { required: true, message: 'Favor seleccionar tipo de venta' },
          ]}
          help={''}
        >
          <Select
            onChange={(value) => {
              handleChange('tipoVenta', value);
            }}
            options={[
              {
                value: 'venta',
                label: 'Venta',
              },
              {
                value: 'perdida',
                label: 'Perdida',
              },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Nro de Stock"
          name={'nroStock'}
          rules={[
            { required: true, message: 'Favor seleccionar nro de Stock' },
          ]}
          help={''}
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
                label: `${stock.serialNro}`,
              })),
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Fecha Venta"
          name="fechaVenta"
          rules={[{ required: true, message: 'Favor llenar fecha de venta' }]}
          help={''}
        >
          <DatePicker
            format={dateFormatList}
            onChange={(date, dateString) => {
              handleChange('fechaVenta', dayjs(date, dateFormatList[0]));
            }}
          />
        </Form.Item>

        <Form.Item
          label="Peso Salida"
          name="pesoSalida"
          rules={[{ required: true, message: 'Favor introducir el peso' }]}
          help={''}
        >
          <InputNumber
            onChange={(value) => {
              handleChange('pesoSalida', value);
            }}
            step={1}
            min={1}
            disabled={isDisabled}
            addonAfter={
              <Select
                style={{ minWidth: '50px' }}
                name="unidadPeso"
                defaultValue={'kg'}
                size="small"
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

        <Form.Item
          label="Precio Por Peso"
          name="precio"
          rules={[{ required: true, message: 'Favor llenar precio por peso' }]}
          help={''}
        >
          <InputNumber
            onChange={(value) => {
              handleChange('precio', value);
            }}
            min={0}
            step={0.1}
            addonBefore={' $ '}
            disabled={isDisabled}
          />
        </Form.Item>

        <Form.Item label="Notas" name="notas">
          <TextArea rows={4}></TextArea>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginTop: '20px', width: '100%' }}
          >
            Guardar
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={onClose} style={{ width: '100%' }}>
            Cerrar
          </Button>
        </Form.Item>

        {/* <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginTop: '20px' }}
          >
            Guardar
          </Button>
        </Form.Item>
        <Button onClick={onClose}>Cerrar</Button> */}
      </Form>
    </div>
  );
};

export default Venta;
