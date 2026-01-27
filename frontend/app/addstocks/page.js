"use client";
import React, { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import DashboardLayout from "../partials/DashboardLayout";


export default function AddStocksPage() {
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    brand: "",
    ItemClass: "",
    type: "",
    category: "",
    supplier: "",
    unitPrice: "",
    dateAdded: "",
    lastUpdated: ""
  });
  const [message, setMessage] = useState("");

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/stocks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Stock added!");
        setForm({
          name: "",
          quantity: "",
          brand: "",
          ItemClass: "",
          type: "",
          category: "",
          supplier: "",
          unitPrice: "",
          dateAdded: "",
          lastUpdated: ""
        });
      } else {
        setMessage(data.error || "Failed to add stock.");
      }
    } catch {
      setMessage("Error connecting to server.");
    }
  };

  const pageContent = (
    <div className="page">
      <main className="main">
        <div className="intro">
          <h2>Add New Stocks</h2>
          {message && <div style={{ marginBottom: "10px", color: "green" }}>{message}</div>}
        </div>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "440px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="name">Stock Name:</label>
            <input type="text" id="name" name="name" value={form.name} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="quantity">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="0"
              step="1"
              value={form.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="ItemClass">Class:</label>
            <input
              type="text"
              id="ItemClass"
              name="ItemClass"
              value={form.ItemClass}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="type">Type:</label>
            <input type="text" id="type" name="type" value={form.type} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="category">Category:</label>
            <input type="text" id="category" name="category" value={form.category} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="supplier">Supplier:</label>
            <input type="text" id="supplier" name="supplier" value={form.supplier} onChange={handleChange} required />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="unitPrice">Unit Price:</label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              min="0"
              step="0.01"
              value={form.unitPrice}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="dateAdded">Date Added:</label>
            <input
              type="date"
              id="dateAdded"
              name="dateAdded"
              value={form.dateAdded}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="lastUpdated">Last Updated:</label>
            <input
              type="date"
              id="lastUpdated"
              name="lastUpdated"
              value={form.lastUpdated}
              onChange={handleChange}
              required
            />
          </div>
          <div className="ctas">
            <button type="submit" className="primary ctaButton">
              Add Stock
            </button>
          </div>
        </form>
      </main>
    </div>
  );

  return <DashboardLayout activePage="addstocks">{pageContent}</DashboardLayout>;
}
