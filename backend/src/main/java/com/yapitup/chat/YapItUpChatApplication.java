package com.yapitup.chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Spring Boot application
 * This annotation enables auto-configuration and component scanning
 */
@SpringBootApplication
public class YapItUpChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(YapItUpChatApplication.class, args);
        System.out.println("🚀 YapItUp Chat Backend is running!");
    }
}