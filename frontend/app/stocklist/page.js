"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./listcss.module.css";
import Navbar from "../partials/navbar";

export default function StockListPage() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/stocks') // Point to your Express backend
      .then(res => res.json())
      .then(data => setStocks(data))
      .catch(() => setStocks([]));
  }, []);

  return (
    <>
      <Navbar />
      <div className={styles.stockPage}>
        <main className={styles.stockMain}>
          <div className={styles.stockIntro}>
            <h1>Our Stock List</h1>
          </div>
          <form action="/stocksearch" method="GET" className={styles.stockBtn}>
            <div className="input-group">
              <input type="text" className="form-control" placeholder="Search stocks..." name="search" />
              <button className="btn btn-outline-primary" type="submit">Search</button>
            </div>
          </form>
          <div className={styles.cardGrid}>
            {stocks.length === 0 ? (
              <div style={{ width: "100%", color: "#777", textAlign: "center" }}>
                No stocks to display.
              </div>
            ) : (
              stocks.map((stock) => (
                <div className={styles.cardCol} key={stock.ItemID}>
                  <div className={styles.stockCard}>
                    <div className={styles.stockImgWrap}>
                      <img
                        className={styles.stockImage}
                        src={`/images/${stock.image}`}
                        alt={`${stock.name} image`}
                      />
                    </div>
                    <div className={styles.stockCardBody}>
                      <div className={styles.stockCardTitle}>{stock.ItemName}</div>
                      <div className={styles.stockCardDesc}>
                        Quantity: {stock.Quantity}<br />
                        Brand: {stock.Brand}<br />
                        Class: {stock.ItemClass}<br />
                        Type: {stock.ItemType}<br />
                      </div>
                      <div className={styles.stockBtnBar}>
                        <div className="d-flex justify-content-between">
                          <Link href={`/stocklist/detail/${stock.ItemID}`} className={styles.stockBtn}>Detail</Link>
                        </div>
                        <div className="d-flex justify-content-between">
                          <button
                            type="button"
                            className="btn btn-dark btn-sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this product?')) {
                                fetch(`http://localhost:4000/api/stocks/${stock.ItemID}`, {
                                  method: 'DELETE'
                                  })
                                    .then(res => res.json())
                                    .then(() => {
                                        setStocks(prevStocks => prevStocks.filter(s => s.ItemID !== stock.ItemID));
                                    })
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </>
  );
}
