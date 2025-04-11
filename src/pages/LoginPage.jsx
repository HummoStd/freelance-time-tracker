import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "usuarios", userCredential.user.uid), {
          email,
          rol: "cliente",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>{isRegistering ? "Registro" : "Iniciar sesión"}</h2>

        {error && <p style={styles.error}>{error}</p>}

        <input
          type="email"
          placeholder="Correo"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" style={styles.button}>
          {isRegistering ? "Registrarse" : "Entrar"}
        </button>

        <p style={styles.switch}>
          {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={styles.switchLink}
          >
            {isRegistering ? "Inicia sesión" : "Regístrate"}
          </button>
        </p>
      </form>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    background: "#eaeaea",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1rem",
  },
  form: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    maxWidth: "420px",
    width: "100%",
  },
  title: {
    textAlign: "center",
    fontSize: "1.6rem",
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    borderRadius: "12px",
    border: "1px solid #ccc",
    fontSize: "1rem",
  },
  button: {
    width: "100%",
    background: "#6200ea",
    color: "#fff",
    padding: "0.75rem",
    border: "none",
    borderRadius: "12px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  switch: {
    textAlign: "center",
    marginTop: "1rem",
    fontSize: "0.9rem",
  },
  switchLink: {
    marginLeft: "0.5rem",
    color: "#6200ea",
    background: "none",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  error: {
    color: "red",
    textAlign: "center",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
};
