import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext.js";

export const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useUser();
  const [newImageUrl, setNewImageUrl] = useState("");
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!user) {
      const savedUser = localStorage.getItem("user_data");
      if (!savedUser) {
        navigate("/store/login", { replace: true });
      }
    }
  }, [user, navigate]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    const centerX = bounds.width / 2;
    const centerY = bounds.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const handleLogOut = () => {
    logout();
    navigate("/store/login", { replace: true });
  };

  const handleUpdateImage = async () => {
    if (!newImageUrl.trim() || !user) return;

    try {
      const response = await fetch("http://localhost:5000/store/update-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: user.id,
          image: newImageUrl,
        }),
      });

      const data = await response.json();

      if (data.status === "success") {
        updateUser({
          ...user,
          image: data.image,
        });

        setNewImageUrl("");
        alert("Image updated!");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        <div className="md:w-1/3 bg-black p-10 flex flex-col items-center justify-center text-white">
          <div
            className="relative cursor-pointer"
            style={{ perspective: "1000px" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img
              src={user.image || "https://via.placeholder.com/150"}
              alt="Profile"
              className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-2xl transition-transform duration-150 ease-out"
              style={{
                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(1.05)`,
                transformStyle: "preserve-3d",
              }}
            />

            <div
              className="absolute inset-0 rounded-full pointer-events-none opacity-30 transition-opacity duration-500"
              style={{
                background: `radial-gradient(circle at ${rotation.y * 5 + 50}% ${rotation.x * 5 + 50}%, white, transparent)`,
              }}
            />
          </div>

          <div className="mt-8 w-full space-y-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 text-center font-bold">
              Change Avatar URL
            </p>
            <input
              type="text"
              placeholder="Paste image link..."
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 text-white text-xs p-3 rounded-lg focus:outline-none focus:border-white transition-colors"
            />
            <button
              onClick={handleUpdateImage}
              className="w-full py-3 bg-white text-black text-[10px] uppercase font-bold tracking-widest hover:bg-gray-200 transition-colors rounded-lg"
            >
              Update Photo
            </button>
          </div>
        </div>

        <div className="md:w-2/3 p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-5xl font-light tracking-tighter text-gray-900 capitalize">
                  {user.user}
                </h1>
                <p className="text-gray-400 text-xs uppercase tracking-[0.3em] mt-2 font-medium">
                  Verified Customer
                </p>
              </div>
              <button
                onClick={handleLogOut}
                className="px-6 py-2 border-2 border-red-500 text-red-500 text-[10px] uppercase font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all rounded-full"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
