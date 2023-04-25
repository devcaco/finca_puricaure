import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  Tooltip,
} from 'antd';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import styles from './compra.module.css';

dayjs.extend(customParseFormat);
const dateFormatList = ['MM/DD/YYYY', 'MM/DD/YY', 'MM-DD-YYYY', 'MM-DD-YY'];
const { TextArea } = Input;

const Compra = ({ onClose, langText }) => {
  const [stockReposicion, setStockReposicion] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [nroSerial, setNroSerial] = useState('');

  const [form] = Form.useForm();

  useEffect(() => {
    const getStockReposicion = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API + 'stock/stockReposicion'
        );
        if (response.data.ok)
          setStockReposicion([...response.data.stockReposicion]);
        else {
          throw new Error(response.data.errorMsg);
        }
      } catch (err) {
        console.log('ERROR -> ', err.message);
        setErrorMsg(err.message);
      }
    };

    getStockReposicion();
  }, [form]);

  const handleFormError = (error) => {
    console.log('FORM ERROR', error);

    setErrorMsg(langText['modal_purchase_form_error']);
  };

  const handleSubmit = async (formInput) => {
    try {
      if (
        !formInput.nroStock ||
        !formInput.nroLote ||
        !formInput.fecha ||
        !formInput.pesoEntrada ||
        !formInput.precio
      ) {
        throw new Error(langText['modal_purchase_form_error']);
      }

      const response = await axios.post(
        process.env.REACT_APP_API + 'stock/compra',
        formInput
      );

      if (response.data.ok) onClose(true);
      else throw new Error(response.data.errorMsg);
    } catch (err) {
      console.log('ERROR -> ', err);
      setErrorMsg(err.message);
      return false;
    }
  };

  const handleChange = (name, value) => {
    setErrorMsg('');

    let nroSerial = '';
    const nroStock = form.getFieldValue('nroStock');
    const nroLote = form.getFieldValue('nroLote');

    if (nroStock && nroLote) {
      nroSerial = nroStock.toString().trim() + '-' + nroLote.toString().trim();
      setNroSerial(nroSerial);
    }
  };

  return (
    <div className={styles.form}>
      <h2>
        {langText['modal_purchase_title']} <br />
        {nroSerial}
      </h2>
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      <Form
        form={form}
        name="compraForm"
        layout="horizontal"
        labelCol={{ span: 9 }}
        labelAlign="left"
        wrapperCol={{ offset: 0 }}
        requiredMark={false}
        onFinish={handleSubmit}
        onFinishFailed={handleFormError}
        initialValues={{
          fecha: dayjs(),
          nroStock: 0,
          nroLote: 0,
          pesoEntrada: 0,
          unidadPeso: 'kg',
          precio: 0,
          stockReposicion: '',
          tipoStock: '',
        }}
      >
        <Form.Item
          label={langText['modal_purchase_label_cattle_type']}
          name="tipoStock"
          rules={[
            {
              required: true,
              message: langText['modal_purchase_label_cattle_type_error'],
            },
          ]}
          help={''}
        >
          <Select
            onChange={(value) => {
              handleChange('tipoStock', value);
            }}
            options={[
              {
                value: '',
                label: '-------',
              },
              ...langText['stock_types'].map((tipo) => ({
                key: `${tipo}`,
                value: `${tipo}`,
                label: `${tipo}`,
              })),
            ]}
          />
        </Form.Item>
        <Form.Item
          label={langText['modal_purchase_label_purchase_date']}
          name="fecha"
          rules={[
            {
              required: true,
              message: langText['modal_purchase_label_purchase_date_error'],
            },
          ]}
          help={''}
        >
          <DatePicker
            format={dateFormatList}
            onChange={(date, dateString) => {
              handleChange('fecha', dayjs(date, dateFormatList[0]));
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
        <Form.Item
          label={langText['modal_purchase_label_cattle_nro']}
          name="nroStock"
          rules={[
            {
              required: true,
              message: langText['modal_purchase_label_cattle_nro_error'],
            },
          ]}
          help={''}
        >
          <Input
            style={{ width: '100%' }}
            onChange={(value) => {
              handleChange('nroStock', value);
            }}
          />
        </Form.Item>

        <Form.Item
          label={langText['modal_purchase_label_cattle_batch']}
          name="nroLote"
          rules={[
            {
              required: true,
              message: langText['modal_purchase_label_cattle_batch_error'],
            },
            {
              type: 'integer',
              min: 1,
              message: '',
            },
          ]}
          help={''}
        >
          <InputNumber
            style={{ width: '100%' }}
            onChange={(value) => {
              handleChange('nroLote', value);
            }}
            step={1}
            min={1}
          />
        </Form.Item>

        <Form.Item
          label={langText['modal_purchase_label_purchase_weight']}
          name="pesoEntrada"
          rules={[
            {
              required: true,
              message: langText['modal_purchase_label_purchase_weight_error'],
            },
            {
              type: 'number',
              min: 0.5,
              message: langText['modal_purchase_label_purchase_weight_error_2'],
            },
          ]}
          help={''}
        >
          <InputNumber
            onChange={(value) => {
              handleChange('pesoEntrada', value);
            }}
            style={{ width: '100%' }}
            step={1}
            min={1}
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
        <Form.Item
          label={langText['modal_purchase_label_price_weight']}
          name="precio"
          rules={[
            {
              required: true,
              message: langText['modal_purchase_label_price_weight_error'],
            },
            {
              type: 'number',
              min: 0.1,
              message: langText['modal_purchase_label_price_weight_error_2'],
            },
          ]}
          help={''}
        >
          <InputNumber
            style={{ width: '100%' }}
            onChange={(value) => {
              handleChange('precio', value);
            }}
            min={0}
            step={0.1}
            addonBefore={' $ '}
          />
        </Form.Item>

        <Form.Item
          name="stockReposicion"
          label={langText['modal_purchase_label_replenishment']}
        >
          <Select
            placeholder={
              langText['modal_purchase_label_replenishment_placeholder']
            }
            showSearch
            optionFilterProp="children"
            onChange={(value) => {
              handleChange('stockReposicion', value);
            }}
            disabled={stockReposicion.length ? false : true}
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={[
              {
                value: '',
                label: '-------',
              },
              ...stockReposicion.map((stock) => ({
                key: `${stock._id}`,
                value: `${stock._id}`,
                label: `${stock.serialNro}`,
              })),
            ]}
          />
        </Form.Item>

        <Form.Item label={langText['modal_purchase_label_notes']} name="notas">
          <TextArea rows={4}></TextArea>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            style={{ marginTop: '20px', width: '100%' }}
          >
            {langText['modal_purchase_btn_save']}
          </Button>
        </Form.Item>
        <Form.Item>
          <Button onClick={onClose} style={{ width: '100%' }}>
            {langText['modal_purchase_btn_close']}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Compra;
