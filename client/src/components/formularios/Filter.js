import React, { useContext } from 'react';
import { Form, Slider, DatePicker, Select, Button } from 'antd';
import FilterContext from '../../context/Filter.context';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import styles from './Filter.module.css';

dayjs.extend(customParseFormat);

const dateFormatList = ['MM/DD/YYYY', 'MM/DD/YY', 'MM-DD-YYYY', 'MM-DD-YY'];

const { RangePicker } = DatePicker;

const Filter = ({ onClose }) => {
  const {
    filterData: formData,
    setFilterData: setFormData,
    clearFilterData,
    isFilterActive,
  } = useContext(FilterContext);

  const handleChange = (name, val) => {
    switch (name) {
      case 'vendido':
        setFormData((prevState) => ({ ...prevState, vendido: val }));
        break;
      case 'fechaCompra':
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
    onClose(false);
  };
  return (
    <section className={styles.filter}>
      <h2>Filtro</h2>

      <Form
        onFinish={handleSubmit}
        initialValues={{
          vendido: formData.vendido,
          fechaCompra: [formData.fechaCompra1, formData.fechaCompra2],
          fechaVenta: [formData.fechaVenta1, formData.fechaVenta2],
          peso: [formData.peso1, formData.peso2],
        }}
      >
        <div>Vendido</div>
        <div>
          <Form.Item name="vendido">
            <Select
              onChange={(val) => handleChange('vendido', val)}
              // value={formData.vendido}
              options={[
                { value: '', label: '---------' },
                { value: 'vendido', label: 'Vendido con reposicion' },
                { value: 'sinreponer', label: 'Vendido sin reposicion' },
                { value: 'sinvender', label: 'Sin Vender' },
              ]}
            />
          </Form.Item>
        </div>

        <div>Fecha Compra</div>
        <div>
          <Form.Item name="fechaCompra">
            <RangePicker
              format={dateFormatList}
              allowEmpty={[false, true]}
              onChange={(val) => handleChange('fechaCompra', val)}
              // value={[formData.fechaCompra1, formData.fechaCompra2]}
            />
          </Form.Item>
        </div>

        <div>Fecha Venta</div>
        <div>
          <Form.Item name="fechaVenta">
            <RangePicker
              allowEmpty={[false, true]}
              onChange={(val) => handleChange('fechaVenta', val)}
              // value={[formData.fechaVenta1, formData.fechaVenta2]}
            />
          </Form.Item>
        </div>

        <div>Peso</div>
        <div>
          <Form.Item name="peso">
            <Slider
              range
              min={0}
              max={600}
              onChange={(val) => handleChange('peso', val)}
              // value={[formData.peso1, formData.peso2]}
            />
          </Form.Item>
        </div>
        <Form.Item noStyle>
          <Button
            type="primary"
            htmlType="submit"
            disabled={!isFilterActive() ? 'disabled' : ''}
          >
            Filtrar
          </Button>
        </Form.Item>
        <Button
          style={{ marginTop: '20px' }}
          onClick={() => {
            clearFilterData();
            onClose(false);
          }}
        >
          Resetear Filtro
        </Button>
      </Form>
    </section>
  );
};

export default Filter;
