export const Info = ({ userData }: any) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-slate-900">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
                <p className="text-slate-400 text-xs uppercase font-bold">Current Balance</p>
                <h3 className="text-3xl font-mono text-green-400 mt-2">
                    ${parseFloat(userData?.balance || 0).toLocaleString()}
                </h3>
                <p className="text-slate-500 text-[10px] mt-1 italic">Synced with DB</p>
            </div>

            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 col-span-2">
                <p className="text-slate-400 text-xs uppercase font-bold">Active Session</p>
                <div className="mt-3">
                    <span className="text-blue-400 font-mono text-xs block truncate">
                        Token: {localStorage.getItem("bank_token")}
                    </span>
                    <span className="text-slate-500 text-xs mt-2 block">
                        User ID: {userData?.id} | Username: {userData?.user}
                    </span>
                </div>
            </div>
        </div>
    );
};