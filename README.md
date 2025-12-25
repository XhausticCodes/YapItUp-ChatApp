# YapItUp Chat - Broadcast-Based Chat Application

## Minor Project Report

---

## 1. Introduction

### 1.1 Project Overview

YapItUp Chat is a real-time, broadcast-based chat application developed as a minor project. It enables multiple users to communicate in real-time through chat rooms, where messages are broadcasted to all members of a room simultaneously. The application implements a modern architecture using React for the frontend and Spring Boot for the backend, with Socket.IO for real-time bidirectional communication.

### 1.2 Problem Statement

Traditional communication methods lack real-time interaction capabilities. Users need a platform where they can:

- Join chat rooms and communicate with multiple users simultaneously
- Receive messages instantly without page refreshes
- Manage multiple chat rooms
- Securely authenticate and maintain sessions

### 1.3 Objectives

The primary objectives of this project are:

1. To develop a scalable real-time chat application
2. To implement secure user authentication and authorization
3. To enable broadcast-based messaging within chat rooms
4. To provide an intuitive and responsive user interface
5. To demonstrate proficiency in full-stack web development

### 1.4 Scope

The application supports the following features:

- User registration and authentication using JWT tokens
- Creation and management of chat rooms
- Real-time message broadcasting within rooms
- User presence indicators (online/offline status)
- Typing indicators
- Persistent message history stored in database
- Room-based message organization

---

## 2. Methodology

### 2.1 Development Approach

The project follows an **iterative development methodology** with the following phases:

1. **Requirements Analysis**: Identified core features and technical requirements
2. **System Design**: Designed database schema, API endpoints, and component architecture
3. **Backend Development**: Implemented REST APIs and WebSocket server
4. **Frontend Development**: Created React components and integrated with backend
5. **Testing**: Manual testing of all features and integrations
6. **Documentation**: Prepared comprehensive documentation

### 2.2 Architecture Pattern

The application follows a **three-tier architecture**:

- **Presentation Layer**: React frontend components
- **Application Layer**: Spring Boot REST controllers and services
- **Data Layer**: MySQL database with JPA/Hibernate ORM

### 2.3 Communication Protocol

- **REST API**: Used for CRUD operations (user registration, login, room management)
- **WebSocket (Socket.IO)**: Used for real-time bidirectional communication (messaging, typing indicators)

---

## 3. Technology Used

### 3.1 Frontend Technologies

| Technology           | Version | Purpose                                  |
| -------------------- | ------- | ---------------------------------------- |
| **React**            | 19.2.0  | UI library for building user interfaces  |
| **Vite**             | 7.2.4   | Build tool and development server        |
| **React Router DOM** | 7.9.6   | Client-side routing                      |
| **Axios**            | 1.13.2  | HTTP client for API requests             |
| **Socket.IO Client** | 4.8.1   | Real-time communication with backend     |
| **Tailwind CSS**     | 4.1.17  | Utility-first CSS framework              |
| **Three.js**         | 0.167.1 | 3D graphics library (for visual effects) |

### 3.2 Backend Technologies

| Technology            | Version | Purpose                                      |
| --------------------- | ------- | -------------------------------------------- |
| **Java**              | 21      | Programming language                         |
| **Spring Boot**       | 3.3.0   | Application framework                        |
| **Spring Security**   | 3.3.0   | Authentication and authorization             |
| **Spring Data JPA**   | 3.3.0   | Database abstraction layer                   |
| **Hibernate**         | -       | ORM framework                                |
| **MySQL**             | -       | Relational database                          |
| **JWT (JJWT)**        | 0.12.5  | Token-based authentication                   |
| **Socket.IO (Netty)** | 2.0.3   | WebSocket server for real-time communication |
| **Maven**             | -       | Build automation and dependency management   |
| **BCrypt**            | -       | Password hashing                             |

### 3.3 Development Tools

- **Node.js & npm**: Package management for frontend
- **Maven**: Build tool for backend
- **Git**: Version control
- **MySQL Workbench**: Database management
- **Postman/Insomnia**: API testing

---

## 4. Folder Structure

### 4.1 Project Root Structure

```
YapItUpChat/
├── backend/                    # Spring Boot backend application
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       │   └── com/yapitup/chat/
│   │       │       ├── config/          # Configuration classes
│   │       │       ├── controller/      # REST API controllers
│   │       │       ├── dto/             # Data Transfer Objects
│   │       │       ├── model/           # Entity classes
│   │       │       ├── repository/      # Data access layer
│   │       │       ├── service/         # Business logic layer
│   │       │       ├── util/            # Utility classes
│   │       │       ├── websocket/       # WebSocket event handlers
│   │       │       └── YapItUpChatApplication.java
│   │       └── resources/
│   │           ├── application.properties
│   │           └── schema.sql
│   ├── target/                 # Compiled classes and JAR
│   └── pom.xml                 # Maven configuration
│
└── frontend/                   # React frontend application
    ├── src/
    │   ├── components/         # React components
    │   │   ├── Auth/          # Authentication components
    │   │   ├── Chat/          # Chat-related components
    │   │   └── Common/        # Shared components
    │   ├── context/           # React Context API
    │   ├── services/          # API and Socket services
    │   ├── assets/            # Static assets
    │   ├── App.jsx            # Main application component
    │   ├── main.jsx           # Entry point
    │   └── index.css          # Global styles
    ├── public/                # Public assets
    ├── package.json           # npm dependencies
    ├── vite.config.js         # Vite configuration
    └── index.html             # HTML template
```

### 4.2 Backend Package Structure

```
com.yapitup.chat/
├── config/
│   ├── SecurityConfig.java          # Spring Security configuration
│   ├── JwtAuthenticationFilter.java # JWT authentication filter
│   └── SocketIOConfig.java          # Socket.IO server configuration
├── controller/
│   ├── AuthController.java          # Authentication endpoints
│   ├── ChatRoomController.java      # Room management endpoints
│   ├── MessageController.java       # Message endpoints
│   └── UserController.java          # User endpoints
├── dto/
│   ├── AuthResponse.java            # Authentication response DTO
│   ├── ChatRoomDTO.java             # Room data transfer object
│   ├── MessageDTO.java              # Message data transfer object
│   ├── LoginRequest.java            # Login request DTO
│   └── RegisterRequest.java         # Registration request DTO
├── model/
│   ├── User.java                    # User entity
│   ├── ChatRoom.java                # Chat room entity
│   └── Message.java                 # Message entity
├── repository/
│   ├── UserRepository.java          # User data access
│   ├── ChatRoomRepository.java      # Room data access
│   └── MessageRepository.java       # Message data access
├── service/
│   ├── UserService.java             # User business logic
│   ├── ChatRoomService.java         # Room business logic
│   └── MessageService.java          # Message business logic
├── util/
│   └── JwtUtil.java                 # JWT token utilities
└── websocket/
    └── SocketIOEventHandler.java    # WebSocket event handlers
```

### 4.3 Frontend Component Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.jsx                # Login page component
│   │   └── Register.jsx             # Registration page component
│   ├── Chat/
│   │   ├── ChatRoom.jsx             # Main chat interface
│   │   ├── RoomList.jsx             # List of available rooms
│   │   ├── MessageList.jsx          # Display messages
│   │   └── MessageInput.jsx         # Message input component
│   └── Common/
│       └── Loading.jsx              # Loading indicator
├── context/
│   └── AuthContext.jsx              # Authentication context
└── services/
    ├── api.js                       # REST API client
    └── socket.js                    # Socket.IO client
```

---

## 5. Main Logical Code

### 5.1 Backend - User Authentication (AuthController.java)

```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        // Check if username/email already exists
        if (userService.usernameExists(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new AuthResponse(null, null, null, "Username already exists"));
        }

        // Create new user with hashed password
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setIsOnline(false);

        User savedUser = userService.saveUser(user);

        // Generate JWT token
        String token = jwtUtil.generateToken(savedUser.getUsername(), savedUser.getId());

        return ResponseEntity.ok(new AuthResponse(
            token, savedUser.getUsername(), savedUser.getId(),
            "User registered successfully"
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        var userOpt = userService.getUserByUsername(request.getUsername());

        if (userOpt.isEmpty() ||
            !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new AuthResponse(null, null, null, "Invalid credentials"));
        }

        User user = userOpt.get();
        user.setIsOnline(true);
        userService.saveUser(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getId());

        return ResponseEntity.ok(new AuthResponse(
            token, user.getUsername(), user.getId(), "Login successful"
        ));
    }
}
```

**Key Logic:**

- Validates username/email uniqueness during registration
- Uses BCrypt for password hashing
- Generates JWT tokens for authenticated sessions
- Updates user online status

### 5.2 Backend - Real-time Messaging (SocketIOEventHandler.java)

```java
@Component
public class SocketIOEventHandler {

    @Autowired
    private SocketIOServer socketIOServer;

    @Autowired
    private MessageRepository messageRepository;

    private Map<String, Long> userRooms = new HashMap<>();

    @OnConnect
    public void onConnect(SocketIOClient client) {
        String token = client.getHandshakeData().getSingleUrlParam("token");
        if (token != null && jwtUtil.validateToken(token)) {
            Long userId = jwtUtil.extractUserId(token);
            client.set("userId", userId);
            // Update user online status
        }
    }

    @OnEvent("send_message")
    public void onSendMessage(SocketIOClient client, Map<String, Object> data) {
        Long userId = client.get("userId");
        Long roomId = Long.valueOf(data.get("roomId").toString());
        String content = data.get("content").toString();

        // Save message to database
        Message message = new Message();
        message.setRoom(chatRoomRepository.findById(roomId).get());
        message.setUser(userRepository.findById(userId).get());
        message.setContent(content);
        Message savedMessage = messageRepository.save(message);

        // Broadcast to all clients in the room
        MessageDTO messageDTO = convertToDTO(savedMessage);
        client.getNamespace().getRoomOperations(String.valueOf(roomId))
            .sendEvent("message_received", messageDTO);
    }

    @OnEvent("join_room")
    public void onJoinRoom(SocketIOClient client, Map<String, Object> data) {
        Long roomId = Long.valueOf(data.get("roomId").toString());
        client.joinRoom(String.valueOf(roomId));
        userRooms.put(client.getSessionId().toString(), roomId);

        // Notify others in the room
        client.getNamespace().getRoomOperations(String.valueOf(roomId))
            .sendEvent("user_joined_room", userInfo);
    }
}
```

**Key Logic:**

- Validates JWT token on WebSocket connection
- Saves messages to database before broadcasting
- Broadcasts messages to all clients in the same room
- Tracks user-room associations for proper message routing

### 5.3 Backend - Security Configuration (SecurityConfig.java)

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

**Key Logic:**

- Configures stateless JWT authentication
- Allows public access to authentication endpoints
- Protects all other endpoints with JWT validation
- Enables CORS for frontend communication

### 5.4 Frontend - Authentication Context (AuthContext.jsx)

```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { token: newToken, username: userUsername, userId } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem(
        "user",
        JSON.stringify({ username: userUsername, userId })
      );
      setToken(newToken);
      setUser({ username: userUsername, userId });

      connectSocket(newToken);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const logout = () => {
    const socket = getSocket();
    if (socket && socket.connected) {
      socket.disconnect();
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

**Key Logic:**

- Manages global authentication state
- Persists user session in localStorage
- Automatically connects Socket.IO on login
- Cleans up resources on logout

### 5.5 Frontend - Real-time Message Handling (ChatRoom.jsx)

```javascript
const ChatRoom = () => {
  const { user, logout } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMessageReceived = (messageDTO) => {
      setMessages((prev) => [...prev, messageDTO]);
    };

    socket.on("message_received", handleMessageReceived);

    return () => {
      socket.off("message_received", handleMessageReceived);
    };
  }, []);

  const handleSelectRoom = async (room) => {
    setSelectedRoom(room);
    const socket = getSocket();

    // Join room via Socket.IO
    socket.emit("join_room", { roomId: room.id });

    // Load message history
    const response = await messageAPI.getByRoom(room.id);
    setMessages(response.data);
  };

  const handleSendMessage = (content) => {
    const socket = getSocket();
    socket.emit("send_message", {
      roomId: selectedRoom.id,
      content: content,
    });
  };

  return (
    <div>
      <RoomList onSelectRoom={handleSelectRoom} />
      <MessageList messages={messages} />
      <MessageInput onSend={handleSendMessage} />
    </div>
  );
};
```

**Key Logic:**

- Listens for real-time message events
- Joins Socket.IO rooms when selecting a chat room
- Loads historical messages from database
- Sends messages via WebSocket for real-time delivery

---

## 6. System Architecture and Workflow

### 6.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   Room   │  │  Message │  │  Socket  │   │
│  │Component │  │ Component│  │Component │  │  Client  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │             │          │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        │   REST API  │             │   WebSocket │
        │   (HTTP)    │             │   (Socket.IO)│
        │             │             │             │
┌───────┼─────────────┼─────────────┼─────────────┼──────────┐
│       │             │             │             │          │
│  ┌────▼─────────────▼─────────────▼─────────────▼────┐    │
│  │           Backend (Spring Boot)                    │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │  │   REST   │  │ Security │  │ Socket.IO│        │    │
│  │  │Controller│  │  Config  │  │  Server  │        │    │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘        │    │
│  │       │             │             │               │    │
│  │  ┌────▼─────────────▼─────────────▼────┐         │    │
│  │  │          Service Layer              │         │    │
│  │  │  (UserService, ChatRoomService, etc)│         │    │
│  │  └────┬────────────────────────────────┘         │    │
│  │       │                                          │    │
│  │  ┌────▼────────────────────────────────┐        │    │
│  │  │     Repository Layer (JPA)          │        │    │
│  │  └────┬────────────────────────────────┘        │    │
│  └───────┼─────────────────────────────────────────┘    │
│          │                                              │
│          │  JDBC                                        │
│          │                                              │
└──────────┼──────────────────────────────────────────────┘
           │
    ┌──────▼──────┐
    │   MySQL     │
    │  Database   │
    └─────────────┘
```

### 6.2 Data Flow - User Registration

1. **User submits registration form** → Frontend (Register.jsx)
2. **HTTP POST request** → `/api/auth/register` endpoint
3. **AuthController processes** → Validates input, checks duplicates
4. **UserService creates user** → Hashes password, saves to database
5. **JWT token generated** → Returned to frontend
6. **Frontend stores token** → localStorage, connects Socket.IO
7. **User redirected** → To chat interface

### 6.3 Data Flow - Sending a Message

1. **User types message** → Frontend (MessageInput.jsx)
2. **WebSocket emit** → `send_message` event with roomId and content
3. **SocketIOEventHandler receives** → Validates user, extracts roomId
4. **Message saved to database** → Via MessageRepository
5. **Message broadcasted** → To all clients in the room via `message_received` event
6. **All clients receive** → Update UI with new message
7. **Message persisted** → Available in message history

### 6.4 Data Flow - Joining a Room

1. **User selects room** → Frontend (RoomList.jsx)
2. **REST API call** → `POST /api/rooms/{roomId}/join` (adds to database)
3. **WebSocket emit** → `join_room` event with roomId
4. **SocketIOEventHandler processes** → Adds client to Socket.IO room
5. **Room operations** → Client receives `room_joined` confirmation
6. **Message history loaded** → `GET /api/messages/room/{roomId}/all`
7. **Real-time listeners** → Set up for new messages in the room

### 6.5 Database Schema

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│    users     │         │  chat_rooms  │         │   messages   │
├──────────────┤         ├──────────────┤         ├──────────────┤
│ id (PK)      │         │ id (PK)      │         │ id (PK)      │
│ username     │         │ name         │         │ room_id (FK) │
│ email        │         │ description  │         │ user_id (FK) │
│ password     │         │ created_at   │         │ content      │
│ created_at   │         │ created_by   │         │ created_at   │
│ is_online    │         │              │         │              │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │                        │                        │
       │                        │                        │
       │           ┌────────────┴────────────┐          │
       │           │    room_members         │          │
       │           ├─────────────────────────┤          │
       └───────────┤ room_id (FK, PK)        │          │
                   │ user_id (FK, PK)        │          │
                   │ joined_at               │          │
                   └─────────────────────────┘          │
                                                        │
                                                        │
                                                        │
```

**Relationships:**

- User ↔ ChatRoom: Many-to-Many (via room_members table)
- User → Message: One-to-Many
- ChatRoom → Message: One-to-Many
- User → ChatRoom (created_by): Many-to-One

### 6.6 Authentication Flow

```
┌─────────┐                    ┌──────────┐                    ┌─────────┐
│ Client  │                    │ Backend  │                    │Database │
└────┬────┘                    └────┬─────┘                    └────┬────┘
     │                              │                              │
     │  1. POST /api/auth/login     │                              │
     │─────────────────────────────>│                              │
     │     (username, password)     │                              │
     │                              │                              │
     │                              │  2. Validate credentials     │
     │                              │─────────────────────────────>│
     │                              │                              │
     │                              │  3. User found, password OK  │
     │                              │<─────────────────────────────│
     │                              │                              │
     │                              │  4. Generate JWT token       │
     │                              │                              │
     │  5. Return JWT token         │                              │
     │<─────────────────────────────│                              │
     │                              │                              │
     │  6. Store token in localStorage                              │
     │                              │                              │
     │  7. Subsequent requests with token                           │
     │─────────────────────────────>│                              │
     │     Authorization: Bearer {token}                            │
     │                              │                              │
     │                              │  8. Validate JWT token       │
     │                              │                              │
     │  9. Return protected resource                                │
     │<─────────────────────────────│                              │
```

---

## 7. Conclusion

### 7.1 Project Summary

YapItUp Chat successfully implements a real-time, broadcast-based chat application that demonstrates modern web development practices. The application provides seamless real-time communication through a combination of REST APIs for standard operations and WebSocket connections for instant messaging.

### 7.2 Achievements

1. **Real-time Communication**: Successfully implemented instant message broadcasting using Socket.IO
2. **Secure Authentication**: Implemented JWT-based authentication with password encryption
3. **Scalable Architecture**: Designed a modular, maintainable codebase following best practices
4. **User Experience**: Created an intuitive interface with responsive design
5. **Data Persistence**: All messages and user data are securely stored in MySQL database

### 7.3 Technical Learning Outcomes

- Gained proficiency in full-stack development (React + Spring Boot)
- Learned WebSocket programming for real-time applications
- Implemented secure authentication mechanisms
- Understood database design and ORM concepts
- Practiced RESTful API design principles
- Applied software engineering best practices

### 7.4 Challenges Overcome

1. **WebSocket Connection Management**: Managed socket connections, reconnections, and room joining/leaving
2. **State Synchronization**: Ensured consistency between database state and real-time events
3. **Authentication Integration**: Successfully integrated JWT authentication with Socket.IO connections
4. **CORS Configuration**: Configured proper CORS settings for frontend-backend communication

### 7.5 Application Benefits

- **Instant Communication**: Messages are delivered in real-time without page refreshes
- **Room-based Organization**: Messages are organized by rooms for better conversation management
- **Secure**: JWT-based authentication ensures secure access to resources
- **Scalable**: Architecture supports future enhancements and additional features
- **User-friendly**: Intuitive interface makes it easy for users to communicate

---

## 8. Future Scope

### 8.1 Enhanced Features

1. **Private Messaging**

   - One-on-one direct messaging between users
   - Private message notifications

2. **File Sharing**

   - Image upload and sharing
   - File attachments (documents, PDFs)
   - Media preview in chat

3. **Advanced User Features**

   - User profiles with avatars
   - Status messages ("Available", "Busy", "Away")
   - User search functionality

4. **Message Features**

   - Message reactions (emoji reactions)
   - Message editing and deletion
   - Message threading/replies
   - Message search within rooms

5. **Room Management**
   - Room permissions (admin, moderator, member)
   - Room categories/tags
   - Private/encrypted rooms
   - Room discovery and recommendations

### 8.2 Technical Improvements

1. **Performance Optimization**

   - Message pagination for large chat histories
   - Lazy loading of room lists
   - WebSocket connection pooling
   - Database query optimization

2. **Scalability Enhancements**

   - Redis caching for frequently accessed data
   - Message queue (RabbitMQ/Kafka) for high-traffic scenarios
   - Load balancing for multiple server instances
   - Microservices architecture migration

3. **Security Enhancements**

   - End-to-end encryption for messages
   - Rate limiting on API endpoints
   - Input sanitization and XSS prevention
   - CSRF protection improvements

4. **Mobile Support**

   - React Native mobile application
   - Push notifications for mobile devices
   - Offline message synchronization

5. **DevOps and Monitoring**
   - Docker containerization
   - CI/CD pipeline setup
   - Application monitoring and logging (ELK stack)
   - Performance metrics and analytics

### 8.3 User Experience Improvements

1. **UI/UX Enhancements**

   - Dark mode theme
   - Customizable chat themes
   - Emoji picker integration
   - Rich text formatting (bold, italic, code blocks)

2. **Notification System**

   - Browser push notifications
   - Email notifications for mentions
   - Sound notifications
   - Notification preferences

3. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode
   - Font size customization

### 8.4 Integration Possibilities

1. **Third-party Integrations**

   - OAuth login (Google, GitHub, etc.)
   - Integration with external services (Slack, Discord)
   - API for third-party applications

2. **Advanced Features**
   - Voice and video calling
   - Screen sharing
   - Collaborative document editing
   - Bot integrations

---

## Appendix

### A. API Endpoints

#### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

#### Chat Rooms

- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/{id}` - Get room by ID
- `POST /api/rooms` - Create a new room
- `POST /api/rooms/{roomId}/join` - Join a room
- `POST /api/rooms/{roomId}/leave` - Leave a room

#### Messages

- `GET /api/messages/room/{roomId}/all` - Get all messages in a room
- `POST /api/messages` - Send a message (alternative to WebSocket)

### B. WebSocket Events

#### Client → Server

- `join_room` - Join a chat room
- `leave_room` - Leave a chat room
- `send_message` - Send a message to a room
- `typing_start` - User started typing
- `typing_stop` - User stopped typing

#### Server → Client

- `room_joined` - Confirmation of joining a room
- `room_left` - Confirmation of leaving a room
- `message_received` - New message in the room
- `user_joined_room` - Another user joined the room
- `user_left_room` - Another user left the room
- `user_typing` - User is typing indicator
- `user_stopped_typing` - User stopped typing indicator
- `error` - Error occurred

### C. Environment Configuration

#### Backend (application.properties)

- Server port: 8081
- Database: MySQL (localhost:3306)
- Socket.IO port: 9092
- JWT expiration: 86400000ms (24 hours)

#### Frontend

- API Base URL: http://localhost:8081/api
- Socket.IO URL: http://localhost:9092
- Development server: Vite (default port: 5173)

---

**Report Generated**: [Current Date]
**Project**: YapItUp Chat - Broadcast-Based Chat Application
**Type**: Minor Project Report
