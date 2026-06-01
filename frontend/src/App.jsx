import { useEffect, useRef, useState } from "react";
import { socket } from "./socket";

function App() {
  const [usuario, setUsuario] = useState("");
  const [sala, setSala] = useState("atendimento");
  const [entrou, setEntrou] = useState(false);
  const [texto, setTexto] = useState("");
  const [mensagens, setMensagens] = useState([]);
  const [conectado, setConectado] = useState(false);

  const usuarioRef = useRef("");
  const salaRef = useRef("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Conectado:", socket.id);
      setConectado(true);
    });

    socket.on("disconnect", () => {
      console.log("Desconectado");
      setConectado(false);
    });

    socket.on("connect_error", (error) => {
      console.log("Erro ao conectar:", error);
      setConectado(false);
    });

    socket.on("historico_mensagens", (historico) => {
      console.log("Histórico recebido:", historico);
      setMensagens(historico || []);
    });

    socket.on("receber_mensagem", (msg) => {
      console.log("Mensagem recebida:", msg);

      setMensagens((prev) => [...prev, msg]);

      if (msg.sender !== usuarioRef.current && msg.sender !== "Sistema") {
        tocarSom();
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("historico_mensagens");
      socket.off("receber_mensagem");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  function liberarSom() {
    const audio = new Audio("/notification.mp3");
    audio.volume = 1;

    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
      })
      .catch(() => {});
  }

  function tocarSom() {
    const audio = new Audio("/notification.mp3");
    audio.volume = 1;

    audio.play().catch((error) => {
      console.log("Som bloqueado:", error);
    });
  }

  function entrarNoChat() {
    if (!usuario.trim() || !sala.trim()) {
      alert("Digite seu nome e a sala.");
      return;
    }

    usuarioRef.current = usuario.trim();
    salaRef.current = sala.trim();

    liberarSom();

    socket.emit("entrar_sala", {
      sender: usuarioRef.current,
      room: salaRef.current,
      message: "",
      type: "SYSTEM",
    });

    setEntrou(true);
  }

  function enviarMensagem() {
    if (!texto.trim()) return;

    const msg = {
      sender: usuarioRef.current,
      room: salaRef.current,
      message: texto.trim(),
      type: "TEXT",
    };

    socket.emit("enviar_mensagem", msg);
    setTexto("");
  }

  function enviarImagem(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Envie uma imagem de até 5MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const msg = {
        sender: usuarioRef.current,
        room: salaRef.current,
        message: file.name,
        type: "IMAGE",
        imageBase64: reader.result,
      };

      socket.emit("enviar_imagem", msg);
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  if (!entrou) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <div style={styles.logo}>💬</div>

          <h1 style={styles.title}>Chat Socket.IO</h1>
          <p style={styles.subtitle}>Entre com seu nome e escolha uma sala.</p>

          <input
            style={styles.loginInput}
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            placeholder="Seu nome"
            onKeyDown={(e) => e.key === "Enter" && entrarNoChat()}
          />

          <input
            style={styles.loginInput}
            value={sala}
            onChange={(e) => setSala(e.target.value)}
            placeholder="Nome da sala"
            onKeyDown={(e) => e.key === "Enter" && entrarNoChat()}
          />

          <button style={styles.loginButton} onClick={entrarNoChat}>
            Entrar no chat
          </button>

          <p style={styles.hint}>
            Exemplo: abra duas abas, entre como Bruno e Maria na mesma sala.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.chatContainer}>
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.avatar}>{usuarioRef.current[0]?.toUpperCase()}</div>
            <div>
              <strong>{usuarioRef.current}</strong>
              <p style={styles.status}>
                {conectado ? "Online" : "Offline"}
              </p>
            </div>
          </div>

          <div style={styles.roomCard}>
            <span style={styles.roomIcon}>#</span>
            <div>
              <strong>{salaRef.current}</strong>
              <p style={styles.roomText}>Sala atual</p>
            </div>
          </div>
        </aside>

        <main style={styles.chatMain}>
          <header style={styles.chatHeader}>
            <div>
              <h2 style={styles.chatTitle}>Sala {salaRef.current}</h2>
              <p style={styles.chatSubtitle}>
                {conectado ? "Conectado em tempo real" : "Tentando conectar..."}
              </p>
            </div>

            <span
              style={{
                ...styles.connectionBadge,
                backgroundColor: conectado ? "#16a34a" : "#dc2626",
              }}
            >
              {conectado ? "Online" : "Offline"}
            </span>
          </header>

          <section style={styles.messagesArea}>
            {mensagens.length === 0 && (
              <div style={styles.emptyState}>
                Nenhuma mensagem ainda. Envie a primeira.
              </div>
            )}

            {mensagens.map((msg, index) => {
              const minha = msg.sender === usuarioRef.current;
              const sistema = msg.sender === "Sistema";

              if (sistema) {
                return (
                  <div key={index} style={styles.systemMessage}>
                    {msg.message}
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  style={{
                    ...styles.messageRow,
                    justifyContent: minha ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      ...styles.messageBubble,
                      backgroundColor: minha ? "#dcf8c6" : "#ffffff",
                      borderTopRightRadius: minha ? 4 : 18,
                      borderTopLeftRadius: minha ? 18 : 4,
                    }}
                  >
                    {!minha && <strong style={styles.sender}>{msg.sender}</strong>}

                    {msg.type === "IMAGE" && msg.imageBase64 ? (
                      <div>
                        <img
                          src={msg.imageBase64}
                          alt="Imagem enviada"
                          style={styles.image}
                        />
                        <div style={styles.imageName}>{msg.message}</div>
                      </div>
                    ) : (
                      <div style={styles.messageText}>{msg.message}</div>
                    )}

                    <small style={styles.time}>
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString()
                        : ""}
                    </small>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </section>

          <footer style={styles.footer}>
            <label style={styles.attachButton}>
              📎
              <input
                type="file"
                accept="image/*"
                onChange={enviarImagem}
                style={{ display: "none" }}
              />
            </label>

            <input
              style={styles.messageInput}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
              placeholder="Digite uma mensagem"
            />

            <button style={styles.sendButton} onClick={enviarMensagem}>
              Enviar
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}

const styles = {
  loginPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #075e54, #128c7e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
  loginCard: {
    width: 380,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 30,
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    textAlign: "center",
  },
  logo: {
    fontSize: 50,
    marginBottom: 10,
  },
  title: {
    margin: 0,
    color: "#075e54",
  },
  subtitle: {
    color: "#666",
    marginBottom: 20,
  },
  loginInput: {
    width: "100%",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    border: "1px solid #ddd",
    fontSize: 15,
    boxSizing: "border-box",
  },
  loginButton: {
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 12,
    backgroundColor: "#075e54",
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
  },
  hint: {
    fontSize: 12,
    color: "#777",
    marginTop: 16,
  },
  page: {
    minHeight: "100vh",
    backgroundColor: "#d9dbd5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "Arial, sans-serif",
  },
  chatContainer: {
    width: "94%",
    height: "92vh",
    maxWidth: 1100,
    backgroundColor: "#f0f2f5",
    borderRadius: 20,
    overflow: "hidden",
    display: "flex",
    boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
  },
  sidebar: {
    width: 280,
    backgroundColor: "#ffffff",
    borderRight: "1px solid #ddd",
    display: "flex",
    flexDirection: "column",
  },
  sidebarHeader: {
    padding: 20,
    backgroundColor: "#075e54",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: "50%",
    backgroundColor: "#25d366",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: 20,
  },
  status: {
    margin: 0,
    fontSize: 13,
    opacity: 0.9,
  },
  roomCard: {
    margin: 15,
    padding: 15,
    borderRadius: 14,
    backgroundColor: "#f0f2f5",
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  roomIcon: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    backgroundColor: "#128c7e",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
  },
  roomText: {
    margin: 0,
    color: "#666",
    fontSize: 13,
  },
  chatMain: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  chatHeader: {
    height: 72,
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #ddd",
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatTitle: {
    margin: 0,
    color: "#222",
  },
  chatSubtitle: {
    margin: 0,
    fontSize: 13,
    color: "#666",
  },
  connectionBadge: {
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "bold",
  },
  messagesArea: {
    flex: 1,
    padding: 20,
    overflowY: "auto",
    backgroundColor: "#efeae2",
  },
  emptyState: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
  },
  messageRow: {
    display: "flex",
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: "65%",
    padding: "10px 12px",
    borderRadius: 18,
    boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
  },
  sender: {
    display: "block",
    color: "#075e54",
    marginBottom: 4,
    fontSize: 13,
  },
  messageText: {
    fontSize: 15,
    color: "#111",
    wordBreak: "break-word",
  },
  time: {
    display: "block",
    textAlign: "right",
    marginTop: 6,
    fontSize: 11,
    color: "#667781",
  },
  systemMessage: {
    textAlign: "center",
    color: "#667781",
    fontSize: 12,
    backgroundColor: "#ffffffaa",
    padding: "6px 12px",
    borderRadius: 999,
    width: "fit-content",
    margin: "10px auto",
  },
  image: {
    maxWidth: 260,
    maxHeight: 260,
    borderRadius: 12,
    display: "block",
    objectFit: "cover",
  },
  imageName: {
    fontSize: 12,
    marginTop: 5,
    color: "#555",
  },
  footer: {
    height: 70,
    backgroundColor: "#f0f2f5",
    borderTop: "1px solid #ddd",
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 15px",
  },
  attachButton: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 22,
    border: "1px solid #ddd",
  },
  messageInput: {
    flex: 1,
    padding: "14px 16px",
    borderRadius: 999,
    border: "1px solid #ddd",
    outline: "none",
    fontSize: 15,
  },
  sendButton: {
    padding: "13px 20px",
    border: "none",
    borderRadius: 999,
    backgroundColor: "#075e54",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};

export default App;