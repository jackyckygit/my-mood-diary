# My Mood Diary

A full-stack web application that allows users to record their daily thoughts and feelings. It leverages the **OpenRouter AI API** to perform sentiment analysis on each diary entry, providing users with insights into their emotional patterns over time.

---

## ✨ Key Features

*   **Secure User Authentication**: JWT-based authentication for user registration and login.
*   **Daily Diary Entries**: Create, read, and update a diary entry for each day.
*   **AI-Powered Sentiment Analysis**: Each diary entry is automatically analyzed by the OpenRouter.ai API to classify the sentiment as **Happy, Sad, Angry, or Neutral**.
*   **Interactive Calendar View**: Browse your diary history on a calendar. Days with entries are marked with an icon representing the mood of that day.
*   **Sentiment-Based Categorization**: View lists of all your diaries filtered by a specific mood (e.g., all "Happy" entries).
*   **User-Friendly Interface**: The UI includes popups and tooltips to guide the user.

---

## 🛠️ Technology Stack

| Area              | Technologies Used                                                              |
| ----------------- | ------------------------------------------------------------------------------ |
| **Frontend**      | React.js, React Router, Axios, React Calendar, React Tooltip                   |
| **Backend**       | Node.js, Express.js                                                            |
| **Database**      | PostgreSQL                                                                     |
| **Authentication**| JSON Web Tokens (JWT), bcryptjs for password hashing                           |
| **AI Service**    | [Mistral AI](https://mistral.ai/) via [OpenRouter](https://openrouter.ai/)                                 |

---

## 🏗️ Architecture Overview

The application follows a classic client-server architecture:

1.  **React Frontend**: A Single Page Application (SPA) that handles all user interactions and communicates with the backend via a REST API.
2.  **Node.js Backend**: An Express.js server that provides RESTful API endpoints for user authentication, diary management, and sentiment analysis.
3.  **PostgreSQL Database**: Persistently stores user credentials and diary entries.
4.  **OpenRouter API**: An external service called by the backend to analyze the sentiment of a diary's content before saving it to the database.

---

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

*   **Node.js**: Version 16.x or later.
*   **npm** or **yarn**: Package manager for Node.js.
*   **PostgreSQL**: A running instance of a PostgreSQL server.
*   **OpenRouter API Key**: You'll need an API key from the [OpenRouter](https://openrouter.ai/).

### 1. Backend Setup

First, set up the server and the database.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/my-mood-diary.git
cd my-mood-diary/backend

# 2. Install dependencies
npm install

# 3. Set up the database
# Connect to PostgreSQL (e.g., using psql) and run the following commands:
CREATE DATABASE mood_diary;
\c mood_diary;

-- Create the users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create the diaries table
CREATE TABLE diaries (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL,
    diary_date DATE NOT NULL,
    content TEXT NOT NULL,
    sentiment VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_owner
        FOREIGN KEY(owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    UNIQUE (owner_id, diary_date)
);


# 4. Configure environment variables
# Create a .env file in the /backend directory and add the following:
```

**`backend/.env`**
```.env
# PostgreSQL Database Configuration
DB_USER=your_postgres_user
DB_HOST=localhost
DB_DATABASE=mood_diary
DB_PASSWORD=your_postgres_password
DB_PORT=5432

# JWT Secret Key
JWT_SECRET=this-is-a-very-secret-key-change-it

# OpenRouter API Key
OPENROUTER_API_KEY=your_OPENROUTER_API_KEY_here
```

### 2. Frontend Setup

Now, set up the React client.

```bash
# 1. Navigate to the frontend directory
cd ../frontend

# 2. Install dependencies
npm install

# 3. (Optional) Configure environment variables for the API URL
# Create a .env file in the /frontend directory if you want to change the backend URL
```
**`frontend/.env`**
```.env
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### 3. Running the Application

You'll need two separate terminal windows to run both the backend and frontend servers simultaneously.

**In the first terminal (for the Backend):**
```bash
cd backend
npm start  # Or `npm run dev` if you configure a nodemon script
```
The backend server will start on `http://localhost:5000`.

**In the second terminal (for the Frontend):**
```bash
cd frontend
npm start
```
The React development server will start and open the application in your browser at `http://localhost:3000`.

---

## API Endpoints

The backend exposes the following RESTful API endpoints. All protected routes require a `Bearer <token>` in the Authorization header.

| Method | Endpoint                    | Authentication | Description                                      |
|--------|-------------------------------|----------------|--------------------------------------------------|
| `POST` | `/api/users/register`         | Public         | Register a new user.                             |
| `POST` | `/api/users/login`            | Public         | Log in a user and receive a JWT.                 |
| `POST` | `/api/diaries`                | Protected (JWT)| Create or update a diary for a specific date.    |
| `GET`  | `/api/diaries/:date`          | Protected (JWT)| Get a single diary entry for a given date.       |
| `GET`  | `/api/diaries`                | Protected (JWT)| Get diaries for a date range (using query params). |
| `GET`  | `/api/diaries/category/:sentiment` | Protected (JWT)| Get all diaries with a specific sentiment.     |
| `DELETE`  | `/api/diaries/:id` | Protected (JWT)| Delete a specific diary entry.     |
---

## 💡 Future Improvements

*   **Mood Update**: Allow users to update the mood. 
*   **Single Sign On**: Integrate with external indentity providers, e.g. Facebook, Google. 
*   **Logging and Monitor System**: Store the system log to database and provide application monitoring system. 
*   **Improve Editor**: Support different font style and color. 
*   **Data Visualization**: Add charts and graphs to visualize mood trends over time.
*   **Advanced Text Analysis**: Use more sophisticated AI models to extract keywords, topics, or more granular emotions (e.g., joy, surprise, fear).
*   **Password Reset**: Implement a "Forgot Password" feature.
*   **Search Functionality**: Allow users to search through their diary entries.
---

## 🐳 Running with Docker (Recommended)

This project is fully containerized using Docker, which is the recommended way to run it locally.

### Prerequisites

*   [Docker](https://www.docker.com/get-started)
*   [Docker Compose](https://docs.docker.com/compose/install/)

### Setup and Run

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/jackyckygit/my-mood-diary.git
    cd my-mood-diary
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project by copying the example:
    ```bash
    # (On Linux/macOS)
    cp sample.env .env

    # (On Windows)
    copy sample.env .env
    ```
    Now, open the `.env` file and add your `OPENROUTER_API_KEY` and other information.  
    It will create the users and diaries tables in PostgreSQL automatically.

3.  **Build and Run the Containers:**
    From the project root, run the following command:
    ```bash
    docker-compose up --build
    ```
    This will build the necessary Docker images and start the frontend, backend, and database containers.

4.  **Access the Application:**
    *   **My Mood Diary App**: `http://localhost:3000`
    *   **Backend API**: `http://localhost:5000`

5.  **Stopping the Application:**
    To stop all running containers, press `Ctrl+C` in the terminal, then run:
    ```bash
    docker-compose down
    ```

## 📄 License

This project is licensed under the MIT License.  
You are free to use, modify, and distribute this software for personal or commercial purposes, provided that the original copyright and license 
notice are included in all copies or substantial portions of the software.

See the [LICENSE](./LICENSE) file for more details.

---
