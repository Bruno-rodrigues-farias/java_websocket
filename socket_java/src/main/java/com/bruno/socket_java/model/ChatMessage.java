package com.bruno.socket_java.model;

public class ChatMessage {

    private String sender;
    private String message;
    private String room;
    private String type;
    private String imageBase64;
    private String createdAt;

    public ChatMessage() {
    }

    public ChatMessage(String sender, String message) {
        this.sender = sender;
        this.message = message;
    }

    public ChatMessage(
            String sender,
            String message,
            String room,
            String type,
            String imageBase64) {

        this.sender = sender;
        this.message = message;
        this.room = room;
        this.type = type;
        this.imageBase64 = imageBase64;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRoom() {
        return room;
    }

    public void setRoom(String room) {
        this.room = room;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
}