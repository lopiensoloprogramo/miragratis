import { useState } from "react";

const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby4i1oBBtaBZwc9YhocGBXn28M1Ymm-7GDrpkoEBZxmQ5UsSjx_pZQQzTUpd31Hq-8wkw/exec";

export default function MovieRequest() {
  const [movie, setMovie] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

 const sendRequest = async () => {
  if (!movie.trim()) {
    setMessage("Escribe el nombre de una película o serie.");
    return;
  }

  try {
    setLoading(true);
    setMessage("");

    await fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: JSON.stringify({
        movie: movie.trim(),
      }),
    });

    setMessage("✅ Solicitud enviada correctamente.");
    setMovie("");

  } catch (error) {
    console.error(error);
    setMessage("❌ No se pudo enviar la solicitud.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "40px auto",
        padding: "25px",
        borderRadius: "12px",
        background: "#1e1e1e",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h2>🎬 Solicita una película o serie</h2>

      <p style={{ color: "#aaa" }}>
        Si no encuentras una película o serie, puedes solicitarla aquí.
      </p>

      <input
        type="text"
        value={movie}
        onChange={(e) => setMovie(e.target.value)}
        placeholder="Ej: Superman 2025"
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "none",
          marginTop: "15px",
          boxSizing: "border-box",
          color:"#2a2a2a"
        }}
      />

      <button
        onClick={sendRequest}
        disabled={loading}
        className="
          w-full mt-5 py-3
          bg-red-600 hover:bg-red-700
          text-white font-bold text-lg
          rounded-xl
          shadow-lg shadow-red-600/30
          transition-all duration-300
          hover:scale-[1.02]
          disabled:opacity-50
        "
      >
        {loading ? "⏳ Enviando..." : "🎬 Solicitar película"}
      </button>

      {message && (
        <p style={{ marginTop: "15px" }}>
          {message}
        </p>
      )}
    </div>
  );
}