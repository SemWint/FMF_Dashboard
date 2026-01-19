import React from 'react';

type Trend = 'up' | 'down' | 'neutral';

interface SimpleNumberWidgetProps {
    title: string;
    number: number;
    trend?: Trend;
}

const getTrendIcon = (trend: Trend) => {
    switch (trend) {
        case 'up':
            return <span style={{ color: 'green' }}>▲</span>;
        case 'down':
            return <span style={{ color: 'red' }}>▼</span>;
        default:
            return <span style={{ color: 'gray' }}>●</span>;
    }
};

const SimpleNumberWidget: React.FC<SimpleNumberWidgetProps> = ({
    title,
    number,
    trend = 'neutral',
}) => (
    <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: 8,
        padding: 16,
        width: 200,
        textAlign: 'center',
        background: '#fff',
        maxHeight: '120px',
    }}>
        <div style={{ fontSize: 16, color: '#888', marginBottom: 8 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8, color: '#333' }}>
            {number}
        </div>
        <div>
            {getTrendIcon(trend)}
        </div>
    </div>
);

export default SimpleNumberWidget;