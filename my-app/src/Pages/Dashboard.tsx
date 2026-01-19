import React, { useState, useEffect } from 'react';
import PictureHeatmap from "../Components/PictureHeatmap";
import festivalMap from '../assets/festival_map.jpg';
import Papa from 'papaparse';

function Dashboard() {

    const [locationData, setLocationData] = useState([]);

    useEffect(() => {
        // Fetch CSV file from your assets or API
        fetch('../../data/output.csv') // or import it: import csvFile from '../assets/data.csv'
        .then(response => response.text())
        .then(csvText => {
            Papa.parse(csvText, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data.map(row => ({
                latitude: row.lat,
                longitude: row.lng,
                intensity: row.intensity || 0.1
                }));
                console.log(`Loaded ${data.length} points from CSV`);
                setLocationData(data);
            }
            });
        })
        .catch(error => console.error('Error loading CSV:', error));
    }, []);

    return (
        <PictureHeatmap
            imageUrl={festivalMap}
            imageWidth={1200}
            imageHeight={800}
            data={locationData}
            imageBounds={{
                north: 52.1354,
                south: 52.1313,
                east: 5.1463,
                west: 5.1401
            }}
            radius={40}
            blur={20}
            opacity={0.8}
            maxDisplaySize={1000}
            showControls={false}
        />
    );
}

export default Dashboard;