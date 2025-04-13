import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import QuickTimer from "../components/QuickTimer";

export default function Dashboard({ user }) {
  // Estados para el formulario de sesión y cliente
  const [cliente, setCliente] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [fecha, setFecha] = useState("");
  const [horas, setHoras] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [resumen, setResumen] = useState({});
  const [clientesList, setClientesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: "", horas: "", info: "", fee: false });

  // Función para cerrar sesión
  const handleLogout = () => {
    signOut(auth).catch((error) => {
      console.error("Error al cerrar sesión:", error);
    });
  };

  // Función para guardar la sesión de horas trabajadas
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
      obtenerResumen();
    } catch (err) {
      console.error("Error al guardar sesión:", err);
      setMensaje("❌ Error al guardar la sesión");
    }
  };

  // Función para obtener el resumen de horas trabajadas por cliente
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

  // Obtener los clientes al cargar el Dashboard
  useEffect(() => {
    obtenerResumen();
    obtenerClientes();
  }, []);

  // Función para obtener los clientes desde Firestore
  const obtenerClientes = async () => {
    try {
      const q = query(collection(db, "clientes"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);

      const clientes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientesList(clientes);
    } catch (err) {
      console.error("Error al obtener los clientes:", err);
    }
  };

  // Función para agregar un cliente nuevo
  const handleAddClient = async (e) => {
    e.preventDefault();
    if (!nuevoCliente.nombre || !nuevoCliente.horas) return;
    try {
      await addDoc(collection(db, "clientes"), {
        name: nuevoCliente.nombre,
        horasDisponibles: parseFloat(nuevoCliente.horas),
        info: nuevoCliente.info || "",
        fee: nuevoCliente.fee,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      setNuevoCliente({ nombre: "", horas: "", info: "", fee: false });
      setMensaje("✅ Cliente creado correctamente");
      setShowModal(false);
      obtenerClientes(); // Actualiza la lista de clientes
    } catch (err) {
      console.error("Error al crear cliente:", err);
      setMensaje("❌ Error al crear cliente");
    }
  };

  // Función para guardar la sesión desde el cronómetro rápido
  const handleQuickSave = async ({ clientId, projectName, duration, timestamp }) => {
    try {
      await addDoc(collection(db, "sesiones"), {
        cliente: clientId,
        proyecto: projectName,
        fecha: timestamp.split("T")[0],
        horas: parseFloat((duration / 3600000).toFixed(2)),
        userId: user.uid,
        timestamp: serverTimestamp(),
      });
      obtenerResumen();
    } catch (err) {
      console.error("Error al guardar desde cronómetro rápido:", err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.logo}>Time Tracker</h1>
        <div>
          <button onClick={() => setShowModal(true)} style={styles.ctaButton}>+ Añadir cliente</button>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.title}>Nuevo Cliente</h3>
            <form onSubmit={handleAddClient} style={styles.form}>
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={nuevoCliente.nombre}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                style={styles.input}
                required
              />
              <input
                type="number"
                placeholder="Horas disponibles"
                value={nuevoCliente.horas}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, horas: e.target.value })}
                style={styles.input}
              />
              <textarea
                placeholder="Información adicional"
                value={nuevoCliente.info}
                onChange={(e) => setNuevoCliente({ ...nuevoCliente, info: e.target.value })}
                style={styles.input}
              />
              <label>
                <input
                  type="checkbox"
                  checked={nuevoCliente.fee}
                  onChange={(e) => setNuevoCliente({ ...nuevoCliente, fee: e.target.checked })}
                />
                ¿Tiene Fee?
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <button type="submit" style={{ ...styles.saveButton, flex: 1 }}>Guardar</button>
                <button type="button" onClick={() => setShowModal(false)} style={{ ...styles.logoutButton, flex: 1 }}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={styles.cardContainer}>
        {clientesList.length === 0 ? (
          <p>No hay clientes disponibles</p>
        ) : (
          clientesList.map(cliente => (
            <div key={cliente.id} style={styles.card}>
              <h3>{cliente.name}</h3>
              <p>Horas disponibles: {cliente.horasDisponibles}</p>
              <p>Horas consumidas: {resumen[cliente.name] ? resumen[cliente.name].toFixed(2) : 0}h</p>
              <p>Horas restantes: {cliente.horasDisponibles - (resumen[cliente.name] || 0)}h</p>
              {cliente.horasDisponibles - (resumen[cliente.name] || 0) < 8 && (
                <p style={styles.warning}>⚠️ Pocas horas restantes</p>
              )}
              {cliente.fee ? <p>Fee: {cliente.fee}</p> : <p>No tiene Fee</p>}
            </div>
          ))
        )}
      </div>

      <div style={styles.card}>
        <QuickTimer clients={clientesList} onSave={handleQuickSave} />
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
  ctaButton: {
    background: "#03a9f4",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.9rem",
    marginRight: "0.5rem",
  },
  cardContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: "1rem",
  },
  card: {
    background: "#fff",
    padding: "1.5rem",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "calc(33.33% - 1rem)",
    textAlign: "center",
    marginTop: "1rem",
  },
  warning: {
    color: "red",
    fontWeight: "bold",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    color: "#333",
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
