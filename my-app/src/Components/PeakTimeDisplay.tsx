import React from 'react';

type Arrival = {
    time: string; // e.g., "09:00"
};

type PeakTimeDisplayProps = {
    arrivals: Arrival[];
};

function getPeakTime(arrivals: Arrival[]): [string | null, number] {
    if (arrivals.length === 0) return [null, 0];
    const countMap: Record<string, number> = {};
    arrivals.forEach(({ time }) => {
        countMap[time] = (countMap[time] || 0) + 1;
    });
    let peakTime = '';
    let maxCount = 0;
    Object.entries(countMap).forEach(([time, count]) => {
        if (count > maxCount) {
            maxCount = count;
            peakTime = time;
        }
    });
    return [peakTime, maxCount];
}

const PeakTimeDisplay: React.FC<PeakTimeDisplayProps> = ({ arrivals }) => {
    const [peakTime, count] = getPeakTime(arrivals);
    return (
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: 8, background: '#fff' }}>
            <div style={{ fontSize: 16, color: '#888', marginBottom: 8 }}>Peak Arrival Time</div>
            {peakTime ? (
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                    Most people arrived around <strong>{peakTime}</strong> ({count} arrivals)
                </div>
            ) : (
                <p>No arrival data available.</p>
            )}
        </div>
    );
};

export default PeakTimeDisplay;