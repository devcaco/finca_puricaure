import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Form, InputNumber, Select, DatePicker, Spin } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import styles from './peso.module.css';

dayjs.extend(customParseFormat);
const dateFormatList = ['MM/DD/YYYY', 'MM/DD/YY', 'MM-DD-YYYY', 'MM-DD-YY'];

const Peso = ({ onClose, selectedStock }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [stocks, setStocks] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [form] = Form.useForm();

  const fetchStock = async () => {
    try {
      setLoadingData(true);
      const response = await axios.get(
        process.env.REACT_APP_API + 'stock/stockVenta'
      );

      if (response.data.ok) setStocks(response.data.stockVenta);
      else throw new Error(response.data.errorMsg);
      setLoadingData(false);
    } catch (err) {
      console.log('ERROR -> ', err);
      setErrorMsg(err.message);
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [selectedStock]);

  const handleFormError = (formError) => {
    console.log({ formError });

    setErrorMsg('Favor llene todo los campos');
  };

  const handleSubmit = async (formInput) => {
    try {
      console.log(formInput);
      if (!formInput.fecha || !formInput.nroStock || !formInput.peso) {
        throw new Error('Favor llene todo los campos');
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
    <Spin spinning={loadingData}>
      <div className={styles.form}>
        <h2>Registrar Peso</h2>
        {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
        <Form
          form={form}
          name="pesoForm"
          layout="horizontal"
          labelCol={{ span: 9 }}
          labelAlign="left"
          wrapperCol={{ offset: 0 }}
          requiredMark={false}
          onFinish={handleSubmit}
          onFinishFailed={handleFormError}
          initialValues={{
            fecha: dayjs(),
            peso: selectedStock?.pesos[0]?.peso,
            nroStock: selectedStock?._id ?? '',
            unidadPeso: 'kg',
          }}
        >
          {/* <label htmlFor="fecha">Fecha</label> */}
          <Form.Item
            label="Fecha"
            name={'fecha'}
            rules={[{ required: true, message: 'Favor seleccione la fecha' }]}
            help={''}
          >
            <DatePicker
              format={dateFormatList}
              style={{ width: '100%' }}
              onChange={(date, dateString) => {
                handleChange('fecha', dayjs(date, dateFormatList[0]));
              }}
            />
          </Form.Item>

          {/* <label htmlFor="nroStock">Cattle Number</label> */}
          <Form.Item
            label="Nro de Ganado"
            name={'nroStock'}
            rules={[{ required: true, message: 'Favor seleccione el ganado' }]}
            help={''}
          >
            <Select
              style={{ width: '100%' }}
              placeholder={'Nro de ganado'}
              showSearch
              optionFilterProp="children"
              onChange={(value) => {
                handleChange('nroStock', value);
              }}
              disabled={stocks.length ? false : true}
              filterOption={(input, option) =>
                (option?.label ?? '')
                  .toLowerCase()
                  .includes(input.toLowerCase())
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

          {/* <label htmlFor="peso">Weight</label> */}
          <Form.Item
            label="Peso"
            name="peso"
            rules={[
              { required: true, message: 'Favor introduzca el peso' },
              {
                type: 'number',
                min: 0.5,
                message: 'Favor introduzca un valor valido en el peso',
              },
            ]}
            help={''}
          >
            <InputNumber
              onChange={(value) => {
                handleChange('pesoEntrada', value);
              }}
              step={1}
              min={1}
              style={{ width: '100%' }}
              addonAfter={
                <Select
                  name="unidadPeso"
                  defaultValue="kg"
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
        </Form>
      </div>
    </Spin>
  );
};

export default Peso;
