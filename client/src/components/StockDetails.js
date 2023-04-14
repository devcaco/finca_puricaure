import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Col, Row } from 'antd';
import { DatePicker, InputNumber, Select, Button } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import styles from './StockDetails.module.css';

dayjs.extend(customParseFormat);
const dateFormatList = ['MM/DD/YYYY', 'MM/DD/YY', 'MM-DD-YYYY', 'MM-DD-YY'];

const StockDetails = ({ stockId, onClose }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [stockDetails, setStockDetails] = useState({});
  const [editMode, setEditMode] = useState(true);
  const [stockReposicion, setStockReposicion] = useState([]);
  const [formData, setformData] = useState({});

  useEffect(() => {
    const fetchStockDetails = async () => {
      try {
        const response = await axios.get(
          process.env.REACT_APP_API + 'stock/details/' + stockId
        );

        console.log({ TheDetails: response.data.stockDetails });
        if (response.data.ok) {
          const data = response.data.stockDetails;
          setStockDetails({
            ...data,
            compra: {
              ...data.compra,
              precio_total: data.compra.precio * data.compra.peso.peso,
            },
            venta: data.venta && {
              ...data.venta,
              precio_total: data.venta.peso.peso * data.venta.precio,
              dias: Math.ceil(
                (new Date(data.venta.fecha) - new Date(data.compra.fecha)) /
                  (1000 * 3600 * 24)
              ),
              aumentoPorDia:
                (data.venta.peso.peso - data.compra.peso.peso) /
                ((new Date(data.venta.fecha) - new Date(data.compra.fecha)) /
                  (1000 * 3600 * 24)),
            },
          });
          setformData({
            ...data,
            compra: {
              ...data.compra,
              precio_total: data.compra.precio * data.compra.peso.peso,
            },
            venta: data.venta && {
              ...data.venta,
              precio_total: data.venta.peso.peso * data.venta.precio,
              dias: Math.ceil(
                (new Date(data.venta.fecha) - new Date(data.compra.fecha)) /
                  (1000 * 3600 * 24)
              ),
              aumentoPorDia:
                (data.venta.peso.peso - data.compra.peso.peso) /
                  ((new Date(data.venta.fecha) - new Date(data.compra.fecha)) /
                    (1000 * 3600 * 24)) || 1,
            },
          });
        } else throw new Error(response.data.errorMsg);
      } catch (err) {
        console.log('ERROR -> ', err.message);
        setErrorMsg(err.message);
      }
    };

    fetchStockDetails();
  }, [stockId]);

  const handleChange = (name, value) => {};
  return (
    <div className={styles.details}>
      <div className={styles.details__header}>
        <h2>STOCK {stockDetails.stockNro}</h2>
        <div className={styles.errorMsg}>{errorMsg}</div>
      </div>
      {stockDetails && (
        <>
          <div className={styles['details__body-container']}>
            <Row gutter={[16, 16]} id="MAIN_CONTAINER_FLEX">
              <Col
                span={12}
                className={styles['details__body--container-left']}
                id="LEFT_SECTION"
              >
                <Row style={{ paddingBottom: '20px' }} id="DATOS_COMPRA">
                  <Col span={24} className={[styles['section__container']]}>
                    <div>DATOS COMPRA</div>
                    <div className={[styles['section__body']]}>
                      <Row align="middle" className={[styles['section__row']]}>
                        <Col span={12}>Fecha Compra:</Col>
                        <Col span={12}>
                          {!editMode ? (
                            new Date(
                              stockDetails.compra?.fecha
                            ).toLocaleDateString()
                          ) : (
                            <DatePicker
                              value={dayjs(formData.compra?.fecha)}
                              style={{ width: '100%' }}
                              size="middle"
                              format={dateFormatList}
                              onChange={(date, dateString) => {
                                handleChange(
                                  'fechaCompra',
                                  dayjs(date, dateFormatList[0])
                                );
                              }}
                            />
                          )}
                        </Col>
                      </Row>
                      <Row align="middle" className={[styles['section__row']]}>
                        <Col span={12}>Peso Compra:</Col>
                        <Col span={12}>
                          {!editMode ? (
                            stockDetails.compra?.peso.peso + ' Kgs'
                          ) : (
                            <InputNumber
                              onChange={(value) => {
                                handleChange('pesoCompra', value);
                              }}
                              step={1}
                              value={formData.compra?.peso.peso}
                              style={{ width: '100%' }}
                              min={1}
                              size="middle"
                              addonAfter={
                                <Select
                                  size="small"
                                  name="unidadPeso"
                                  onChange={(value) => {
                                    handleChange('unidadPeso', value);
                                  }}
                                  options={[
                                    {
                                      value: 'kg',
                                      label: 'K',
                                    },
                                    {
                                      value: 'lb',
                                      label: 'Lb',
                                    },
                                    {
                                      value: 'grm',
                                      label: 'Grm',
                                    },
                                  ]}
                                />
                              }
                            />
                          )}
                        </Col>
                      </Row>
                      <Row align="middle" className={[styles['section__row']]}>
                        <Col span={12}>Precio Por Peso</Col>
                        <Col span={12}>
                          {!editMode ? (
                            '$ ' + stockDetails.compra?.precio
                          ) : (
                            <InputNumber
                              onChange={(value) => {
                                handleChange('precioCompra', value);
                              }}
                              value={formData?.compra?.precio}
                              min={0}
                              step={0.01}
                              addonBefore={' $ '}
                              size="middle"
                              style={{ width: '100%' }}
                            />
                          )}
                        </Col>
                      </Row>
                      <Row align="middle" className={[styles['section__row']]}>
                        <Col span={12}>Precio Total:</Col>
                        <Col span={12}>
                          {'$ ' + stockDetails.compra?.precio_total.toFixed(2)}
                        </Col>
                      </Row>
                      <Row align="middle" className={[styles['section__row']]}>
                        <Col span={12}>Reposicion:</Col>
                        <Col span={12}>
                          {!editMode ? (
                            stockDetails.reposicion &&
                            stockDetails.reposicion.stockNro
                          ) : (
                            <Select
                              style={{ width: '100%' }}
                              size="middle"
                              placeholder={'Nro de Stock'}
                              value={formData?.compra?.reposicion?._id}
                              showSearch
                              optionFilterProp="children"
                              onChange={(value) => {
                                handleChange('stockReposicion', value);
                              }}
                              disabled={
                                stockReposicion.length ? 'disabled' : ''
                              }
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
                          )}
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
                {stockDetails.venta && (
                  <Row id="DATOS_VENTA">
                    <Col span={24} className={[styles['section__container']]}>
                      <div>DATOS VENTA</div>
                      <div className={[styles['section__body']]}>
                        <Row
                          align="middle"
                          className={[styles['section__row']]}
                        >
                          <Col span={12}>Fecha Venta:</Col>
                          <Col span={12}>
                            {!editMode ? (
                              new Date(
                                stockDetails?.venta?.fecha
                              ).toLocaleDateString()
                            ) : (
                              <DatePicker
                                value={dayjs(formData?.venta?.fecha)}
                                format={dateFormatList}
                                onChange={(date, dateString) => {
                                  handleChange(
                                    'fechaVenta',
                                    dayjs(date, dateFormatList[0])
                                  );
                                }}
                              />
                            )}
                          </Col>
                        </Row>
                        <Row
                          align="middle"
                          className={[styles['section__row']]}
                        >
                          <Col span={12}>Dias Transcurridos</Col>
                          <Col span={12}>{stockDetails?.venta?.dias}</Col>
                        </Row>
                        <Row
                          align="middle"
                          className={[styles['section__row']]}
                        >
                          <Col span={12}>P/Dia Aumento</Col>
                          <Col span={12}>
                            {stockDetails?.venta?.aumentoPorDia.toFixed(2) +
                              ' Kgs'}
                          </Col>
                        </Row>
                        <Row
                          align="middle"
                          className={[styles['section__row']]}
                        >
                          <Col span={12}>Peso Venta</Col>
                          <Col span={12}>
                            {!editMode ? (
                              stockDetails?.venta?.peso.peso + ' Kgs'
                            ) : (
                              <InputNumber
                                onChange={(value) => {
                                  handleChange('pesoVenta', value);
                                }}
                                value={formData?.venta?.peso.peso}
                                step={1}
                                min={1}
                                style={{ width: '7rem' }}
                                addonAfter={
                                  <Select
                                    size="small"
                                    onChange={(value) => {
                                      // handleChange('unidadPeso', value);
                                    }}
                                    options={[
                                      {
                                        value: 'kg',
                                        label: 'kg',
                                      },
                                      {
                                        value: 'lb',
                                        label: 'lb',
                                      },
                                      {
                                        value: 'grm',
                                        label: 'grm',
                                      },
                                    ]}
                                  />
                                }
                              />
                            )}
                          </Col>
                        </Row>
                        <Row
                          align="middle"
                          className={[styles['section__row']]}
                        >
                          <Col span={12}>Precio Por Peso</Col>
                          <Col span={12}>
                            {!editMode ? (
                              '$ ' + stockDetails?.venta?.precio
                            ) : (
                              <InputNumber
                                onChange={(value) => {
                                  handleChange('precioVenta', value);
                                }}
                                min={0}
                                step={0.1}
                                addonBefore={' $ '}
                                style={{ width: '6rem' }}
                              />
                            )}
                          </Col>
                        </Row>
                        <Row
                          align="middle"
                          className={[styles['section__row']]}
                        >
                          <Col span={12}>Precio Total Venta</Col>
                          <Col span={12}>
                            {'$ ' +
                              stockDetails?.venta?.precio_total.toFixed(2)}
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                )}
              </Col>
              <Col span={12} id="RIGHT_SECTION">
                {stockDetails.venta && (
                  <Row style={{ paddingBottom: '20px' }} id="DATOS_GANANCIA">
                    <Col span={24} className={[styles['section__container']]}>
                      <div>DATOS GANANCIA</div>
                      <div className={[styles['section__body']]}>
                        <Row
                          align="middle"
                          className={[styles['section__row']]}
                        >
                          <Col span={12}>Inversionista</Col>
                          <Col span={12}></Col>
                        </Row>
                        <Row
                          align="middle"
                          className={[styles['section__row']]}
                        >
                          <Col span={12}>Finca</Col>
                          <Col span={12}></Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                )}
                <Row id="DATOS_PESO">
                  <Col span={24} className={[styles['section__container']]}>
                    <div>DATOS PESO</div>
                    <div className={[styles['section__body']]}>
                      {stockDetails?.pesos?.length &&
                        stockDetails.pesos.map((peso) => (
                          <Fragment key={peso._id}>
                            <Row
                              align="middle"
                              className={[styles['section__row']]}
                            >
                              <Col span={8}>
                                {new Date(peso.fecha).toLocaleDateString()}
                              </Col>
                              <Col span={8}>{peso.peso} Kgs.</Col>
                              <Col span={8}>{peso.tipo}</Col>
                            </Row>
                          </Fragment>
                        ))}
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <div className={styles['details__footer']}>
            <Button
              type="primary"
              onClick={() => {
                setEditMode(!editMode);
              }}
            >
              {editMode ? 'Guardar' : 'Modificar'}
            </Button>
            <Button onClick={onClose} style={{ marginTop: '20px' }}>
              Cerrar
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default StockDetails;
