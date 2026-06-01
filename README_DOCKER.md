# Como rodar o projeto com Docker

Este projeto tem:

- **backend** Spring Boot / Socket.IO
- **frontend** React + Vite servido pelo Nginx

## Requisitos

- Docker Desktop instalado e aberto

## Rodar

Na pasta raiz do projeto, execute:

```bash
docker compose up --build
```

Depois acesse:

- Frontend: http://localhost:3000
- Backend Spring: http://localhost:8080
- Socket.IO: http://localhost:9092

## Parar

```bash
docker compose down
```

## Recriar tudo do zero

```bash
docker compose down --volumes --remove-orphans
docker compose up --build
```

## Arquivos criados/alterados

- `docker-compose.yml`
- `socket_java/Dockerfile`
- `socket_java/.dockerignore`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `frontend/.dockerignore`
- `.dockerignore`
- `README_DOCKER.md`
- `frontend/src/socket.js`
- `socket_java/src/main/resources/application.properties`
