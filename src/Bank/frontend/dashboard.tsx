import { useState, useEffect } from "react";
import { createRoot } from 'react-dom/client';
import { Info } from "./components/Info.js";
import { TopUp } from"./components/Recargue.js" 
import { ValueBolse } from "./components/ValueBolse.js";

const DashBoard = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem("bank_token");
            const response = await fetch("http://localhost:3000/api/v1/user/profile", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            setUserData(data);
        } catch (err) {
            console.error("Error to load account");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    if (loading) return <div className="bg-slate-900 min-h-screen text-white p-10">loading Bank...</div>;

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Info userData={userData} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                <TopUp onRefresh={fetchUserData} />
                <ValueBolse />
            </div>
        </div>
    );
};

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<DashBoard />);
}