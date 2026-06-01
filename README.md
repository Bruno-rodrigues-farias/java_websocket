# 🚀 Socket Java - Comunicação em Tempo Real

Sistema desenvolvido com **Spring Boot**, **Socket.IO** e **React**, permitindo comunicação em tempo real entre clientes conectados. O projeto demonstra a utilização de WebSockets para envio e recebimento instantâneo de mensagens e eventos.

## 📋 Resumo

O sistema é composto por:

- **Backend** em Spring Boot
- **Servidor Socket.IO** para comunicação em tempo real
- **Frontend** em React + Vite
- **Docker Compose** para facilitar a execução do ambiente

A aplicação pode ser utilizada como base para:

- Chats em tempo real
- Notificações instantâneas
- Sistemas colaborativos
- Dashboards em tempo real
- Jogos multiplayer simples

---

## 🛠 Tecnologias

### Backend
- Java 21
- Spring Boot
- Maven
- Socket.IO (Netty)

### Frontend
- React
- Vite
- JavaScript

### Infraestrutura
- Docker
- Docker Compose
- Nginx

---

## 📂 Estrutura do Projeto

```text
projetos_java/
├── frontend/
├── socket_java/
├── docker-compose.yml
└── README.md
```

---

## 🚀 Como Executar

### Pré-requisitos

- Docker Desktop instalado

Verifique:

```bash
docker --version
docker compose version
```

---

### Executar com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

Para executar em segundo plano:

```bash
docker compose up -d
```

---

## 🌐 Endpoints

| Serviço | URL |
|----------|----------|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8080 |
| Socket.IO | http://localhost:9092 |

---

## 🛑 Parar o Projeto

```bash
docker compose down
```

---

## 🎯 Objetivo

Este projeto foi desenvolvido para estudo e demonstração de comunicação em tempo real utilizando tecnologias modernas do ecossistema Java e React, servindo como base para aplicações escaláveis que dependem de atualização instantânea de dados.

---

## 👨‍💻 Autor

**Bruno Rodrigues Farias**
