# YapItUp Chat - Complete Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technologies Used](#technologies-used)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [Features & Functionality](#features--functionality)
6. [Socket.IO Deep Dive](#socketio-deep-dive)
7. [Authentication & Security](#authentication--security)
8. [API Endpoints](#api-endpoints)
9. [Frontend Components](#frontend-components)
10. [Real-time Communication Flow](#real-time-communication-flow)
11. [Viva Questions & Answers](#viva-questions--answers)

---

## Project Overview

**YapItUp Chat** is a real-time broadcast-based chat application that allows multiple users to communicate in chat rooms. It's a full-stack application built with modern web technologies to provide instant messaging capabilities.

### Key Characteristics:
- **Broadcast-based**: Messages sent in a room are broadcasted to all members in that room
- **Real-time**: Uses WebSocket technology (Socket.IO) for instant message delivery
- **Multi-room**: Users can create and join multiple chat rooms
- **User Authentication**: Secure login/registration system with JWT tokens
- **Typing Indicators**: Shows when other users are typing
- **Online Status**: Tracks user online/offline status

---

## Technologies Used

### Backend Technologies

1. **Spring Boot 3.3.0**
   - Java 21 framework for building RESTful APIs
   - Provides dependency injection, security, and database integration
   - Handles HTTP requests and responses

2. **Spring Data JPA**
   - Java Persistence API for database operations
   - Simplifies database interactions with repositories
   - Uses Hibernate as the ORM (Object-Relational Mapping) tool

3. **MySQL Database**
   - Relational database for storing users, rooms, and messages
   - Provides data persistence

4. **Socket.IO (Java Server)**
   - Library: `netty-socketio` (version 2.0.3)
   - Enables real-time bidirectional communication
   - Handles WebSocket connections for instant messaging

5. **Spring Security**
   - Provides authentication and authorization
   - Password encryption using BCrypt
   - JWT token validation

6. **JWT (JSON Web Tokens)**
   - Library: `jjwt` (version 0.12.5)
   - Stateless authentication mechanism
   - Tokens contain user information (username, userId)

### Frontend Technologies

1. **React 19.2.0**
   - JavaScript library for building user interfaces
   - Component-based architecture
   - Manages UI state and rendering

2. **Vite**
   - Modern build tool and development server
   - Fast hot module replacement (HMR)
   - Optimized production builds

3. **Socket.IO Client**
   - Library: `socket.io-client` (version 4.8.1)
   - Connects to Socket.IO server
   - Listens for and emits real-time events

4. **Axios**
   - HTTP client for making REST API calls
   - Handles authentication headers automatically

5. **React Router DOM**
   - Client-side routing
   - Navigation between pages (Login, Register, Chat)

6. **Tailwind CSS**
   - Utility-first CSS framework
   - Rapid UI development

---

## System Architecture

### High-Level Architecture

```
┌─────────────────┐
│   React Frontend│
│   (Port 5173)   │
└────────┬────────┘
         │
         │ HTTP/REST API
         │ Socket.IO (WebSocket)
         │
┌────────▼────────────────────────┐
│   Spring Boot Backend            │
│   (Port 8081 - REST API)        │
│   (Port 9092 - Socket.IO)       │
└────────┬────────────────────────┘
         │
         │ JDBC
         │
┌────────▼────────┐
│   MySQL Database│
│   (Port 3306)   │
└─────────────────┘
```

### Component Flow

1. **Frontend (React)**
   - User interacts with UI components
   - Makes REST API calls for CRUD operations
   - Connects via Socket.IO for real-time events

2. **Backend (Spring Boot)**
   - REST Controllers handle HTTP requests
   - Services contain business logic
   - Repositories interact with database
   - Socket.IO handlers manage real-time events

3. **Database (MySQL)**
   - Stores persistent data (users, rooms, messages)

---

## Database Schema

### Tables

#### 1. **users** Table
```sql
- id (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- username (VARCHAR(50), UNIQUE, NOT NULL)
- email (VARCHAR(100), UNIQUE, NOT NULL)
- password (VARCHAR, NOT NULL) - Hashed with BCrypt
- created_at (DATETIME)
- is_online (BOOLEAN) - Tracks online status
```

#### 2. **chat_rooms** Table
```sql
- id (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- name (VARCHAR(100), NOT NULL)
- description (TEXT)
- created_at (DATETIME)
- created_by (BIGINT, FOREIGN KEY -> users.id)
```

#### 3. **messages** Table
```sql
- id (BIGINT, PRIMARY KEY, AUTO_INCREMENT)
- room_id (BIGINT, FOREIGN KEY -> chat_rooms.id, NOT NULL)
- user_id (BIGINT, FOREIGN KEY -> users.id, NOT NULL)
- content (TEXT, NOT NULL)
- created_at (DATETIME)
```

#### 4. **room_members** Table (Join Table)
```sql
- room_id (BIGINT, FOREIGN KEY -> chat_rooms.id)
- user_id (BIGINT, FOREIGN KEY -> users.id)
- PRIMARY KEY (room_id, user_id)
```

### Entity Relationships

- **User ↔ ChatRoom**: Many-to-Many (users can join multiple rooms, rooms have multiple users)
- **User ↔ Message**: One-to-Many (one user can send many messages)
- **ChatRoom ↔ Message**: One-to-Many (one room can have many messages)
- **User ↔ ChatRoom (creator)**: Many-to-One (one user can create many rooms)

---

## Features & Functionality

### 1. User Authentication

**Registration:**
- User provides username, email, and password
- Backend validates uniqueness of username and email
- Password is hashed using BCrypt
- JWT token is generated and returned
- User is automatically logged in

**Login:**
- User provides username and password
- Backend verifies credentials
- If valid, JWT token is generated
- User's online status is set to `true`
- Token is stored in localStorage

**Logout:**
- Token is removed from localStorage
- Socket.IO connection is disconnected
- User's online status is set to `false`

### 2. Chat Room Management

**Create Room:**
- User provides room name and optional description
- Room is created in database
- Creator is automatically added as a member

**Join Room:**
- User selects a room from the list
- User is added to room_members table (via REST API)
- User joins Socket.IO room (via WebSocket)
- Other members are notified

**Leave Room:**
- User is removed from room_members table
- User leaves Socket.IO room
- Other members are notified

**View Rooms:**
- Lists all available chat rooms
- Shows room name, description, and member count

### 3. Real-time Messaging

**Send Message:**
- User types message and presses Enter or clicks Send
- Message is sent via Socket.IO (`send_message` event)
- Backend saves message to database
- Message is broadcasted to all room members via `message_received` event
- Message appears instantly for all users

**Receive Messages:**
- Frontend listens for `message_received` event
- New messages are added to the message list
- Messages are displayed with username, content, and timestamp
- User's own messages appear on the right (blue), others on the left (white)

**Message History:**
- When joining a room, all previous messages are loaded via REST API
- Messages are displayed in chronological order
- Auto-scrolls to bottom when new messages arrive

### 4. Typing Indicators

**How it Works:**
1. When user starts typing, frontend emits `typing_start` event
2. Backend broadcasts `user_typing` event to other room members
3. Other users see "{username} typing..." message
4. After 2 seconds of inactivity, frontend emits `typing_stop` event
5. Backend broadcasts `user_stopped_typing` event
6. Typing indicator is removed

**Implementation Details:**
- Uses debouncing (2-second timeout)
- Only shows typing indicator for other users (not yourself)
- Automatically stops when message is sent

### 5. User Presence

**Online/Offline Status:**
- When user connects via Socket.IO, `is_online` is set to `true`
- When user disconnects, `is_online` is set to `false`
- Status is stored in database

**Join/Leave Notifications:**
- When user joins a room, others see: "{username} joined the room"
- When user leaves a room, others see: "{username} left the room"
- These are system messages (not regular messages)

---

## Socket.IO Deep Dive

### What is Socket.IO?

Socket.IO is a library that enables **real-time, bidirectional communication** between client and server. It uses WebSockets under the hood but provides additional features like automatic reconnection, room management, and event-based communication.

### Key Concepts

#### 1. **Connection**
- Client connects to server using `io.connect(url)`
- Connection is persistent (stays open)
- Server assigns a unique `socket.id` to each client

#### 2. **Events**
- **Emit**: Send data from client to server or server to client
- **Listen**: Receive data on the other end
- Events are named (e.g., `send_message`, `message_received`)

#### 3. **Rooms**
- Virtual channels that group sockets
- Messages can be sent to all sockets in a room
- A socket can join/leave multiple rooms

#### 4. **Namespaces**
- Separate communication channels
- Default namespace is `/`
- Useful for organizing different parts of an application

### How Socket.IO Works in This Project

#### **Connection Setup**

**Frontend (`socket.js`):**
```javascript
socket = io(SOCKET_URL, {
  query: { token: token },  // Send JWT token during handshake
  transports: ["websocket", "polling"]
});
```

**Backend (`SocketIOConfig.java`):**
- Server starts on port 9092
- CORS is configured to allow frontend connections
- Server listens for incoming connections

#### **Authentication**

When client connects:
1. Client sends JWT token in query parameter
2. Backend validates token in `@OnConnect` handler
3. If valid, user info (userId, username) is stored in socket session
4. User's online status is updated to `true`

#### **Joining a Room**

**Flow:**
1. Frontend emits `join_room` event with `roomId`
2. Backend receives event in `onJoinRoom()` method
3. Server validates user and room exist
4. Socket leaves previous room (if any)
5. Socket joins new room: `client.joinRoom(String.valueOf(roomId))`
6. Server broadcasts `user_joined_room` to other members
7. Server sends `room_joined` confirmation to client

**Code Example:**
```java
@OnEvent("join_room")
public void onJoinRoom(SocketIOClient client, Map<String, Object> data) {
    Long roomId = Long.valueOf(data.get("roomId").toString());
    client.joinRoom(String.valueOf(roomId));
    // Broadcast to others
    client.getNamespace().getRoomOperations(String.valueOf(roomId))
        .sendEvent("user_joined_room", userInfo);
}
```

#### **Sending Messages**

**Flow:**
1. User types message and clicks Send
2. Frontend emits `send_message` event with `roomId` and `content`
3. Backend receives event in `onSendMessage()` method
4. Server saves message to database
5. Server converts message to DTO (Data Transfer Object)
6. Server broadcasts `message_received` event to all sockets in the room
7. All clients in the room receive the message instantly

**Code Example:**
```java
@OnEvent("send_message")
public void onSendMessage(SocketIOClient client, Map<String, Object> data) {
    // Save to database
    Message savedMessage = messageRepository.save(message);
    
    // Broadcast to room
    client.getNamespace().getRoomOperations(roomIdStr)
        .sendEvent("message_received", messageDTO);
}
```

**Frontend Reception:**
```javascript
socket.on("message_received", (message) => {
    // Only add if message is for current room
    if (message.roomId === currentRoomId) {
        setMessages(prev => [...prev, message]);
    }
});
```

#### **Typing Indicators**

**Start Typing:**
1. User starts typing in input field
2. Frontend emits `typing_start` event with `roomId`
3. Backend broadcasts `user_typing` event to other room members
4. Other users see "{username} typing..."

**Stop Typing:**
1. After 2 seconds of inactivity, frontend emits `typing_stop` event
2. Backend broadcasts `user_stopped_typing` event
3. Typing indicator is removed

**Code Example:**
```javascript
// Frontend
const handleTyping = () => {
    if (!isTyping) {
        socket.emit("typing_start", { roomId });
    }
    // Clear timeout and set new one (debouncing)
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_stop", { roomId });
    }, 2000);
};
```

#### **Disconnection**

When client disconnects:
1. `@OnDisconnect` handler is triggered
2. User's online status is set to `false`
3. User is removed from room tracking
4. Other room members are notified via `user_left_room` event

### Socket.IO Events Summary

#### **Client → Server Events:**
- `join_room`: Join a chat room
- `leave_room`: Leave a chat room
- `send_message`: Send a message
- `typing_start`: User started typing
- `typing_stop`: User stopped typing

#### **Server → Client Events:**
- `connect`: Socket connected
- `disconnect`: Socket disconnected
- `room_joined`: Confirmation of joining room
- `room_left`: Confirmation of leaving room
- `message_received`: New message in room
- `user_joined_room`: Another user joined
- `user_left_room`: Another user left
- `user_typing`: Another user is typing
- `user_stopped_typing`: Another user stopped typing
- `error`: Error occurred

---

## Authentication & Security

### JWT (JSON Web Token) Authentication

**What is JWT?**
- A compact, URL-safe token that contains user information
- Consists of three parts: Header.Payload.Signature
- Stateless (server doesn't need to store sessions)

**Token Structure:**
```
Header: Algorithm and token type
Payload: User data (username, userId, expiration)
Signature: Ensures token hasn't been tampered with
```

**How it Works:**
1. User logs in/registers
2. Server generates JWT token with user info
3. Token is sent to client
4. Client stores token in localStorage
5. Client includes token in HTTP headers: `Authorization: Bearer <token>`
6. Server validates token on each request

**Token Validation:**
- `JwtAuthenticationFilter` intercepts requests
- Extracts token from `Authorization` header
- Validates token signature and expiration
- Sets authentication in Spring Security context

**Password Security:**
- Passwords are hashed using BCrypt
- BCrypt is a one-way hashing algorithm
- Even if database is compromised, passwords can't be recovered

### Security Features

1. **CORS Configuration**: Only allows requests from frontend origin
2. **Password Hashing**: BCrypt with salt rounds
3. **Token Expiration**: Tokens expire after 24 hours (86400000 ms)
4. **Input Validation**: Server validates all inputs
5. **SQL Injection Protection**: JPA/Hibernate prevents SQL injection

---

## API Endpoints

### Authentication Endpoints

**POST `/api/auth/register`**
- Register a new user
- Request Body: `{ username, email, password }`
- Response: `{ token, username, userId, message }`

**POST `/api/auth/login`**
- Login existing user
- Request Body: `{ username, password }`
- Response: `{ token, username, userId, message }`

### Room Endpoints

**GET `/api/rooms`**
- Get all chat rooms
- Headers: `Authorization: Bearer <token>`
- Response: `[{ id, name, description, createdAt, createdBy }]`

**GET `/api/rooms/{id}`**
- Get room by ID
- Headers: `Authorization: Bearer <token>`
- Response: `{ id, name, description, createdAt, createdBy }`

**POST `/api/rooms`**
- Create a new room
- Headers: `Authorization: Bearer <token>`
- Request Body: `{ name, description }`
- Response: `{ id, name, description, createdAt, createdBy }`

**POST `/api/rooms/{roomId}/join`**
- Join a room
- Headers: `Authorization: Bearer <token>`
- Response: `{ message: "Joined room successfully" }`

**POST `/api/rooms/{roomId}/leave`**
- Leave a room
- Headers: `Authorization: Bearer <token>`
- Response: `{ message: "Left room successfully" }`

### Message Endpoints

**GET `/api/messages/room/{roomId}/all`**
- Get all messages in a room
- Headers: `Authorization: Bearer <token>`
- Response: `[{ id, roomId, userId, username, content, createdAt }]`

**POST `/api/messages`**
- Send a message (alternative to Socket.IO)
- Headers: `Authorization: Bearer <token>`
- Request Body: `{ roomId, content }`
- Response: `{ id, roomId, userId, username, content, createdAt }`

---

## Frontend Components

### 1. **AuthContext** (`context/AuthContext.jsx`)
- Manages user authentication state
- Provides `login`, `register`, `logout` functions
- Stores user info and token
- Connects Socket.IO on login

### 2. **Login** (`components/Auth/Login.jsx`)
- Login form component
- Validates input and calls `authAPI.login()`
- Redirects to chat on success

### 3. **Register** (`components/Auth/Register.jsx`)
- Registration form component
- Validates input and calls `authAPI.register()`
- Redirects to chat on success

### 4. **ChatRoom** (`components/Chat/ChatRoom.jsx`)
- Main chat interface container
- Manages selected room state
- Coordinates RoomList, MessageList, and MessageInput
- Handles socket connection status

### 5. **RoomList** (`components/Chat/RoomList.jsx`)
- Displays list of available rooms
- Allows creating new rooms
- Highlights selected room
- Shows room details

### 6. **MessageList** (`components/Chat/MessageList.jsx`)
- Displays all messages in a room
- Loads message history on room change
- Listens for real-time messages via Socket.IO
- Shows typing indicators
- Auto-scrolls to bottom

### 7. **MessageInput** (`components/Chat/MessageInput.jsx`)
- Input field for typing messages
- Handles message submission
- Manages typing indicators
- Sends messages via Socket.IO

### Component Hierarchy

```
App
└── AuthProvider
    ├── Login / Register (if not authenticated)
    └── ChatRoom (if authenticated)
        ├── RoomList
        └── Chat Area
            ├── MessageList
            └── MessageInput
```

---

## Real-time Communication Flow

### Complete Message Flow

1. **User Types Message**
   - User types in `MessageInput` component
   - `typing_start` event is emitted (if first keystroke)

2. **User Sends Message**
   - User presses Enter or clicks Send
   - `typing_stop` event is emitted
   - Optimistic message is added to UI immediately
   - `send_message` event is emitted via Socket.IO

3. **Backend Processing**
   - `onSendMessage()` handler receives event
   - Message is saved to database
   - Message is converted to DTO
   - `message_received` event is broadcasted to room

4. **Message Reception**
   - All clients in room receive `message_received` event
   - `MessageList` component adds message to state
   - Message appears in UI for all users
   - Optimistic message is replaced with real message

### Room Join Flow

1. **User Selects Room**
   - User clicks room in `RoomList`
   - `handleSelectRoom()` is called

2. **Leave Previous Room**
   - If user was in another room, `leave_room` event is emitted
   - User is removed from previous room

3. **Join New Room (REST API)**
   - `roomAPI.join(roomId)` is called
   - User is added to `room_members` table in database

4. **Join New Room (Socket.IO)**
   - `join_room` event is emitted
   - Backend adds socket to room
   - Other members receive `user_joined_room` event
   - Client receives `room_joined` confirmation

5. **Load Messages**
   - `MessageList` component loads message history via REST API
   - Messages are displayed

6. **Set Up Listeners**
   - Socket.IO listeners are set up for:
     - `message_received`
     - `user_typing`
     - `user_stopped_typing`
     - `user_joined_room`
     - `user_left_room`

---

## Viva Questions & Answers

### General Questions

**Q1: What is this project about?**
**A:** This is a real-time broadcast-based chat application called "YapItUp Chat". It allows multiple users to communicate in chat rooms with instant message delivery, typing indicators, and user presence features.

**Q2: Why did you choose these technologies?**
**A:** 
- **Spring Boot**: Industry-standard Java framework, provides robust backend infrastructure
- **React**: Modern, component-based UI library with excellent performance
- **Socket.IO**: Simplifies WebSocket implementation and provides features like automatic reconnection
- **MySQL**: Reliable relational database for structured data
- **JWT**: Stateless authentication, scalable and secure

**Q3: What is the difference between REST API and Socket.IO?**
**A:** 
- **REST API**: Request-response pattern, client sends request and waits for response. Used for CRUD operations (create room, join room, get messages).
- **Socket.IO**: Persistent bidirectional connection, server can push data to client. Used for real-time features (instant messages, typing indicators).

**Q4: What is the architecture of your application?**
**A:** Three-tier architecture:
1. **Presentation Layer**: React frontend (UI components)
2. **Business Logic Layer**: Spring Boot backend (controllers, services)
3. **Data Layer**: MySQL database (persistent storage)

### Socket.IO Questions

**Q5: What is Socket.IO and why did you use it?**
**A:** Socket.IO is a library that enables real-time, bidirectional communication between client and server. It uses WebSockets but provides additional features like:
- Automatic reconnection
- Room management
- Event-based communication
- Fallback to polling if WebSockets aren't available

I used it because it simplifies implementing real-time features like instant messaging and typing indicators.

**Q6: How does Socket.IO work in your project?**
**A:** 
1. Client connects to Socket.IO server on port 9092
2. Connection is authenticated using JWT token
3. Client joins rooms when user selects a chat room
4. When user sends message, client emits `send_message` event
5. Server receives event, saves to database, and broadcasts `message_received` to all room members
6. All clients in room receive the message instantly

**Q7: Explain the message sending flow using Socket.IO.**
**A:** 
1. User types message and clicks Send
2. Frontend emits `send_message` event with `roomId` and `content`
3. Backend `onSendMessage()` handler receives the event
4. Message is saved to database
5. Server broadcasts `message_received` event to all sockets in the room
6. All clients receive the event and display the message

**Q8: How do typing indicators work?**
**A:** 
1. When user starts typing, frontend emits `typing_start` event
2. Backend broadcasts `user_typing` event to other room members
3. Other users see "{username} typing..."
4. After 2 seconds of inactivity, frontend emits `typing_stop`
5. Backend broadcasts `user_stopped_typing` event
6. Typing indicator is removed

**Q9: What is a Socket.IO room?**
**A:** A room is a virtual channel that groups multiple socket connections. Messages sent to a room are delivered to all sockets in that room. In this project, each chat room has a corresponding Socket.IO room.

**Q10: How do users join and leave rooms in Socket.IO?**
**A:** 
- **Join**: Client emits `join_room` event with `roomId`. Server calls `client.joinRoom(roomId)`.
- **Leave**: Client emits `leave_room` event. Server calls `client.leaveRoom(roomId)`.

### Database Questions

**Q11: Explain your database schema.**
**A:** Four main tables:
- **users**: Stores user information (id, username, email, password, is_online)
- **chat_rooms**: Stores room information (id, name, description, created_by)
- **messages**: Stores messages (id, room_id, user_id, content, created_at)
- **room_members**: Join table for many-to-many relationship between users and rooms

**Q12: What are the relationships between entities?**
**A:** 
- User ↔ ChatRoom: Many-to-Many (users can join multiple rooms)
- User ↔ Message: One-to-Many (one user sends many messages)
- ChatRoom ↔ Message: One-to-Many (one room has many messages)
- User ↔ ChatRoom (creator): Many-to-One (one user can create many rooms)

**Q13: Why did you use a join table for room_members?**
**A:** Because the relationship between users and rooms is many-to-many (a user can join multiple rooms, and a room can have multiple users). A join table is required to represent this relationship in a relational database.

### Authentication Questions

**Q14: How does authentication work in your project?**
**A:** 
1. User registers/logs in via REST API
2. Server validates credentials
3. Server generates JWT token containing user info (username, userId)
4. Token is sent to client and stored in localStorage
5. Client includes token in HTTP headers: `Authorization: Bearer <token>`
6. Server validates token on each request using `JwtAuthenticationFilter`

**Q15: What is JWT and why did you use it?**
**A:** JWT (JSON Web Token) is a compact, URL-safe token that contains user information. I used it because:
- **Stateless**: Server doesn't need to store sessions
- **Scalable**: Works well with multiple servers
- **Secure**: Token is signed, preventing tampering
- **Self-contained**: Contains all necessary user info

**Q16: How are passwords stored?**
**A:** Passwords are hashed using BCrypt before storing in database. BCrypt is a one-way hashing algorithm with salt, making it extremely difficult to reverse. Even if the database is compromised, passwords cannot be recovered.

**Q17: How is Socket.IO connection authenticated?**
**A:** JWT token is sent as a query parameter during Socket.IO handshake. Backend validates the token in `@OnConnect` handler. If valid, user info is stored in socket session. If invalid, connection is rejected.

### Frontend Questions

**Q18: Explain the React component structure.**
**A:** 
- **AuthContext**: Manages authentication state globally
- **Login/Register**: Authentication forms
- **ChatRoom**: Main container component
- **RoomList**: Displays and manages rooms
- **MessageList**: Displays messages and handles real-time updates
- **MessageInput**: Input field for sending messages

**Q19: How does the frontend handle real-time updates?**
**A:** 
1. Socket.IO client connects on login
2. Components set up event listeners (e.g., `socket.on("message_received")`)
3. When server emits events, listeners update React state
4. React re-renders components with new data
5. UI updates instantly

**Q20: What is optimistic UI update?**
**A:** When user sends a message, it's immediately added to the UI before server confirmation. This makes the app feel faster. When the real message arrives from server, the optimistic message is replaced.

### Backend Questions

**Q21: Explain the Spring Boot architecture.**
**A:** 
- **Controllers**: Handle HTTP requests, return responses
- **Services**: Contain business logic
- **Repositories**: Interface with database using JPA
- **Models/Entities**: Represent database tables
- **DTOs**: Data Transfer Objects for API responses
- **Config**: Configuration classes (Security, Socket.IO)

**Q22: What is the difference between Entity and DTO?**
**A:** 
- **Entity**: Represents database table, contains all fields and relationships
- **DTO**: Data Transfer Object, contains only data needed for API response, prevents exposing internal structure

**Q23: How does Spring Security work in your project?**
**A:** 
- `SecurityConfig` configures security rules
- `JwtAuthenticationFilter` intercepts requests and validates JWT tokens
- Protected endpoints require valid token in `Authorization` header
- PasswordEncoder (BCrypt) hashes passwords

### Technical Questions

**Q24: What is CORS and why did you configure it?**
**A:** CORS (Cross-Origin Resource Sharing) allows frontend (running on port 5173) to make requests to backend (running on port 8081). Without CORS, browsers block these requests for security.

**Q25: How do you handle errors?**
**A:** 
- Backend returns appropriate HTTP status codes (400, 401, 404, 500)
- Frontend catches errors and displays user-friendly messages
- Socket.IO errors trigger reconnection attempts

**Q26: What happens if Socket.IO connection is lost?**
**A:** Socket.IO client automatically attempts to reconnect. When reconnected, client can rejoin rooms and continue receiving messages.

**Q27: How do you prevent duplicate messages?**
**A:** 
- Messages have unique IDs
- Before adding message, frontend checks if message with same ID already exists
- Optimistic messages are replaced when real message arrives

**Q28: What is the difference between WebSocket and Socket.IO?**
**A:** 
- **WebSocket**: Native browser API, low-level protocol
- **Socket.IO**: Library built on WebSocket, provides:
  - Automatic reconnection
  - Room management
  - Event-based API
  - Fallback to polling
  - Better error handling

**Q29: How do you ensure messages are delivered?**
**A:** 
- Messages are saved to database before broadcasting
- If Socket.IO fails, messages can be retrieved via REST API
- Database ensures persistence

**Q30: What are the limitations of your current implementation?**
**A:** 
- Single server (not scalable to multiple servers)
- No message editing/deletion
- No file/image sharing
- No private/direct messages
- No message search
- No read receipts
- No message reactions

### Project-Specific Questions

**Q31: What is "broadcast-based" chat?**
**A:** Messages sent in a room are broadcasted to all members in that room simultaneously. Everyone sees the same messages in real-time.

**Q32: Can users send private messages?**
**A:** No, currently all messages are public within a room. Only room members can see messages.

**Q33: How do you handle multiple users typing at the same time?**
**A:** Each user's typing status is tracked separately. The UI displays all typing users: "User1, User2 typing..."

**Q34: What happens when a user disconnects?**
**A:** 
- User's online status is set to `false` in database
- Other room members are notified via `user_left_room` event
- User can reconnect and rejoin rooms

**Q35: How do you test your application?**
**A:** 
- Manual testing: Open multiple browser windows/tabs
- Test different scenarios: join/leave rooms, send messages, typing indicators
- Check database to verify data persistence

**Q36: What improvements would you make?**
**A:** 
- Add message editing/deletion
- Implement file/image sharing
- Add private messaging
- Implement message search
- Add read receipts
- Scale to multiple servers using Redis adapter
- Add message pagination for large rooms
- Implement user profiles and avatars

**Q37: How would you scale this application?**
**A:** 
- Use Redis adapter for Socket.IO to share state across multiple servers
- Load balance multiple backend servers
- Use database connection pooling
- Implement caching for frequently accessed data
- Use CDN for static frontend assets

**Q38: What security measures did you implement?**
**A:** 
- Password hashing with BCrypt
- JWT token authentication
- CORS configuration
- Input validation
- SQL injection protection via JPA
- Token expiration

**Q39: Explain the complete flow when a user sends a message.**
**A:** 
1. User types in MessageInput component
2. User clicks Send or presses Enter
3. Frontend emits `send_message` via Socket.IO
4. Backend `onSendMessage()` receives event
5. Message is saved to database
6. Server broadcasts `message_received` to all room members
7. All clients receive event and update UI
8. Message appears for all users instantly

**Q40: What is the role of REST API vs Socket.IO in your project?**
**A:** 
- **REST API**: Used for CRUD operations (create room, join room, get messages, authentication)
- **Socket.IO**: Used for real-time features (instant messaging, typing indicators, user presence)

---

## Conclusion

This project demonstrates a full-stack real-time chat application using modern web technologies. The combination of Spring Boot for robust backend services, React for dynamic frontend, and Socket.IO for real-time communication creates a seamless chat experience.

Key achievements:
- ✅ Real-time messaging with instant delivery
- ✅ User authentication with JWT
- ✅ Multi-room chat functionality
- ✅ Typing indicators
- ✅ User presence tracking
- ✅ Clean, maintainable code structure

---

## Quick Reference

### Ports
- Frontend: `5173` (Vite dev server)
- Backend REST API: `8081`
- Socket.IO Server: `9092`
- MySQL: `3306`

### Key Files
- Backend: `SocketIOEventHandler.java`, `SocketIOConfig.java`, `AuthController.java`
- Frontend: `socket.js`, `MessageList.jsx`, `MessageInput.jsx`, `ChatRoom.jsx`
- Database: `schema.sql` (auto-generated by Hibernate)

### Important Concepts
- **Socket.IO Rooms**: Virtual channels for grouping connections
- **JWT Tokens**: Stateless authentication mechanism
- **BCrypt**: Password hashing algorithm
- **Optimistic Updates**: Immediate UI updates before server confirmation
- **Event-Driven Architecture**: Communication via events (emit/listen)

---

**Good luck with your viva!** 🎓

