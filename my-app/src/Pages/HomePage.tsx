import { useNavigate } from "react-router-dom";
import fmfLogo from '../assets/logo.jpg'; // Adjust path to where you save the logo

function HomePage() {
    const navigate = useNavigate();

    return (
        <div style={{
            minHeight: '100vh',
            height: '100vh',
            width: '100vw',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            margin: 0,
            position: 'fixed',
            top: 0,
            left: 0,
            overflow: 'hidden'
        }}>
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '60px',
                maxWidth: '1400px',
                width: '100%',
                alignItems: 'center'
            }}>
                {/* Left side - Logo and branding */}
                <div style={{
                    textAlign: 'center',
                    padding: '40px'
                }}>
                    <img 
                        src={fmfLogo} 
                        alt="Find My Festie Logo" 
                        style={{
                            width: '350px',
                            height: '350px',
                            marginBottom: '40px',
                            filter: 'drop-shadow(0 10px 30px rgba(102, 126, 234, 0.5))',
                            animation: 'float 3s ease-in-out infinite'
                        }}
                    />
                    
                    <h1 style={{
                        fontSize: '72px',
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '20px',
                        fontFamily: 'Arial, sans-serif',
                        letterSpacing: '2px'
                    }}>
                        Find My Festie
                    </h1>
                    
                    <p style={{
                        fontSize: '24px',
                        color: '#b8b8d1',
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: '300'
                    }}>
                        Festival Analytics & Insights Platform
                    </p>
                </div>

                {/* Right side - Dashboard cards */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '30px'
                }}>
                    {/* Crowd Dashboard Card */}
                    <div 
                        onClick={() => navigate("/CrowdDashboard")}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(102, 126, 234, 0.3)',
                            borderRadius: '20px',
                            padding: '40px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(10px)';
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                    >
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '20px'
                        }}>📊</div>
                        <h2 style={{
                            fontSize: '32px',
                            color: 'white',
                            marginBottom: '15px',
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: '600'
                        }}>
                            Crowd Heatmap Dashboard
                        </h2>
                        <p style={{
                            fontSize: '16px',
                            color: '#b8b8d1',
                            lineHeight: '1.6',
                            fontFamily: 'Arial, sans-serif'
                        }}>
                            Real-time crowd density tracking, attendee flow analysis, and peak time identification across the festival grounds
                        </p>
                        <div style={{
                            marginTop: '20px',
                            color: '#667eea',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            View Dashboard →
                        </div>
                    </div>

                    {/* Sales Dashboard Card */}
                    <div 
                        onClick={() => navigate("/SalesDashboard")}
                        style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(10px)',
                            border: '2px solid rgba(118, 75, 162, 0.3)',
                            borderRadius: '20px',
                            padding: '40px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateX(10px)';
                            e.currentTarget.style.borderColor = '#764ba2';
                            e.currentTarget.style.background = 'rgba(118, 75, 162, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateX(0)';
                            e.currentTarget.style.borderColor = 'rgba(118, 75, 162, 0.3)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                    >
                        <div style={{
                            fontSize: '48px',
                            marginBottom: '20px'
                        }}>💰</div>
                        <h2 style={{
                            fontSize: '32px',
                            color: 'white',
                            marginBottom: '15px',
                            fontFamily: 'Arial, sans-serif',
                            fontWeight: '600'
                        }}>
                            Sales Dashboard
                        </h2>
                        <p style={{
                            fontSize: '16px',
                            color: '#b8b8d1',
                            lineHeight: '1.6',
                            fontFamily: 'Arial, sans-serif'
                        }}>
                            Track revenue, product performance, and sales trends to optimize vendor operations and maximize festival profitability
                        </p>
                        <div style={{
                            marginTop: '20px',
                            color: '#764ba2',
                            fontSize: '16px',
                            fontWeight: '600'
                        }}>
                            View Dashboard →
                        </div>
                    </div>
                </div>
            </div>

            {/* Add floating animation */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                
                body {
                    margin: 0;
                    padding: 0;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
}

export default HomePage;