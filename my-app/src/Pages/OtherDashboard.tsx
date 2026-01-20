import React, { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import SimpleNumberWidget from "../Components/SimpleNumberWidget";
import DatePickerCustom from "../Components/DatePickerCustom";
import Papa from "papaparse";
import { useNavigate } from "react-router-dom";
import { divIcon } from "leaflet";

// Dummy product sales data for fallback/demo
const dummySales = [
    { product: "Beer", sold: 1100, revenue: 4800, date: "2026-01-19" },
    { product: "Soda", sold: 800, revenue: 2400, date: "2026-01-19" },
    { product: "Burger", sold: 350, revenue: 3150, date: "2026-01-19" },
    { product: "Fries", sold: 500, revenue: 1500, date: "2026-01-19" },
    { product: "T-Shirt", sold: 90, revenue: 1350, date: "2026-01-19" },
    { product: "Water", sold: 600, revenue: 1200, date: "2026-01-19" },
    { product: "Beer", sold: 1000, revenue: 4000, date: "2026-01-18" },
    { product: "Soda", sold: 200, revenue: 600, date: "2026-01-18" },
    { product: "Burger", sold: 120, revenue: 1080, date: "2026-01-18" },
    { product: "Fries", sold: 600, revenue: 1800, date: "2026-01-18" },
    { product: "T-Shirt", sold: 300, revenue: 4500, date: "2026-01-18" },
    { product: "Water", sold: 1200, revenue: 2400, date: "2026-01-18" },
];

function OtherDashboard() {
    const navigate = useNavigate();
    const [date, setDate] = useState("2026-01-19");
    const [allSalesData, setAllSalesData] = useState(dummySales); // Store all data
    const [salesData, setSalesData] = useState(dummySales); // Filtered data for display

    useEffect(() => {
        fetch("../../data/sales_data.csv")
            .then((res) => res.text())
            .then((csvText) => {
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        if (results.data && results.data.length > 0) {
                            setAllSalesData(results.data);
                        } else {
                            console.warn("No data found in sales CSV, using dummy data.");
                        }
                    },
                });
            })
            .catch(() => setAllSalesData(dummySales));
    }, []);

    // Filter data whenever date or allSalesData changes
    useEffect(() => {
        const filtered = allSalesData.filter(item => {
            // Adjust the field name to match your CSV (e.g., item.date, item.Date, item.transaction_date)
            const itemDate = item.date || item.Date || item.DATE;
            return itemDate === date;
        });
        setSalesData(filtered);
    }, [date, allSalesData]);

    // Calculate total revenue and items sold
    const totalRevenue = salesData.reduce((sum, item) => sum + (item.revenue || 0), 0);
    const totalItems = salesData.reduce((sum, item) => sum + (item.sold || 0), 0);

    // Find best seller
    const bestSeller = salesData.reduce(
        (max, item) => (item.sold > (max?.sold || 0) ? item : max),
        salesData[0]
    );

    // Find lowest seller
    const lowestSeller = salesData.reduce(
        (min, item) => (item.sold < (min?.sold || Infinity) ? item : min),
        salesData[0]
    );

    return (
        <>
            <button onClick={() => navigate("/")}>
                Go To Home Page
            </button>
            <div className={styles.dashcontainer}>
                <div className={styles.horizontalContainer}>
                    <DatePickerCustom
                        label="Select a date"
                        value={date}
                        onChange={setDate}
                        min="2025-01-01"
                        max="2027-12-31"
                        helperText="Pick any date in range."
                    />
                    <div className={styles.verticalContainer}>
                        <div className={styles.horizontalContainer}>
                            <SimpleNumberWidget title="Total Revenue (€)" number={totalRevenue} trend="up" />
                            <SimpleNumberWidget title="Total Items Sold" number={totalItems} trend="up" />
                            <SimpleNumberWidget title={"Best Seller: " + (bestSeller?.product || "N/A")} number={bestSeller?.sold || 0} trend="up"/>
                            <SimpleNumberWidget title={"Lowest Seller: " + (lowestSeller?.product || "N/A")} number={lowestSeller?.sold || 0} trend="down"/>
                        </div>
                        <div style={{ marginTop: 32 }}>
                            <h3 style={{color: '#333'}}>Sales Breakdown</h3>
                            <table style={{ width: "100%", borderCollapse: "collapse", color: "#333" }}>
                                <thead>
                                    <tr>
                                        <th style={{ textAlign: "left", padding: 8, color: '#131313' }}>Product</th>
                                        <th style={{ textAlign: "right", padding: 8, color: '#131313' }}>Sold</th>
                                        <th style={{ textAlign: "right", padding: 8, color: '#131313' }}>Revenue (€)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesData.length > 0 ? (
                                        salesData.map((item, index) => (
                                            <tr key={index}>
                                                <td style={{ padding: 8, color: '#242424' }}>{item.product}</td>
                                                <td style={{ textAlign: "right", padding: 8, color: '#242424' }}>{item.sold}</td>
                                                <td style={{ textAlign: "right", padding: 8, color: '#242424' }}>{item.revenue}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} style={{ padding: 8, textAlign: "center", color: '#666' }}>
                                                No sales data for this date
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default OtherDashboard;