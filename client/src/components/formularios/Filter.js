import React, { useState, useContext } from 'react';
import { Form, Input, Slider, DatePicker, Select, Button } from 'antd';

import styles from './Filter.module.css';
import dayjs from 'dayjs';

import FilterContext from '../../context/Filter.context';

const { RangePicker } = DatePicker;

const Filter = ({ onClose, onFilter }) => {
  const {
    filterData: formData,
    setFilterData: setFormData,
    isFilterActive,
  } = useContext(FilterContext);

  const handleChange = (name, val) => {
    switch (name) {
      case 'vendido':
        // console.log('');
        setFormData((prevState) => ({ ...prevState, vendido: val }));
        break;
      case 'fechaCompra':
        // if (val && val[0]) console.log({ fecha: dayjs(val[0]).format() });
        setFormData((prevState) => ({
          ...prevState,
          fechaCompra1: val && val[0] ? val[0] : '',
          fechaCompra2: val && val[1] ? val[1] : '',
        }));
        break;
      case 'fechaVenta':
        setFormData((prevState) => ({
          ...prevState,
          fechaVenta1: val && val[0] ? val[0] : '',
          fechaVenta2: val && val[0] ? val[0] : '',
        }));
        break;
      case 'peso':
        // console.log('SETTING PESO VALUES');
        // console.log(val[0], val[1]);
        setFormData((prevState) => ({
          ...prevState,
          peso1: val[0],
          peso2: val[1],
        }));
        break;
      default:
        break;
    }
  };
  const handleSubmit = () => {
    let filter = JSON.parse(JSON.stringify(formData));
    filter = {
      ...filter,
      fechaCompra1: filter.fechaCompra1
        ? new Date(dayjs(filter.fechaCompra1).format())
        : '',
      fechaCompra2: filter.fechaCompra2
        ? new Date(dayjs(filter.fechaCompra2).format())
        : '',
      fechaVenta1: filter.fechaVenta1
        ? new Date(dayjs(filter.fechaVenta1).format())
        : '',
      fechaVenta2: filter.fechaVenta2
        ? new Date(dayjs(filter.fechaVenta2).format())
        : '',
    };

    console.log({ filter });

    onFilter(filter);
  };
  return (
    <section className={styles.filter}>
      <div>
        <h2>Filtro</h2>
      </div>

      <div>
        <Form onFinish={handleSubmit}>
          <div>Vendido</div>
          <div>
            <Form.Item>
              <Select
                onChange={(val) => handleChange('vendido', val)}
                value={formData.vendido}
                options={[
                  { value: '', label: '---------' },
                  { value: 'vendido', label: 'Vendido con Reposicion' },
                  { value: 'sinreponer', label: 'Vendido Sin Reposicion' },
                  { value: 'sinvender', label: 'Sin Vender' },
                ]}
              />
            </Form.Item>
          </div>

          <div>Fecha Compra</div>
          <div>
            <Form.Item>
              <RangePicker
                allowEmpty={[false, true]}
                onChange={(val) => handleChange('fechaCompra', val)}
                value={[formData.fechaCompra1, formData.fechaCompra2]}
              />
            </Form.Item>
          </div>

          <div>Fecha Venta</div>
          <div>
            <Form.Item>
              <RangePicker
                allowEmpty={[false, true]}
                onChange={(val) => handleChange('fechaVenta', val)}
                value={[formData.fechaVenta1, formData.fechaVenta2]}
              />
            </Form.Item>
          </div>

          <div>Peso</div>
          <div>
            <Form.Item>
              <Slider
                range
                min={0}
                max={600}
                defaultValue={[0, 0]}
                onChange={(val) => handleChange('peso', val)}
                value={[formData.peso1, formData.peso2]}
              />
            </Form.Item>
          </div>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!isFilterActive() ? 'disabled' : ''}
          >
            Filtrar
          </Button>
          <Button style={{ marginTop: '20px' }} onClick={onClose}>
            Cerrar
          </Button>
        </Form>
      </div>
    </section>
  );
};

export default Filter;
