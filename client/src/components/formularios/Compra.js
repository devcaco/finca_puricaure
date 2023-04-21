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

const Compra = ({ onClose }) => {
  const [isReposicion, setIsReposicion] = useState(true);
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

    setErrorMsg('Favor llenar todos los campos requeridos');
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
        throw new Error('Favor llenar campos requeridos');
      }

      // if (isReposicion && !formInput.stockReposicion) {
      //   throw new Error('Favor seleccionar la reposicion');
      // }

      const response = await axios.post(
        process.env.REACT_APP_API + 'stock/',
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

    console.log(nroStock, nroLote);

    if (nroStock && nroLote) {
      nroSerial = nroStock.toString().trim() + '-' + nroLote.toString().trim();
      setNroSerial(nroSerial);
    }
  };

  return (
    <div className={styles.form}>
      <h2>
        Formulario de Entrada <br />
        {nroSerial}
      </h2>
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      <Form
        layout="horizontal"
        labelCol={{ span: 9 }}
        labelAlign="left"
        name="compraForm"
        wrapperCol={{ offset: 0 }}
        form={form}
        onFinish={handleSubmit}
        onFinishFailed={handleFormError}
        requiredMark={false}
        initialValues={{
          fecha: dayjs(),
          nroStock: 0,
          nroLote: 0,
          pesoEntrada: 0,
          unidadPeso: 'kg',
          precio: 0,
          stockReposicion: '',
        }}
      >
        {/* <label htmlFor="fecha">Fecha Compra</label> */}
        <Form.Item
          // noStyle
          label="Fecha Compra"
          name="fecha"
          rules={[{ required: true, message: 'Favor llenar fecha de compra' }]}
          help={''}

          // noStyle
        >
          <DatePicker
            format={dateFormatList}
            onChange={(date, dateString) => {
              // console.log({ theDate: date });
              handleChange('fecha', dayjs(date, dateFormatList[0]));
            }}
            style={{ width: '100%' }}
          />
        </Form.Item>
        {/* <label htmlFor="nroStock">Nro de Stock</label> */}
        <Form.Item
          // noStyle
          label="Nro de Stock"
          name="nroStock"
          rules={[
            {
              required: true,
              message: 'Favor introducir el Nro de stock',
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

        {/* <label htmlFor="nroLote">Nro de Lote</label> */}
        <Form.Item
          // noStyle
          label="Nro de Lote"
          name="nroLote"
          rules={[
            { required: true, message: '' },
            {
              type: 'integer',
              min: 1,
              message: '',
            },
          ]}
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

        {/* <label htmlFor="pesoEntrada">Peso Entrada</label> */}
        <Form.Item
          // noStyle
          label="Peso Entrada"
          name="pesoEntrada"
          rules={[
            { required: true, message: '' },
            {
              type: 'number',
              min: 0.5,
              message: '',
            },
          ]}
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
        {/* <label htmlFor="precio">Precio Por Peso</label> */}
        <Form.Item
          // noStyle
          label="Precio Por Peso"
          name="precio"
          rules={[
            { required: true, message: 'Favor llenar precio por peso' },
            {
              type: 'number',
              min: 0.1,
              message: '',
            },
          ]}
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

        {/* <label htmlFor="reposicion">Reposicion?</label> */}
        {/* <div>
          <span></span> */}
        {/* <Form.Item label="Reposicion?">
            <Form.Item noStyle name="reposicion">
              <Switch
                checked={isReposicion ? true : false}
                onChange={(checked) => {
                  setIsReposicion(checked);
                }}
                style={{ marginRight: '2rem' }}
              />
            </Form.Item> */}
        <Form.Item name="stockReposicion" label="Reposicion?">
          <Select
            placeholder={'Nro de Stock'}
            showSearch
            optionFilterProp="children"
            onChange={(value) => {
              handleChange('stockReposicion', value);
            }}
            disabled={isReposicion && stockReposicion.length ? false : true}
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
                label: `${stock.stockNro}`,
              })),
            ]}
          />
        </Form.Item>
        {/* </Form.Item> */}
        {/* <Form.Item
          noStyle
          name="stockReposicion"
          rules={[
            {
              required: isReposicion ? true : false,
              message: 'Favor seleccionar Stock de Reposicion',
            },
          ]}
        ></Form.Item> */}
        {/* </div> */}
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
  );
};

export default Compra;
