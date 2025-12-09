"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../partials/navbar";

export default function MovementPage() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the "Move Product" Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [moveForm, setMoveForm] = useState({
    type: "Transfer", // "Transfer" or "Shipment"
    toLocation: "",
    quantity: 1,
    notes: ""
  });

  // 1. Fetch Data
  useEffect(() => {
    fetch('http://localhost:4000/api/stocks')
      .then(res => res.json())
      .then(data => {
        // NOTE: If your DB doesn't have a 'Location' field yet, 
        // we default to 'Main Warehouse' for display purposes.
        const dataWithLocation = data.map(item => ({
            ...item,
            Location: item.Location || "Zone A - Arrival" 
        }));
        setStocks(dataWithLocation);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error:", err);
        setLoading(false);
      });
  }, []);

  // 2. Handle Opening the Move Modal
  const handleOpenMove = (item) => {
    setSelectedItem(item);
    setMoveForm({ type: "Transfer", toLocation: "", quantity: 1, notes: "" });
    setShowModal(true);
  };

  // 3. Handle Submit Movement (Product Movement Support)
  const handleSubmitMove = async (e) => {
    e.preventDefault();
    
    // In a real app, you would POST this to your API here.
    // Example: await fetch('/api/movement', { method: 'POST', body: ... })
    
    alert(`Successfully recorded: \nMoving ${moveForm.quantity} of ${selectedItem.ItemName} to ${moveForm.type === 'Shipment' ? 'Customer' : moveForm.toLocation}`);

    // Optimistically update UI to reflect change immediately
    const updatedStocks = stocks.map(stock => {
        if (stock.ItemID === selectedItem.ItemID) {
            // If shipment, reduce quantity. If transfer, update location.
            if (moveForm.type === 'Shipment') {
                return { ...stock, Quantity: stock.Quantity - parseInt(moveForm.quantity) };
            } else {
                return { ...stock, Location: moveForm.toLocation };
            }
        }
        return stock;
    });

    setStocks(updatedStocks);
    setShowModal(false);
  };

  return (
    <>
      <Navbar />
      <div className="page" style={{ width: "100%" }}>
        <main className="main" style={{ width: "100%", maxWidth: "100%", padding: "20px" }}>
          
          <div className="intro" style={{ marginBottom: "30px" }}>
            <h2 style={{ fontSize: "3rem", color: "#4e5dbdff" }}>Location & Movement</h2>
            <p style={{ marginTop: "10px", color: "#666", maxWidth: "600px" }}>
              <strong>Location Referencing:</strong> Track item storage locations.<br/>
              <strong>Movement Support:</strong> Record transfers between shelves or shipments.
            </p>
          </div>

          {/* Location Referencing Table */}
          <div style={{ width: "100%", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0, color: "#333" }}>Inventory Location Map</h3>
                <span style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "5px 10px", borderRadius: "15px", fontSize: "0.85rem" }}>
                    Live Tracking
                </span>
            </div>

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8f9fa" }}>
                            <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff" }}>Item Details</th>
                            <th style={{ textAlign: "left", padding: "16px", color: "#4e5dbdff" }}>Current Location</th>
                            <th style={{ textAlign: "center", padding: "16px", color: "#4e5dbdff" }}>Stock Level</th>
                            <th style={{ textAlign: "right", padding: "16px", color: "#4e5dbdff" }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                             <tr><td colSpan="4" style={{padding:"20px", textAlign:"center"}}>Loading inventory map...</td></tr>
                        ) : (
                            stocks.map(item => (
                                <tr key={item.ItemID || item._id} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "16px" }}>
                                        <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{item.ItemName}</div>
                                        <div style={{ fontSize: "0.85rem", color: "#888" }}>ID: {item.ItemID || "N/A"}</div>
                                    </td>
                                    
                                    {/* LOCATION REFERENCING */}
                                    <td style={{ padding: "16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={{ fontSize: "1.2rem" }}>📍</span> 
                                            <span style={{ fontWeight: "500", color: "#333" }}>{item.Location}</span>
                                        </div>
                                    </td>

                                    <td style={{ padding: "16px", textAlign: "center" }}>
                                        <span style={{ 
                                            padding: "6px 12px", 
                                            borderRadius: "20px", 
                                            backgroundColor: item.Quantity < 10 ? "#ffebee" : "#e3f2fd",
                                            color: item.Quantity < 10 ? "#c62828" : "#1565c0",
                                            fontWeight: "bold"
                                        }}>
                                            {item.Quantity} units
                                        </span>
                                    </td>

                                    {/* MOVEMENT SUPPORT */}
                                    <td style={{ padding: "16px", textAlign: "right" }}>
                                        <button 
                                            onClick={() => handleOpenMove(item)}
                                            style={{
                                                backgroundColor: "#4e5dbdff",
                                                color: "white",
                                                border: "none",
                                                padding: "8px 16px",
                                                borderRadius: "4px",
                                                cursor: "pointer",
                                                fontSize: "0.9rem"
                                            }}
                                        >
                                            Move / Ship
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
          </div>
        </main>

        {/* MOVEMENT MODAL */}
        {showModal && selectedItem && (
             <div style={{
                 position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                 backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
             }} onClick={() => setShowModal(false)}>
                 <div style={{
                     backgroundColor: "white", padding: "30px", borderRadius: "8px", width: "100%", maxWidth: "500px"
                 }} onClick={e => e.stopPropagation()}>
                     <h3 style={{ marginTop: 0, color: "#4e5dbdff" }}>Move Stock: {selectedItem.ItemName}</h3>
                     
                     <form onSubmit={handleSubmitMove}>
                        <div style={{ marginBottom: "15px" }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Movement Type</label>
                            <select 
                                style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                                value={moveForm.type}
                                onChange={e => setMoveForm({...moveForm, type: e.target.value})}
                            >
                                <option value="Transfer">Internal Transfer (Change Location)</option>
                                <option value="Shipment">Outbound Shipment (Reduce Stock)</option>
                            </select>
                        </div>

                        {moveForm.type === "Transfer" && (
                            <div style={{ marginBottom: "15px" }}>
                                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>New Location Reference</label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="e.g. Zone B - Shelf 4"
                                    style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                                    value={moveForm.toLocation}
                                    onChange={e => setMoveForm({...moveForm, toLocation: e.target.value})}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: "15px" }}>
                             <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Quantity to Move</label>
                             <input 
                                type="number" 
                                min="1" 
                                max={selectedItem.Quantity}
                                style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid #ddd" }}
                                value={moveForm.quantity}
                                onChange={e => setMoveForm({...moveForm, quantity: e.target.value})}
                             />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                            {/* EDITED CANCEL BUTTON STYLE BELOW */}
                            <button 
                                type="button"
                                onClick={() => setShowModal(false)}
                                style={{ 
                                    padding: "10px 20px", 
                                    border: "1px solid #666", // Darker border
                                    backgroundColor: "white", 
                                    color: "#333", // Explicit dark text
                                    borderRadius: "4px", 
                                    cursor: "pointer",
                                    fontWeight: "bold"
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                style={{ padding: "10px 20px", border: "none", backgroundColor: "#4e5dbdff", color: "white", borderRadius: "4px", cursor: "pointer" }}
                            >
                                Confirm Movement
                            </button>
                        </div>
                     </form>
                 </div>
             </div>
        )}

      </div>
    </>
  );
}