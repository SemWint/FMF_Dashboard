import React, { useState, useEffect } from 'react';
import PictureHeatmap from "../Components/PictureHeatmap";
import festivalMap from '../assets/festival_map.jpg';
import Papa from 'papaparse';
import styles from './Dashboard.module.css';
import SimpleNumberWidget from '../Components/SimpleNumberWidget';
import PeakTimeDisplay from '../Components/PeakTimeDisplay';
import LowTimeDisplay from '../Components/LowTimeDisplay';
import TimeRangeSlider from '../Components/TimeRangeSlider';
import DatePickerCustom from '../Components/DatePickerCustom';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    const [range, setRange] = useState({ startMinutes: 8 * 60, endMinutes: 18 * 60 });
    const [allLocationData, setAllLocationData] = useState([]); // Store all CSV data
    const [filteredLocationData, setFilteredLocationData] = useState([]); // Filtered data for display
    const [date, setDate] = useState("2026-01-19");

    // Load CSV data on mount
    useEffect(() => {
        fetch('../../data/output.csv')
            .then(response => response.text())
            .then(csvText => {
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setAllLocationData(results.data);
                    }
                });
            })
            .catch(error => console.error('Error loading CSV:', error));
    }, []);

    // Filter data whenever date or time range changes
    useEffect(() => {
        if (allLocationData.length === 0) return;

        const filtered = allLocationData.filter(row => {
            // Parse the timestamp from the CSV
            // Assuming format: "2024-01-19 10:20:00" or similar
            const timestampStr = row.timestamp || row.Timestamp || row.time;
            if (!timestampStr) return false;
            
            const timestamp = new Date(timestampStr);
            
            // Check if date matches
            const rowDate = timestamp.toISOString().split('T')[0];
            if (rowDate !== date) return false;

            // Check if time is within range
            const rowMinutes = timestamp.getHours() * 60 + timestamp.getMinutes();
            if (rowMinutes < range.startMinutes || rowMinutes > range.endMinutes) return false;

            return true;
        });

        // Convert to heatmap format
        const heatmapData = filtered.map(row => ({
            latitude: row.lat || row.latitude,
            longitude: row.lng || row.longitude || row.lon,
            intensity: row.intensity || 0.1
        }));

        setFilteredLocationData(heatmapData);
    }, [allLocationData, date, range]);

    // Generate time data from CSV for arrivals
    const getTimeData = () => {
        if (allLocationData.length === 0) return [];

        // Group arrivals by unique ID and their first timestamp for the selected date
        const arrivals = {};
        
        allLocationData.forEach(row => {
            const timestampStr = row.timestamp || row.Timestamp || row.time;
            if (!timestampStr) return;
            
            const timestamp = new Date(timestampStr);
            const rowDate = timestamp.toISOString().split('T')[0];
            
            // Only include data for selected date
            if (rowDate === date) {
                const id = row.id || row.ID;
                const timeStr = `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}`;
                
                // Track first arrival time for each ID
                if (!arrivals[id] || new Date(arrivals[id].fullTimestamp) > timestamp) {
                    arrivals[id] = {
                        time: timeStr,
                        day: rowDate,
                        fullTimestamp: timestampStr
                    };
                }
            }
        });

        // Convert to array format
        return Object.values(arrivals).map(arrival => ({
            time: arrival.time,
            day: arrival.day
        }));
    };

    // Calculate statistics from filtered data
    const getStats = () => {
        // Get unique IDs within the time range
        const uniqueIds = new Set();
        
        allLocationData.forEach(row => {
            const timestampStr = row.timestamp || row.Timestamp || row.time;
            if (!timestampStr) return;
            
            const timestamp = new Date(timestampStr);
            const rowDate = timestamp.toISOString().split('T')[0];
            const rowMinutes = timestamp.getHours() * 60 + timestamp.getMinutes();
            
            if (rowDate === date && 
                rowMinutes >= range.startMinutes && 
                rowMinutes <= range.endMinutes) {
                const id = row.id || row.ID;
                if (id) uniqueIds.add(id);
            }
        });

        const totalAttendees = uniqueIds.size || filteredLocationData.length;

        return {
            totalAttendees: totalAttendees,
            // These would need actual data fields in your CSV
            // For now using proportions
            female: Math.floor(totalAttendees * 0.4),
            male: Math.floor(totalAttendees * 0.54),
            other: Math.floor(totalAttendees * 0.06)
        };
    };

    const stats = getStats();
    const timeData = getTimeData();

    return (
        <>
            <button onClick={() => navigate("/")}>
                Go To Home Page
            </button>
            <div className={styles.dashcontainer}>
                <div className={styles.horizontalWidgetContainer}>
                    <a>Festival density heatmap</a>
                
                    <PictureHeatmap
                        imageUrl={festivalMap}
                        imageWidth={1200}
                        imageHeight={800}
                        data={filteredLocationData}
                        imageBounds={{
                            north: 52.1354,
                            south: 52.1325,
                            east: 5.1462,
                            west: 5.1415
                        }}
                        radius={40}
                        blur={20}
                        opacity={0.6}
                        maxDisplaySize={800}
                        showControls={false}
                    />
                    <TimeRangeSlider
                        label="Select Time Range"
                        stepMinutes={15}
                        value={range}
                        onChange={setRange}
                        format="24h"
                    />
                    <DatePickerCustom
                        label="Select a date"
                        value={date}
                        onChange={setDate}
                        min="2025-01-01"
                        max="2027-12-31"
                        helperText="Pick any date in range."
                    />
                </div>
                <div className={styles.horizontalContainer}>
                    <SimpleNumberWidget title="Total Attendees" number={stats.totalAttendees} trend="up" />
                    <SimpleNumberWidget title="Female" number={stats.female} trend="neutral" />
                    <SimpleNumberWidget title="Male" number={stats.male} trend="up" />
                    <SimpleNumberWidget title="Other" number={stats.other} trend="down" />
                </div>
                <SimpleNumberWidget title="Amount of friends found" number={Math.floor(stats.totalAttendees * 0.14)} trend="up" />
                <div className={styles.horizontalContainer}>
                    <PeakTimeDisplay arrivals={timeData} />
                    <LowTimeDisplay arrivals={timeData} />
                </div>
                <SimpleNumberWidget title="Active FMF's" number={Math.floor(stats.totalAttendees * 0.77)} trend="up" />
            </div>
        </>
    );
}

export default Dashboard;