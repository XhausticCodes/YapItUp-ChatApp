package com.yapitup.chat.config;

import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.SpringAnnotationScanner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Socket.IO Configuration Configures the Socket.IO server for real-time
 * communication
 */
@Configuration
public class SocketIOConfig {

    @Value("${socketio.host}")
    private String host;

    @Value("${socketio.port}")
    private Integer port;

    /**
     * Create Socket.IO server bean
     */
    @Bean
    public SocketIOServer socketIOServer() {
        com.corundumstudio.socketio.Configuration config = new com.corundumstudio.socketio.Configuration();
        config.setHostname(host);
        config.setPort(port);

        // Allow CORS for both Vite and Create React App
        config.setOrigin("http://localhost:5173,http://localhost:3000");

        // Allow credentials
        config.setAllowCustomRequests(true);

        return new SocketIOServer(config);
    }

    /**
     * Enable Spring annotations for Socket.IO
     */
    @Bean
    public SpringAnnotationScanner springAnnotationScanner(SocketIOServer socketIOServer) {
        return new SpringAnnotationScanner(socketIOServer);
    }
}
