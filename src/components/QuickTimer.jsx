import { useState, useEffect } from "react";

export default function QuickTimer({ clients, onSave }) {
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [isNewProject, setIsNewProject] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [intervalId, setIntervalId] = useState(null);

  const startTimer = () => {
    const start = Date.now();
    setStartTime(start);
    const id = setInterval(() => {
      setElapsedTime(Date.now() - start);
    }, 1000);
    setIntervalId(id);
  };

  const pauseTimer = () => {
    clearInterval(intervalId);
    setIntervalId(null);
  };

  const finishTimer = () => {
    clearInterval(intervalId);
    onSave({
      clientId: selectedClient,
      projectName: isNewProject ? newProjectName : selectedProject,
      duration: elapsedTime,
      timestamp: new Date().toISOString()
    });
    setElapsedTime(0);
    setStartTime(null);
    setIntervalId(null);
    setSelectedProject("");
    setIsNewProject(false);
    setNewProjectName("");
  };

  return (
    <div className="p-4 rounded bg-white shadow max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Cronómetro Rápido</h2>

      <label className="block mb-2">Cliente</label>
      <select
        className="border p-2 rounded w-full mb-4"
        value={selectedClient}
        onChange={(e) => setSelectedClient(e.target.value)}
      >
        <option value="">Selecciona un cliente</option>
        {clients.map((client) => (
          <option key={client.id} value={client.id}>
            {client.name}
          </option>
        ))}
      </select>

      <label className="block mb-2">Proyecto</label>
      {isNewProject ? (
        <input
          className="border p-2 rounded w-full mb-4"
          placeholder="Nombre del nuevo proyecto"
          value={newProjectName}
          onChange={(e) => setNewProjectName(e.target.value)}
        />
      ) : (
        <select
          className="border p-2 rounded w-full mb-4"
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
        >
          <option value="">Selecciona un proyecto</option>
          <option value="__new">+ Crear nuevo proyecto</option>
          {clients
            .find((c) => c.id === selectedClient)?.projects?.map((proj) => (
              <option key={proj.name} value={proj.name}>
                {proj.name}
              </option>
            ))}
        </select>
      )}

      {!isNewProject && selectedProject === "__new" && (
        <button
          className="text-blue-600 underline mb-4"
          onClick={() => {
            setIsNewProject(true);
            setSelectedProject("");
          }}
        >
          Crear nuevo proyecto
        </button>
      )}

      <div className="flex justify-between items-center mb-4">
        <span className="text-2xl font-mono">
          {new Date(elapsedTime).toISOString().substr(11, 8)}
        </span>
        <div className="space-x-2">
          {!intervalId ? (
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={startTimer}
            >
              Iniciar
            </button>
          ) : (
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded"
              onClick={pauseTimer}
            >
              Pausar
            </button>
          )}
          <button
            className="bg-red-600 text-white px-4 py-2 rounded"
            onClick={finishTimer}
            disabled={!elapsedTime}
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
