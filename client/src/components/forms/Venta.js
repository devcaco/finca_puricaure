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

const Venta = ({ onClose, selectedStock, langText }) => {
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
    setErrorMsg(langText['modal_sale_form_error']);
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
        throw new Error(langText['modal_sale_form_error']);
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
        <h2>{langText['modal_sale_title']}</h2>
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
            label={langText['modal_sale_label_sale_type']}
            name="tipoVenta"
            rules={[
              {
                required: true,
                message: langText['modal_sale_label_sale_type_error'],
              },
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
                  label: langText['modal_sale_label_sale_type_option_sale'],
                },
                {
                  value: 'perdida',
                  label: langText['modal_sale_label_sale_type_option_lost'],
                },
              ]}
            />
          </Form.Item>

          <Form.Item
            label={langText['modal_sale_label_cattle']}
            name={'nroStock'}
            rules={[
              {
                required: true,
                message: langText['modal_sale_label_cattle_error'],
              },
            ]}
            help={''}
          >
            <Select
              style={{ minWidth: '200px' }}
              placeholder={langText['modal_sale_label_cattle']}
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
            label={langText['modal_sale_label_sale_date']}
            name="fechaVenta"
            rules={[
              {
                required: true,
                message: langText['modal_sale_label_sale_date_error'],
              },
            ]}
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
            label={langText['modal_sale_label_sale_weight']}
            name="pesoSalida"
            rules={[
              {
                required: true,
                message: langText['modal_sale_label_sale_weight_error'],
              },
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
            label={langText['modal_sale_label_price_weight']}
            name="precio"
            rules={[
              {
                required: true,
                message: langText['modal_sale_label_price_weight_error'],
              },
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

          <Form.Item label={langText['modal_sale_label_notes']} name="notas">
            <TextArea rows={4}></TextArea>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ marginTop: '20px', width: '100%' }}
            >
              {langText['modal_sale_btn_save']}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={onClose} style={{ width: '100%' }}>
              {langText['modal_sale_btn_close']}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Spin>
  );
};

export default Venta;
