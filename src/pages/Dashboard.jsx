import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs
} from "firebase/firestore";

export default function Dashboard({ user }) {
  const [cliente, setCliente] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [resumen, setResumen] = useState({}); // ⬅️ cliente => total horas

  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");

    try {
      await addDoc(collection(db, "sesiones"), {
        cliente,
        proyecto,
        fecha,
        horas: parseFloat(horas),
        userId: user.uid,
        timestamp: serverTimestamp(),
      });

      setMensaje("✅ Sesión guardada correctamente");
      setCliente("");
      setProyecto("");
      setFecha("");
      setHoras("");
      obtenerResumen(); // ⬅️ actualiza después de guardar
    } catch (err) {
      console.error("Error al guardar sesión:", err);
      setMensaje("❌ Error al guardar la sesión");
    }
  };

  const obtenerResumen = async () => {
    try {
      const q = query(
        collection(db, "sesiones"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);

      const resumenTemp = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const cliente = data.cliente;
        const horas = data.horas;

        if (!resumenTemp[cliente]) resumenTemp[cliente] = 0;
        resumenTemp[cliente] += horas;
      });

      setResumen(resumenTemp);
    } catch (err) {
      console.error("Error al obtener resumen:", err);
    }
  };

  useEffect(() => {
    obtenerResumen();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Time Tracker</h1>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Cerrar sesión
        </button>
      </div>

      <div style={styles.card}>
        <h2 style={styles.title}>Hola, {user?.email}</h2>
        <p style={styles.text}>Registra tu tiempo de trabajo</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Nombre del cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="text"
            placeholder="Proyecto"
            value={proyecto}
            onChange={(e) => setProyecto(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="number"
            placeholder="Horas trabajadas"
            value={horas}
            onChange={(e) => setHoras(e.target.value)}
            style={styles.input}
            required
            min="0"
            step="0.1"
          />

          <button type="submit" style={styles.saveButton}>
            Guardar sesión
          </button>
        </form>

        {mensaje && (
          <p
            style={{
              marginTop: "1rem",
              color: mensaje.startsWith("✅") ? "green" : "red",
            }}
          >
            {mensaje}
          </p>
        )}

        <div style={{ marginTop: "2rem", textAlign: "left" }}>
          <h3 style={{ marginBottom: "0.5rem" }}>⏱️ Horas por cliente:</h3>
          {Object.keys(resumen).length === 0 && <p>No hay registros aún.</p>}
          {Object.entries(resumen).map(([cliente, horas]) => (
            <p key={cliente}>
              <strong>{cliente}:</strong> {horas.toFixed(2)} h
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    minHeight: "100vh",
    background: "#f5f5f5",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "2rem 1rem",
  },
  header: {
    width: "100%",
    maxWidth: "800px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  logo: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
  },
  logoutButton: {
    background: "#e53935",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    width: "100%",
    textAlign: "center",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    color: "#333",
  },
  text: {
    fontSize: "1rem",
    color: "#555",
    marginBottom: "1.5rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    borderRadius: "10px",
    border: "1px solid #ccc",
  },
  saveButton: {
    background: "#6200ea",
    color: "#fff",
    border: "none",
    padding: "0.75rem",
    borderRadius: "12px",
    fontSize: "1rem",
    cursor: "pointer",
  },
};
