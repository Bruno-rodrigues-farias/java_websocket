package com.bruno.socket_java.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import com.bruno.socket_java.model.ChatMessage;
import com.corundumstudio.socketio.SocketIOServer;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Component
public class SocketIOService {

    private final SocketIOServer server;

    private final Map<String, List<ChatMessage>> historicoPorSala = new ConcurrentHashMap<>();

    public SocketIOService(SocketIOServer server) {
        this.server = server;
    }

    @PostConstruct
    public void start() {

        server.addConnectListener(client -> {
            System.out.println("Cliente conectado: " + client.getSessionId());
        });

        server.addDisconnectListener(client -> {
            String usuario = client.get("usuario");
            String sala = client.get("sala");

            if (usuario != null && sala != null) {
                ChatMessage sistema = new ChatMessage();
                sistema.setSender("Sistema");
                sistema.setMessage(usuario + " saiu da sala " + sala);
                sistema.setRoom(sala);
                sistema.setType("SYSTEM");
                sistema.setCreatedAt(LocalDateTime.now().toString());

                server.getRoomOperations(sala).sendEvent("receber_mensagem", sistema);
            }

            System.out.println("Cliente desconectado: " + client.getSessionId());
        });

        server.addEventListener("entrar_sala", ChatMessage.class, (client, data, ackSender) -> {
            String sala = data.getRoom();

            client.joinRoom(sala);
            client.set("usuario", data.getSender());
            client.set("sala", sala);

            List<ChatMessage> historico = historicoPorSala.getOrDefault(sala, new ArrayList<>());
            client.sendEvent("historico_mensagens", historico);

            ChatMessage sistema = new ChatMessage();
            sistema.setSender("Sistema");
            sistema.setMessage(data.getSender() + " entrou na sala " + sala);
            sistema.setRoom(sala);
            sistema.setType("SYSTEM");
            sistema.setCreatedAt(LocalDateTime.now().toString());

            server.getRoomOperations(sala).sendEvent("usuario_entrou", sistema);
            server.getRoomOperations(sala).sendEvent("receber_mensagem", sistema);

            System.out.println(data.getSender() + " entrou na sala " + sala);
        });

        server.addEventListener("enviar_mensagem", ChatMessage.class, (client, data, ackSender) -> {
            data.setType("TEXT");
            data.setCreatedAt(LocalDateTime.now().toString());

            historicoPorSala
                    .computeIfAbsent(data.getRoom(), key -> new ArrayList<>())
                    .add(data);

            server.getRoomOperations(data.getRoom()).sendEvent("receber_mensagem", data);

            System.out.println(data.getSender() + ": " + data.getMessage());
        });

        server.addEventListener("enviar_imagem", ChatMessage.class, (client, data, ackSender) -> {
            data.setType("IMAGE");
            data.setCreatedAt(LocalDateTime.now().toString());

            historicoPorSala
                    .computeIfAbsent(data.getRoom(), key -> new ArrayList<>())
                    .add(data);

            server.getRoomOperations(data.getRoom()).sendEvent("receber_mensagem", data);

            System.out.println(data.getSender() + " enviou uma imagem");
        });

        server.start();
        System.out.println("Socket.IO rodando na porta 9092");
    }

    @PreDestroy
    public void stop() {
        server.stop();
    }
}