import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button,
  Form,
  InputNumber,
  Input,
  Select,
  DatePicker,
  Spin,
} from 'antd';
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
  const [loadingData, setLoadingData] = useState(false);

  const fetchStock = async () => {
    try {
      setLoadingData(true);
      const response = await axios.get(
        process.env.REACT_APP_API + 'stock/stockVenta'
      );

      if (response.data.ok) {
        setStocks(response.data.stockVenta);
        setLoadingData(false);
      } else {
        throw new Error(response.data.errorMsg);
      }
    } catch (err) {
      console.log('ERROR -> ', err.message);
      setErrorMsg(err.message);
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, [selectedStock]);

  const handleFormError = (formError) => {
    console.log({ formError });
    setErrorMsg('Error in Form');
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
        throw new Error('Invalid Form Inputs');
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
    <Spin spinning={loadingData}>
      <div className={styles.form}>
        <h2>Sale Form</h2>
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
            label="Type"
            name="tipoVenta"
            rules={[{ required: true, message: 'Please select a sale type' }]}
            help={''}
          >
            <Select
              onChange={(value) => {
                handleChange('tipoVenta', value);
              }}
              options={[
                {
                  value: 'sale',
                  label: 'Venta',
                },
                {
                  value: 'death / lost',
                  label: 'Perdida',
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Cattle Number"
            name={'nroStock'}
            rules={[
              { required: true, message: 'Please select a cattle number' },
            ]}
            help={''}
          >
            <Select
              style={{ minWidth: '200px' }}
              placeholder={'Cattle Number'}
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
                  label: `${stock.serialNro}`,
                })),
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Date Sold"
            name="fechaVenta"
            rules={[{ required: true, message: 'Please select the Sold Date' }]}
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
            label="Weight"
            name="pesoSalida"
            rules={[
              { required: true, message: 'Please enter the sold weight' },
            ]}
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
            label="Price per Weight"
            name="precio"
            rules={[
              { required: true, message: 'Please enter the price per weight' },
            ]}
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

          <Form.Item label="Notes" name="notas">
            <TextArea rows={4}></TextArea>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginTop: '20px', width: '100%' }}
            >
              Save
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={onClose} style={{ width: '100%' }}>
              Close
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
};

export default Venta;
