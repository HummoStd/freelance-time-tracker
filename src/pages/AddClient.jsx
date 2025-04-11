// ✅ ARCHIVO: src/pages/AddClient.jsx

import { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AddClient({ user }) {
  const [nombre, setNombre] = useState("");
  const [horasMensuales, setHorasMensuales] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tarifa, setTarifa] = useState("");
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      await addDoc(collection(db, "clientes"), {
        nombre,
        horasMensuales: parseFloat(horasMensuales),
        categoria,
        tarifa: parseFloat(tarifa),
        userId: user.uid,
        creado: serverTimestamp(),
      });

      setMensaje("✅ Cliente creado con éxito");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      setMensaje("❌ Error al guardar cliente");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Agregar cliente</h2>

        <input
          type="text"
          placeholder="Nombre del cliente"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="number"
          placeholder="Horas contratadas por mes"
          value={horasMensuales}
          onChange={(e) => setHorasMensuales(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="text"
          placeholder="Categoría (branding, contenido, etc.)"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          style={styles.input}
        />

        <input
          type="number"
          placeholder="Tarifa €/hora"
          value={tarifa}
          onChange={(e) => setTarifa(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" style={styles.button}>Guardar cliente</button>

        {mensaje && <p style={styles.mensaje}>{mensaje}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    background: "#f5f5f5",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
  form: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    width: "100%",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    background: "#6200ea",
    color: "white",
    fontSize: "1rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
  mensaje: {
    marginTop: "1rem",
    textAlign: "center",
    color: "#333",
  },
};