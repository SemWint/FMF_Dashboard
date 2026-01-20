import { useNavigate } from "react-router-dom";


function HomePage() {
    const navigate = useNavigate();

    return (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '50px'}}>
            <button onClick={() => navigate("/CrowdDashboard")}>
                Go to Heatmap Dashboard
            </button>
            <button onClick={() => navigate("/SalesDashboard")}>
                Go to Sales Dashboard
            </button>
        </div>
    );
}

export default HomePage;