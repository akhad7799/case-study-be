# Email Synchronization Backend

This backend service synchronizes emails from Outlook and indexes them into Elasticsearch.

## Features

- OAuth2 authentication with Outlook.
- Fetch emails from Outlook.
- Index emails into Elasticsearch.
- Real-time updates on synchronization progress.
- Periodic synchronization using `node-cron`.

## Prerequisites

- Node.js
- npm
- Elasticsearch
- Microsoft Azure account for Outlook API

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>

   ```

2. **Install dependencies:**

   ```bash
   npm install

   ```

3. **Set up environment variables:**

   ```bash
   PORT=3000
   OUTLOOK_CLIENT_ID=your_outlook_client_id
   OUTLOOK_CLIENT_SECRET=your_outlook_client_secret
   OUTLOOK_REDIRECT_URL=http://localhost:3000/api/auth/outlook/callback
   SESSION_SECRET=your_session_secret
   FRONT_URL=http://localhost:5000

   ```

4. **Configure Elasticsearch:**

   Ensure Elasticsearch is running and accessible at the configured URL in **config/elasticsearch.js**.

5. **Set up Microsoft Azure for OAuth2:**

   - Register an application in the [Azure](https://portal.azure.com/) portal.
   - Configure the redirect URI to http://localhost:3000/api/auth/outlook/callback.
   - Note the Client ID and Client Secret and update your .env file.

## Running the Application

1. **Start the backend server:**

   ```bash
   npm start

   ```

2. The server will be running on the configured port (default is 3000).

### Using Docker

1. Make sure **Docker** is installed in your machine.
2. **Run the Docker container:**

   ```bash
   docker-compose up -d

   ```

3. The server will be running inside the Docker container on the configured port (default is 3000).

## API Endpoints

### Authentication

- **GET `/api/auth/outlook`**

  _Initiates the OAuth2 flow with Outlook._

- **GET `/api/auth/outlook/callback`**

  _Callback endpoint for Outlook OAuth2._

### Email Synchronization

- **POST `/api/sync`**

  _Initiates email synchronization from Outlook to Elasticsearch._

- **GET `/api/emails`**

  Retrieves emails from Elasticsearch.

### Webhook

- **POST `/api/webhook`**

  _Endpoint to receive notifications from Microsoft Graph. Handles initial validation and subsequent change notifications._
