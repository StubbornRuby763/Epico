import { useState, useEffect } from "react"; 

interface Stock {
    symbol: string;
    price: number;
    change: number;
}

const STOCKS: Stock[] = [
    { symbol: "BTC/USD", price: 65200, change: 2.5 },
    { symbol: "ETH/USD", price: 3450, change: -1.2 },
    { symbol: "FAKE/BANK", price: 120.5, change: 15.8 },
    { symbol: "GOLD", price: 2350, change: 0.4 }
];

export const ValueBolse = () => {
    const [marketData, setMarketData] = useState<Stock[]>(STOCKS);

    useEffect(() => {
        const interval = setInterval(() => {
            setMarketData(prev => prev.map((stock: Stock) => ({
                ...stock,
                price: stock.price + (Math.random() - 0.5) * 10,
                change: stock.change + (Math.random() - 0.5)
            })));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl mt-6 text-white">
            <h3 className="font-bold mb-4">Market</h3>
            {marketData.map((stock: Stock) => (
                <div key={stock.symbol} className="flex justify-between border-b border-slate-700 py-2">
                    <span>{stock.symbol}</span>
                    <span className={stock.change >= 0 ? "text-green-500" : "text-red-500"}>
                        {stock.price.toFixed(2)} ({stock.change.toFixed(2)}%)
                    </span>
                </div>
            ))}
        </div>
    );
};
