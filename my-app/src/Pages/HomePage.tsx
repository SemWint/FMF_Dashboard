import { useNavigate } from "react-router-dom";


function HomePage() {
    const navigate = useNavigate();

    return (
        <div>
            <button onClick={() => navigate("/dashboard")}>
                Go to Dashboard
            </button>
        </div>
    );
}

export default HomePage;