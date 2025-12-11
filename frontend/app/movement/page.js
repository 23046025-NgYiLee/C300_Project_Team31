"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "../partials/DashboardLayout";
import styles from "../AdminDashboard/dashboard.module.css";

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

    // Fetch Data
    useEffect(() => {
        fetch('http://localhost:4000/api/stocks')
            .then(res => res.json())
            .then(data => {
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

    // Handle Opening the Move Modal
    const handleOpenMove = (item) => {
        setSelectedItem(item);
        setMoveForm({ type: "Transfer", toLocation: "", quantity: 1, notes: "" });
        setShowModal(true);
    };

    // Handle Submit Movement (Product Movement Support)
    const handleSubmitMove = async (e) => {
        e.preventDefault();

        try {
            // Get current user from localStorage
            const loggedUser = JSON.parse(localStorage.getItem("user"));
            const movedBy = loggedUser?.name || loggedUser?.email || "Unknown User";

            // Prepare movement data
            const movementData = {
                itemId: selectedItem.ItemID,
                movementType: moveForm.type,
                toLocation: moveForm.toLocation,
                quantity: parseInt(moveForm.quantity),
                movedBy: movedBy,
                notes: moveForm.notes || ''
            };

            // Call the backend API to record the movement
            const response = await fetch('http://localhost:4000/api/movements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movementData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to record movement');
            }

            // Show success message
            alert(`✓ Successfully recorded ${moveForm.type}:\n${moveForm.quantity} units of ${selectedItem.ItemName}\n${moveForm.type === 'Shipment' ? 'shipped to Customer' : `moved to ${moveForm.toLocation}`}`);

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

        } catch (error) {
            console.error('Error recording movement:', error);
            alert(`Error: ${error.message}\nPlease try again or contact support.`);
        }
    };

    return (
        <DashboardLayout activePage="movement">
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Location & Movement</h2>
            </div>

            <p style={{ marginBottom: "24px", color: "#666" }}>
                <strong>Location Referencing:</strong> Track item storage locations.
                <strong style={{ marginLeft: "16px" }}>Movement Support:</strong> Record transfers between shelves or shipments.
            </p>

            {/* Inventory Location Table */}
            <div className={styles.activityCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h3 className={styles.cardTitle} style={{ margin: 0 }}>Inventory Location Map</h3>
                    <span style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", padding: "6px 12px", borderRadius: "15px", fontSize: "0.85rem", fontWeight: 600 }}>
                        Live Tracking
                    </span>
                </div>

                {loading ? (
                    <p style={{ textAlign: "center", padding: "40px", color: "#78909c" }}>
                        Loading inventory map...
                    </p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: "2px solid #e0e0e0", backgroundColor: "#f9f9f9" }}>
                                    <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Item Details</th>
                                    <th style={{ textAlign: "left", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Current Location</th>
                                    <th style={{ textAlign: "center", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Stock Level</th>
                                    <th style={{ textAlign: "right", padding: "16px", color: "#2c3e50", fontWeight: 600 }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stocks.map(item => (
                                    <tr key={item.ItemID || item._id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ fontWeight: "600", fontSize: "0.95rem", color: "#2c3e50" }}>{item.ItemName}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#78909c", marginTop: "4px" }}>ID: {item.ItemID || "N/A"}</div>
                                        </td>

                                        {/* LOCATION REFERENCING */}
                                        <td style={{ padding: "16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <span style={{ fontSize: "1.1rem" }}>📍</span>
                                                <span style={{ fontWeight: "500", color: "#546e7a" }}>{item.Location}</span>
                                            </div>
                                        </td>

                                        <td style={{ padding: "16px", textAlign: "center" }}>
                                            <span style={{
                                                padding: "6px 12px",
                                                borderRadius: "20px",
                                                backgroundColor: item.Quantity < 10 ? "#ffebee" : "#e3f2fd",
                                                color: item.Quantity < 10 ? "#c62828" : "#1565c0",
                                                fontWeight: "600",
                                                fontSize: "0.85rem"
                                            }}>
                                                {item.Quantity} units
                                            </span>
                                        </td>

                                        {/* MOVEMENT SUPPORT */}
                                        <td style={{ padding: "16px", textAlign: "right" }}>
                                            <button
                                                onClick={() => handleOpenMove(item)}
                                                className={styles.newRequestBtn}
                                                style={{ fontSize: "0.9rem", padding: "8px 16px" }}
                                            >
                                                Move / Ship
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MOVEMENT MODAL */}
            {showModal && selectedItem && (
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{
                            backgroundColor: "white",
                            padding: "30px",
                            borderRadius: "12px",
                            width: "100%",
                            maxWidth: "500px",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h3 style={{ marginTop: 0, color: "#2c3e50", fontSize: "1.5rem" }}>Move Stock: {selectedItem.ItemName}</h3>

                        <form onSubmit={handleSubmitMove}>
                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>Movement Type</label>
                                <select
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #e0e0e0",
                                        fontSize: "0.95rem"
                                    }}
                                    value={moveForm.type}
                                    onChange={e => setMoveForm({ ...moveForm, type: e.target.value })}
                                >
                                    <option value="Transfer">Internal Transfer (Change Location)</option>
                                    <option value="Shipment">Outbound Shipment (Reduce Stock)</option>
                                </select>
                            </div>

                            {moveForm.type === "Transfer" && (
                                <div style={{ marginBottom: "20px" }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>New Location Reference</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Zone B - Shelf 4"
                                        style={{
                                            width: "100%",
                                            padding: "12px",
                                            borderRadius: "8px",
                                            border: "1px solid #e0e0e0",
                                            fontSize: "0.95rem"
                                        }}
                                        value={moveForm.toLocation}
                                        onChange={e => setMoveForm({ ...moveForm, toLocation: e.target.value })}
                                    />
                                </div>
                            )}

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#2c3e50" }}>Quantity to Move</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={selectedItem.Quantity}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid #e0e0e0",
                                        fontSize: "0.95rem"
                                    }}
                                    value={moveForm.quantity}
                                    onChange={e => setMoveForm({ ...moveForm, quantity: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{
                                        padding: "10px 20px",
                                        border: "1px solid #e0e0e0",
                                        backgroundColor: "white",
                                        color: "#546e7a",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "500",
                                        fontSize: "0.95rem"
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.newRequestBtn}
                                    style={{ padding: "10px 24px", fontSize: "0.95rem" }}
                                >
                                    Confirm Movement
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}