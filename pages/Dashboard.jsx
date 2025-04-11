// Dashboard.jsx
import { useEffect, useState } from "react";
import { signOut, getAuth } from "firebase/auth";
import { collection, addDoc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "../src/App";

export default function Dashboard({ user, role }) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(0);
  const [cliente, setCliente] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [sesiones, setSesiones] = useState([]);

  const auth = getAuth();

  const startTimer = () => {
    setStartTime(Date.now());
    setIsRunning(true);
  };

  const stopTimer = async () => {
    if (!isRunning || !startTime) return;
    const end = Date.now();
    const duracion = Math.round((end - startTime) / 1000 / 60); // minutos
    setDuration(duracion);
    setIsRunning(false);

    await addDoc(collection(db, "sesiones_trabajo"), {
      usuario_id: user.uid,
      cliente,
      proyecto,
      fecha: Timestamp.fromDate(new Date()),
      duracion,
    });

    setCliente("");
    setProyecto("");
    setStartTime(null);
    fetchSesiones();
  };

  const fetchSesiones = async () => {
    const q = query(collection(db, "sesiones_trabajo"), where("usuario_id", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setSesiones(data);
  };

  useEffect(() => {
    fetchSesiones();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hola, {user.email}</h1>
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>

      <div className="bg-white p-4 rounded shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Cronómetro</h2>
        <input
          type="text"
          placeholder="Cliente"
          className="border p-2 rounded mb-2 w-full"
          value={cliente}
          onChange={(e) => setCliente(e.target.value)}
        />
        <input
          type="text"
          placeholder="Proyecto"
          className="border p-2 rounded mb-4 w-full"
          value={proyecto}
          onChange={(e) => setProyecto(e.target.value)}
        />

        <div className="flex gap-4">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Iniciar
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Detener
            </button>
          )}
          {duration > 0 && <p className="text-gray-700 self-center">Última sesión: {duration} min</p>}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-4">Sesiones registradas</h2>
        {sesiones.length === 0 ? (
          <p className="text-gray-500">Aún no hay sesiones.</p>
        ) : (
          <ul className="divide-y">
            {sesiones.map((s) => (
              <li key={s.id} className="py-2">
                <strong>{s.cliente}</strong> – {s.proyecto} – {s.duracion} min ({s.fecha.toDate().toLocaleString()})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
