# The Workout Hub

A full-stack fitness tracking and workout management application built
to help users plan workouts, track completed sessions, manage exercises,
and monitor fitness progress.

## Overview

**The Workout Hub** is designed as a fitness-focused social and tracking
platform. Users can create reusable workout templates, perform and
record workouts, manage exercises, store workout notes and media, and
track progress over time.

The project is being developed as a **MERN stack** application with a
React + TypeScript frontend and a Node.js/Express backend using MongoDB
for data storage.

The project requirements cover user profile management, workout template
management, exercise management, active workout tracking, and progress
tracking. fileciteturn0file0L47-L58

## Features

### User Management

-   User registration
-   User login and logout
-   Authentication-protected user resources
-   User profile management
-   Personal fitness information such as height and weight

### Workout Templates

-   Create custom workout templates
-   Give templates custom names
-   Add exercises to templates
-   Configure the number of sets
-   Configure set parameters such as weight and repetitions
-   Add rest periods
-   Add notes, images, and videos
-   Edit templates
-   Discard/delete templates

### Exercise Management

-   Use predefined exercises
-   Create custom exercises
-   Add exercise descriptions
-   Add exercise images or videos
-   Remove custom exercises

### Active Workout Tracking

-   Start a workout from a template or as a new workout
-   Track completed sets
-   Edit exercises while a workout is in progress
-   Record workout data
-   Complete and save workouts
-   Discard workouts

### Progress Tracking

-   Track exercise performance over time
-   Record metrics such as maximum weight
-   Review historical workout information
-   Track changes in fitness performance

### Social / Progress Sharing

The planned system also supports connecting with friends and viewing
fitness updates, allowing users to share aspects of their progress.

## Technology Stack

### Frontend

-   React.js
-   TypeScript
-   HTML5
-   CSS
-   REST API integration

### Backend

-   Node.js
-   Express.js
-   JavaScript
-   RESTful API
-   Authentication middleware

### Database

-   MongoDB
-   Mongoose

### Development Tools

-   Git
-   GitHub
-   Visual Studio Code
-   MongoDB Compass

## High-Level Architecture

``` text
┌──────────────────────────────┐
│        React + TypeScript    │
│          Frontend            │
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               ▼
┌──────────────────────────────┐
│       Node.js + Express      │
│           Backend            │
├──────────────────────────────┤
│ Routes                       │
│ Controllers                  │
│ Middleware                   │
│ Authentication               │
│ Business Logic               │
└──────────────┬───────────────┘
               │
               │ Mongoose
               ▼
┌──────────────────────────────┐
│           MongoDB            │
│        Application Data      │
└──────────────────────────────┘
```

## Core Domain Model

The main concepts in the system are:

-   **User** --- stores account and profile information.
-   **WorkoutTemplate** --- reusable workout plan created by a user.
-   **Exercise** --- predefined or user-created exercise.
-   **Workout** --- an actual workout session performed by a user.
-   **WorkoutSet** --- set-level workout information such as weight and
    repetitions.
-   **Progress** --- historical performance and fitness progress.
-   **SharePermission** --- controls which progress information can be
    shared with other users.

## Backend API

The backend exposes RESTful endpoints for authentication, users,
workouts, templates, exercises, sets, progress, and sharing.

Example authentication routes:

``` text
POST   /users/register
POST   /users/login
POST   /users/logout
GET    /users/me
PUT    /users/me
```

The exact endpoint structure may evolve as the backend implementation
develops.

## Project Structure

A typical project structure is:

``` text
The-Workout-Hub/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

> The directory structure can be adjusted to match the final
> implementation.

## Getting Started

### Prerequisites

Install the following before running the project:

-   Node.js
-   npm
-   MongoDB
-   Git

Verify Node.js and npm:

``` bash
node --version
npm --version
```

Verify Git:

``` bash
git --version
```

## Installation

### 1. Clone the Repository

``` bash
git clone <repository-url>
cd The-Workout-Hub
```

### 2. Set Up the Backend

``` bash
cd backend
npm install
```

Create a `.env` file in the backend directory:

``` env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/the_workout_hub
JWT_SECRET=your_secret_key
```

Use a strong secret for `JWT_SECRET` in a real deployment.

Start the backend:

``` bash
npm run dev
```

or, depending on the configured scripts:

``` bash
npm start
```

### 3. Set Up the Frontend

Open another terminal:

``` bash
cd frontend
npm install
```

Start the React development server:

``` bash
npm run dev
```

The frontend will normally be available at the local development URL
displayed by Vite.

## Environment Variables

The backend should keep sensitive configuration outside the source code.

Example:

``` env
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
```

If the frontend requires an API base URL, configure it using the
appropriate Vite environment variable, for example:

``` env
VITE_API_BASE_URL=http://localhost:5000
```

Do not commit `.env` files or secrets to GitHub.

## Authentication

Protected resources require an authenticated user.

The backend authentication flow is responsible for:

1.  Registering the user.
2.  Validating login credentials.
3.  Creating an authenticated session/token.
4.  Protecting private routes with authentication middleware.
5.  Providing the authenticated user's profile.
6.  Logging the user out.

The current backend design uses route-level authentication middleware
for protected operations.

## API Design

The application follows REST principles.

Typical HTTP methods:

  Method     Purpose
  ---------- ----------------------------
  `GET`      Retrieve resources
  `POST`     Create resources
  `PUT`      Update resources
  `PATCH`    Partially update resources
  `DELETE`   Remove resources

Resources are separated into routes, controllers, models, and middleware
so that the backend remains modular and maintainable.

## Security Considerations

The application should:

-   Authenticate users before allowing access to private resources.
-   Hash passwords before storing them.
-   Protect user-specific data from unauthorized access.
-   Validate request data on the server.
-   Avoid storing secrets directly in source code.
-   Use environment variables for sensitive configuration.
-   Restrict users to resources belonging to their own account.
-   Use HTTPS in production.

## Performance and Reliability

The application should be designed so that common operations such as
authentication, loading workouts, saving sets, and retrieving progress
remain responsive.

Database queries should be limited to the data required by the request,
and appropriate MongoDB indexes should be added as the dataset grows.

## Future Improvements

Potential future improvements include:

-   Workout analytics and charts
-   Personal records / PR detection
-   Exercise history graphs
-   Body-weight progression charts
-   Friend activity feeds
-   More granular sharing controls
-   Workout reminders
-   Responsive mobile-focused UI
-   Media storage using cloud object storage
-   Automated testing
-   Production deployment
-   API documentation with Swagger/OpenAPI

## Development Workflow

A suggested workflow is:

``` text
Requirement
    ↓
Database / API Design
    ↓
Backend Implementation
    ↓
API Testing
    ↓
Frontend Components
    ↓
Frontend API Integration
    ↓
Testing
    ↓
Deployment
```

## Requirements Summary

The SRS identifies the following major functional areas:

1.  **User Profile Management**
2.  **Workout Template Management**
3.  **Exercise Management**
4.  **Active Workout Management**
5.  **Progress Tracking**

These requirements are described in the project's SRS under Section 3.2.
fileciteturn0file0L154-L180 fileciteturn0file0L187-L206
fileciteturn0file0L210-L228

## Project Status

**Development in progress**

The backend API design and implementation are being developed first,
followed by the React + TypeScript frontend and integration of the two
components.

## Authors

**Saumy K. Patel**\
24CEUOG114\
Dharmsinh Desai University

**Bhautik C. Bambhaniya**\
24CEUBS006\
Dharmsinh Desai University

## License

This project is developed for academic purposes. Add an appropriate
open-source license here if the project is later intended for public
distribution.