"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./listcss.module.css";
import Navbar from "../partials/navbar";

export default function StockListPage() {
  const [stocks, setStocks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterType, setFilterType] = useState("");
  const [minQuantity, setMinQuantity] = useState("");
  const [maxQuantity, setMaxQuantity] = useState("");

  // Filter options from backend
  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    classes: [],
    types: []
  });

  // Fetch filter options on mount
  useEffect(() => {
    fetch('http://localhost:4000/api/stocks/filters/values')
      .then(res => res.json())
      .then(data => setFilterOptions(data))
      .catch(err => console.error('Error fetching filter options:', err));
  }, []);

  // Fetch stocks with filters
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.append('search', searchTerm);
    if (filterBrand) params.append('brand', filterBrand);
    if (filterClass) params.append('class', filterClass);
    if (filterType) params.append('type', filterType);
    if (minQuantity) params.append('minQty', minQuantity);
    if (maxQuantity) params.append('maxQty', maxQuantity);

    const queryString = params.toString();
    const url = `http://localhost:4000/api/stocks${queryString ? '?' + queryString : ''}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setStocks(data))
      .catch(() => setStocks([]));
  }, [searchTerm, filterBrand, filterClass, filterType, minQuantity, maxQuantity]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setFilterBrand("");
    setFilterClass("");
    setFilterType("");
    setMinQuantity("");
    setMaxQuantity("");
  };

  return (
    <>
      <Navbar />
      <div className={styles.stockPage}>
        <main className={styles.stockMain}>
          <div className={styles.stockIntro}>
            <h1>Our Stock List</h1>
          </div>

          {/* Search Bar */}
          <div className={styles.searchSection}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, brand, class, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setSearchTerm("")}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Filter Section */}
          <div className={styles.filterSection}>
            <div className={styles.filterGrid}>
              <div className={styles.filterItem}>
                <label htmlFor="brandFilter">Brand</label>
                <select
                  id="brandFilter"
                  className="form-select"
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                >
                  <option value="">All Brands</option>
                  {filterOptions.brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="classFilter">Class</label>
                <select
                  id="classFilter"
                  className="form-select"
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="">All Classes</option>
                  {filterOptions.classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="typeFilter">Type</label>
                <select
                  id="typeFilter"
                  className="form-select"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="">All Types</option>
                  {filterOptions.types.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="minQty">Min Quantity</label>
                <input
                  id="minQty"
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={minQuantity}
                  onChange={(e) => setMinQuantity(e.target.value)}
                  min="0"
                />
              </div>

              <div className={styles.filterItem}>
                <label htmlFor="maxQty">Max Quantity</label>
                <input
                  id="maxQty"
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={maxQuantity}
                  onChange={(e) => setMaxQuantity(e.target.value)}
                  min="0"
                />
              </div>

              <div className={styles.filterItem} style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  className="btn btn-secondary w-100"
                  onClick={clearFilters}
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Results count */}
            <div className={styles.resultsCount}>
              Showing {stocks.length} item{stocks.length !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Stock Cards Grid */}
          <div className={styles.cardGrid}>
            {stocks.length === 0 ? (
              <div style={{ width: "100%", color: "#777", textAlign: "center", padding: "2rem" }}>
                No stocks match your search criteria.
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
