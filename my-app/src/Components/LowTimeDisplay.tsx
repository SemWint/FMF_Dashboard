import React from 'react';

type Arrival = {
    time: string; // e.g., "09:00"
};

type PeakTimeDisplayProps = {
    arrivals: Arrival[];
};

function getLowTime(arrivals: Arrival[]): [string | null, number] {
    if (arrivals.length === 0) return [null, 0];
    const countMap: Record<string, number> = {};
    arrivals.forEach(({ time }) => {
        countMap[time] = (countMap[time] || 0) + 1;
    });
    let lowTime = '';
    let minCount = Infinity;
    Object.entries(countMap).forEach(([time, count]) => {
        if (count < minCount) {
            minCount = count;
            lowTime = time;
        }
    });
    return [lowTime, minCount];
}

const LowTimeDisplay: React.FC<PeakTimeDisplayProps> = ({ arrivals }) => {
    const [lowTime, count] = getLowTime(arrivals);
    return (
        <div style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: 8, background: '#fff' }}>
            <div style={{ fontSize: 16, color: '#888', marginBottom: 8 }}>Low Arrival Time</div>
            {lowTime ? (
                <div style={{ fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                    Least people arrived around <strong>{lowTime}</strong> ({count} arrivals)
                </div>
            ) : (
                <p>No arrival data available.</p>
            )}
        </div>
    );
};

export default LowTimeDisplay;