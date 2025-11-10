# PUT Help - Student Guide Platform

A comprehensive student guide platform for Poznań University of Technology (PUT) that enables students to create, share, and discover educational content, guides, tutorials, FAQs, and announcements organized by study fields (kierunek) and categories.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Docker Deployment](#docker-deployment)
- [License](#license)

## ✨ Features

### User Management
- **Authentication & Authorization**
  - JWT-based authentication with access and refresh tokens
  - Role-based access control (STUDENT, MODERATOR, ADMIN)
  - Secure password hashing with custom encoder
  - Session management with Redis
  - Password change functionality

- **User Profiles**
  - User registration and login
  - Profile management
  - Study field (kierunek) association
  - User status management (active/inactive)

### Content Management
- **Content Types**
  - Guides
  - Tutorials
  - FAQs
  - News
  - Announcements

- **Content Features**
  - Markdown support for rich text content
  - Content categorization
  - Study field (kierunek) filtering
  - Tag system
  - Draft/Published/Archived status workflow
  - View count tracking
  - Content search and filtering

### Administrative Features
- **Admin Dashboard**
  - User management (view, update roles, activate/deactivate, delete)
  - Content moderation
  - Study field (kierunek) management
  - Category management
  - System statistics

### Frontend Features
- **Modern UI/UX**
  - Responsive design with Tailwind CSS
  - Angular 17 with standalone components
  - Lazy-loaded routes for optimal performance
  - Markdown rendering for content display
  - Authentication guards and role-based route protection

## 🛠 Technology Stack

### Backend
- **Framework**: Spring Boot 3.2.0
- **Language**: Java 17
- **Database**: PostgreSQL 15
- **Cache/Session Store**: Redis 7
- **Security**: Spring Security with JWT
- **Build Tool**: Maven 3.9
- **API**: RESTful API

### Frontend
- **Framework**: Angular 17
- **Language**: TypeScript 5.2
- **Styling**: Tailwind CSS 3.3
- **Markdown**: Marked 16.2
- **Build Tool**: Angular CLI 17

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Web Server**: Nginx (for frontend)
- **Database**: PostgreSQL (Alpine)
- **Cache**: Redis (Alpine)

## 🏗 Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Angular)     │
│   Port: 80      │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│    Backend      │
│  (Spring Boot)  │
│   Port: 8080    │
└────┬───────┬────┘
     │       │
     │       │
┌────▼───┐ ┌─▼─────┐
│Postgres│ │ Redis │
│ 5432   │ │ 6379  │
└────────┘ └───────┘
```

### Project Structure

```
puthelp/
├── backend/                          # Spring Boot backend application
│   ├── src/
│   │   └── main/
│   │       ├── java/com/puthelp/
│   │       │   ├── config/           # Configuration classes
│   │       │   │   ├── JpaConfig.java
│   │       │   │   ├── RedisConfig.java
│   │       │   │   └── WebSecurityConfig.java
│   │       │   ├── controller/       # REST controllers
│   │       │   │   ├── AuthController.java
│   │       │   │   ├── CategoryController.java
│   │       │   │   ├── ContentController.java
│   │       │   │   └── KierunekController.java
│   │       │   ├── dto/              # Data Transfer Objects
│   │       │   │   ├── auth/         # Authentication DTOs
│   │       │   │   ├── content/      # Content DTOs
│   │       │   │   └── response/     # Response DTOs
│   │       │   ├── entity/           # JPA entities
│   │       │   │   ├── Category.java
│   │       │   │   ├── Content.java
│   │       │   │   ├── Kierunek.java
│   │       │   │   ├── Role.java
│   │       │   │   └── User.java
│   │       │   ├── repository/       # Data repositories
│   │       │   │   ├── CategoryRepository.java
│   │       │   │   ├── ContentRepository.java
│   │       │   │   ├── KierunekRepository.java
│   │       │   │   ├── RoleRepository.java
│   │       │   │   └── UserRepository.java
│   │       │   ├── security/        # Security configuration
│   │       │   │   ├── AuthEntryPointJwt.java
│   │       │   │   ├── AuthTokenFilter.java
│   │       │   │   ├── CustomPasswordEncoder.java
│   │       │   │   ├── JwtUtils.java
│   │       │   │   ├── UserDetailsServiceImpl.java
│   │       │   │   └── UserPrincipal.java
│   │       │   ├── service/         # Business logic
│   │       │   │   ├── ContentService.java
│   │       │   │   └── DataInitializationService.java
│   │       │   └── PuthelpBackendApplication.java
│   │       └── resources/
│   │           ├── application.yml      # Development configuration
│   │           └── application-prod.yml # Production configuration
│   ├── .dockerignore
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                          # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/                  # Core services, guards, interceptors
│   │   │   │   ├── guards/            # Route guards
│   │   │   │   ├── interceptors/      # HTTP interceptors
│   │   │   │   ├── models/            # TypeScript models
│   │   │   │   └── services/          # Core services
│   │   │   ├── features/              # Feature modules
│   │   │   │   ├── admin/             # Admin dashboard
│   │   │   │   ├── auth/              # Authentication (login, register)
│   │   │   │   ├── content/           # Content management
│   │   │   │   ├── home/              # Home page
│   │   │   │   ├── profile/           # User profile
│   │   │   │   └── settings/          # User settings
│   │   │   ├── shared/                # Shared components
│   │   │   │   └── components/        # Reusable components
│   │   │   │       ├── footer/
│   │   │   │       ├── navbar/
│   │   │   │       └── not-found/
│   │   │   ├── app.component.ts
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── environments/              # Environment configurations
│   │   │   ├── environment.ts         # Development
│   │   │   └── environment.prod.ts     # Production
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.scss
│   ├── .dockerignore
│   ├── angular.json                    # Angular configuration
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── tsconfig.json                   # TypeScript configuration
│   ├── tsconfig.app.json
│   └── tsconfig.spec.json
├── .gitignore                          # Git ignore rules
├── docker-compose.yml                  # Docker Compose configuration
├── LICENSE                              # MIT License
└── README.md                            # Project documentation
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Java Development Kit (JDK)**: Version 17 or higher
- **Maven**: Version 3.6 or higher
- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher

### Verify Installation

```bash
java -version    # Should show Java 17+
mvn -version     # Should show Maven 3.6+
node -v          # Should show Node.js 18+
npm -v           # Should show npm 9+
docker --version # Should show Docker 20.10+
docker-compose --version # Should show Docker Compose 2.0+
```

## 🚀 Installation

### Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd puthelp
   ```

2. **Start Database Services**

```bash
docker-compose up -d postgres redis
```

Wait for services to be healthy (check with `docker-compose ps`).

3. **Backend Setup**

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will be available at `http://localhost:8080/api`

4. **Frontend Setup**

```bash
cd frontend
npm install
npm start
```

The frontend will be available at `http://localhost:4200`

## ⚙️ Configuration

### Backend Configuration

The backend configuration is located in `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/puthelp
    username: ${DB_USERNAME:puthelp}
    password: ${DB_PASSWORD:puthelp}
  
  data:
    redis:
      host: ${REDIS_HOST:localhost}
      port: ${REDIS_PORT:6379}
      password: ${REDIS_PASSWORD:}

jwt:
  secret: ${JWT_SECRET:mySecretKey123456789012345678901234567890}
  access:
    expiration: 900000  # 15 minutes
  refresh:
    expiration: 10800000  # 3 hours

cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:4200}
```

### Environment Variables

Create a `.env` file in the project root (or use environment variables):

```bash
# Database
DB_USERNAME=puthelp
DB_PASSWORD=puthelp

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# CORS
CORS_ORIGINS=http://localhost:4200,http://localhost:80
```

### Frontend Configuration

Frontend environment files are located in `frontend/src/environments/`:

**environment.ts** (development):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api'
};
```

**environment.prod.ts** (production):
```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api'
};
```

## 💻 Usage

### Accessing the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:8080/api
- **API Health Check**: http://localhost:8080/api/health (if implemented)

### Default User Roles

The application supports three user roles:

- **STUDENT**: Default role for registered users. Can create and manage their own content.
- **MODERATOR**: Can moderate content created by students.
- **ADMIN**: Full system access including user management, content moderation, and system configuration.

### First-Time Setup

1. **Register a new account** via the registration page
2. **Login** with your credentials
3. **Create content** (guides, tutorials, FAQs, etc.)
4. **Assign admin role** (requires database access or admin endpoint):
   ```bash
   # Via API or database update
   # Update user roles in the database or use admin endpoint
   ```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/signin` - Login and get JWT tokens
- `POST /api/auth/signout` - Logout and invalidate tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user information
- `POST /api/auth/change-password` - Change user password

### Content Endpoints

- `GET /api/content` - List all content (with pagination and filters)
- `GET /api/content/{id}` - Get content by ID
- `POST /api/content` - Create new content (authenticated)
- `PUT /api/content/{id}` - Update content (owner or moderator)
- `DELETE /api/content/{id}` - Delete content (owner or moderator)

### Category Endpoints

- `GET /api/categories` - List all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/{id}` - Update category (admin)
- `DELETE /api/categories/{id}` - Delete category (admin)

### Kierunek (Study Field) Endpoints

- `GET /api/kierunek` - List all study fields
- `POST /api/kierunek` - Create study field (admin)
- `PUT /api/kierunek/{id}` - Update study field (admin)
- `DELETE /api/kierunek/{id}` - Delete study field (admin)

### Admin Endpoints

- `GET /api/auth/admin/users` - List all users (admin only)
- `PUT /api/auth/admin/users/{id}/role` - Update user role (admin only)
- `PUT /api/auth/admin/users/{id}/status` - Update user status (admin only)
- `DELETE /api/auth/admin/users/{id}` - Delete user (admin only)

### Example API Request

```bash
# Login
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student",
    "password": "password123"
  }'

# Get content (with JWT token)
curl -X GET http://localhost:8080/api/content \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 Development

### Backend Development

```bash
cd backend

# Run tests
mvn test

# Build application
mvn clean package

# Run with hot reload (requires Spring Boot DevTools)
mvn spring-boot:run
```

### Frontend Development

```bash
cd frontend

# Run development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Build with watch mode
npm run watch
```

### Code Style

- **Backend**: Follow Java conventions and Spring Boot best practices
- **Frontend**: Follow Angular style guide and TypeScript conventions

## 🐳 Docker Deployment

### Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Individual Service Management

```bash
# Start only database services
docker-compose up -d postgres redis

# Start backend
docker-compose up -d backend

# Start frontend
docker-compose up -d frontend

# Restart a service
docker-compose restart backend

# View service logs
docker-compose logs -f backend
```

### Production Deployment

For production deployment:

1. **Update environment variables** in `docker-compose.yml`:
   - Use strong `JWT_SECRET`
   - Set secure database passwords
   - Configure proper `CORS_ORIGINS`

2. **Use production profiles**:
   ```yaml
   SPRING_PROFILES_ACTIVE=prod
   ```

3. **Configure reverse proxy** (nginx/traefik) for SSL/TLS

4. **Set up database backups** for PostgreSQL

5. **Configure Redis persistence** for session management

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Made with ❤️ for PUT students**

