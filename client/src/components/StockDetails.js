import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';

import styles from './StockDetails.module.css';

const StockDetails = ({ stockId, onClose }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [stockDetails, setStockDetails] = useState({});

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
      } else throw new Error(response.data.errorMsg);
    } catch (err) {
      console.log('ERROR -> ', err.message);
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    fetchStockDetails();
  }, []);

  return (
    <div className={styles.details}>
      <h2>DETALLES {stockDetails.stockNro}</h2>
      <div className={styles.errorMsg}>{errorMsg}</div>
      {stockDetails && (
        <div className={styles.details__body}>
          <div className={styles.details__grid_left}>
            <div className={`${styles.details__body_compra} ${styles.grid}`}>
              <div className={styles['details__grid-title']}>DATOS COMPRA</div>

              <div>Fecha Compra</div>
              <div>
                {stockDetails.compra &&
                  new Date(stockDetails.compra.fecha).toLocaleDateString()}
              </div>

              <div>Peso Compra</div>
              <div>
                {stockDetails.compra && stockDetails.compra.peso.peso} Kgs
              </div>

              <div>Precio Por Peso</div>
              <div>$ {stockDetails.compra && stockDetails.compra.precio}</div>

              <div>Precio Total</div>
              <div>
                ${' '}
                {stockDetails.compra &&
                  stockDetails.compra.precio_total.toFixed(2)}
              </div>

              <div>Reposicion</div>
              <div>
                {stockDetails.reposicion && stockDetails.reposicion.stockNro}
              </div>
            </div>
            {stockDetails.venta && (
              <div className={`${styles.details__body_venta} ${styles.grid}`}>
                <div className={styles['details__grid-title']}>DATOS VENTA</div>

                <div>Fecha Venta</div>
                <div>
                  {stockDetails.venta &&
                    new Date(stockDetails.venta.fecha).toLocaleDateString()}
                </div>

                <div>Dias Transcurridos</div>
                <div>{stockDetails.venta.dias}</div>

                <div>Peso Salida</div>
                <div>
                  {stockDetails.venta && stockDetails.venta.peso.peso} Kgs
                </div>

                <div>P/Dia Aumento</div>
                <div>
                  {stockDetails.venta &&
                    stockDetails.venta.aumentoPorDia.toFixed(2) + ' Kgs'}
                </div>

                <div>Precio Por Peso</div>
                <div>$ {stockDetails.venta && stockDetails.venta.precio}</div>

                <div>Precio Total Venta</div>
                <div>
                  ${' '}
                  {stockDetails.venta &&
                    stockDetails.venta.precio_total.toFixed(2)}
                </div>
              </div>
            )}
          </div>
          <div className={styles.details__grid_right}>
            {stockDetails.venta && (
              <div className={`${styles.details__body_peso} ${styles.grid}`}>
                <div className={styles['details__grid-title']}>GANACIA</div>

                <div>INVERSIONISTA</div>
                <div></div>

                <div>FINCA</div>
                <div></div>
              </div>
            )}
            <div className={`${styles.details__body_peso} ${styles.grid_peso}`}>
              <div className={styles['details__grid-title']}>PESOS</div>
              {stockDetails.pesos &&
                stockDetails.pesos.length &&
                stockDetails.pesos.map((peso) => (
                  <Fragment key={peso._id}>
                    <div>{new Date(peso.fecha).toLocaleDateString()}</div>
                    <div>{peso.peso} Kgs.</div>
                    <div>{peso.tipo}</div>
                  </Fragment>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDetails;
