import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Button, Form, InputNumber, Select, DatePicker, Switch } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import styles from './compra.module.css';

dayjs.extend(customParseFormat);
const dateFormatList = ['MM/DD/YYYY', 'MM/DD/YY', 'MM-DD-YYYY', 'MM-DD-YY'];

const Compra = ({ onClose }) => {
  const [form] = Form.useForm();

  const [isReposicion, setIsReposicion] = useState(false);
  const [stockReposicion, setStockReposicion] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const getStockNro = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API + 'stock/nro'
        );

        if (response.data.ok) {
          form.setFieldsValue({
            nroStock: await response.data.stockNro,
          });
        } else throw new Error(response.data.errorMsg);
      } catch (err) {
        console.log('error', err);
        return 1001;
      }
    };

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

    getStockNro();
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

      if (isReposicion && !formInput.stockReposicion) {
        throw new Error('Favor seleccionar la reposicion');
      }

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
  };

  return (
    <div className={styles.form}>
      <h2>Formulario de Entrada</h2>
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
      <Form
        name="compraForm"
        form={form}
        onFinish={handleSubmit}
        onFinishFailed={handleFormError}
        initialValues={{
          fecha: dayjs(),
          nroStock: 2002,
          nroLote: 0,
          pesoEntrada: 0,
          unidadPeso: 'kg',
          precio: 0,
          stockReposicion: '',
        }}
      >
        <label htmlFor="fecha">Fecha Compra</label>
        <Form.Item
          name="fecha"
          rules={[{ required: true, message: 'Favor llenar fecha de compra' }]}
          noStyle
        >
          <DatePicker
            format={dateFormatList}
            onChange={(date, dateString) => {
              // console.log({ theDate: date });
              handleChange('fecha', dayjs(date, dateFormatList[0]));
            }}
          />
        </Form.Item>
        <label htmlFor="nroStock">Nro de Stock</label>
        <Form.Item
          noStyle
          name="nroStock"
          rules={[
            {
              required: true,
              message: 'Favor llenar Nro de Stock',
            },
            {
              type: 'integer',
              min: 1,
              message: 'Favor introducir valor valido en nroStock.',
            },
          ]}
        >
          <InputNumber
            onChange={(value) => {
              handleChange('nroStock', value);
            }}
            step={1}
            min={1}
          />
        </Form.Item>

        <label htmlFor="nroLote">Nro de Lote</label>
        <Form.Item
          noStyle
          name="nroLote"
          rules={[
            { required: true, message: 'Favor llenar Nro de Lote' },
            {
              type: 'integer',
              min: 1,
              message: 'Favor introducir valor valido en nroLote.',
            },
          ]}
        >
          <InputNumber
            onChange={(value) => {
              handleChange('nroLote', value);
            }}
            step={1}
            min={1}
          />
        </Form.Item>

        <label htmlFor="pesoEntrada">Peso Entrada</label>
        <Form.Item
          noStyle
          name="pesoEntrada"
          rules={[
            { required: true, message: 'Favor llenar Peso de entrada' },
            {
              type: 'number',
              min: 0.5,
              message: 'Favor introducir valor valido en pesoEntrada.',
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

        <label htmlFor="reposicion">Reposicion?</label>
        <div>
          <span></span>
          <Form.Item name="reposicion" noStyle>
            <Switch
              checked={isReposicion ? true : false}
              onChange={(checked) => {
                setIsReposicion(checked);
              }}
              style={{ marginRight: '20px' }}
            />
          </Form.Item>
          <Form.Item
            noStyle
            name="stockReposicion"
            rules={[
              {
                required: isReposicion ? true : false,
                message: 'Favor seleccionar Stock de Reposicion',
              },
            ]}
          >
            <Select
              style={{ minWidth: '200px' }}
              placeholder={'Nro de Stock'}
              showSearch
              optionFilterProp="children"
              onChange={(value) => {
                handleChange('stockReposicion', value);
              }}
              disabled={isReposicion && stockReposicion.length ? false : true}
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
                ...stockReposicion.map((stock) => ({
                  key: `${stock._id}`,
                  value: `${stock._id}`,
                  label: `${stock.stockNro}`,
                })),
              ]}
            />
          </Form.Item>
        </div>

        <span></span>
        <Button type="primary" htmlType="submit" style={{ marginTop: '20px' }}>
          Guardar
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </Form>
    </div>
  );
};

export default Compra;
