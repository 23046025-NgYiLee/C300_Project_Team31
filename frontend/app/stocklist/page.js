"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./listcss.module.css";
import Navbar from "../partials/navbar";
<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>


export default function StockListPage() {
  
  const [stocks, setStocks] = useState([
    // Example  data
    {
      Stockid: 1,
      name: "Roses",
      quantity: 50,
      brand: "FloralCo",
      class: "Premium",
      type: "Flower",
      price: 2.99,
      image: "rosa.jpg"
    },
    {
      Stockid: 2,
      name: "Tulips",
      quantity: 34,
      brand: "BotanicFarm",
      class: "Standard",
      type: "Flower",
      price: 1.89,
      image: "tulip.jpg"
    }

  ]);



  return (
    <>
      <Navbar />
      <div className={styles.stockPage}>
          <main className={styles.stockMain}>
            <div className={styles.stockIntro}>
              <h1>Our Stock List</h1>
            </div>
            <form
              action="/stocksearch"
              method="GET"
                className={styles.stockBtn}
            >
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
                  <div className={styles.cardCol} key={stock.Stockid}>
                    <div className={styles.stockCard}>
                      <div className={styles.stockImgWrap}>
                        
                        <img className={styles.stockImage} src="images/<%= flowers[i].image %>" alt="<%= flowers[i].name  %> image"></img>
                      </div>
                      <div className={styles.stockCardBody}>
                        <div className={styles.stockCardTitle}>{stock.name}</div>
                        <div className={styles.stockCardDesc}>
                          Quantity: {stock.quantity}<br />
                          Brand: {stock.brand}<br />
                          Class: {stock.class}<br />
                          Type: {stock.type}<br />
                          
                        </div>
                        <div className={styles.stockBtnBar}>
                            <div class="d-flex justify-content-between">
                                <a  href="/editstock"  className={styles.stockBtn}>Edit  detail</a>
                            </div>
                            
                            <div class="d-flex justify-content-between">
                                <a href="/deleteFlower/<%= flowers[i].Flowerid %>" class="btn btn-dark btn-sm" 
                                        onclick="return confirm('Are you sure you want to delete this product')">Delete</a>
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
