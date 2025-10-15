# AGENT Guide

## Overview

Creative Image Studio is a Vite + React client that talks directly to Google AI Studio (Generative Language / Imagen APIs). This document lists the steps required to configure local development and deploy the application using Docker.

## Prerequisites

- Node.js 20+
- npm 10+
- Docker and Docker Compose
- Google account with access to Google AI Studio

## 1. Google AI Studio Setup

1.  Visit [Google AI Studio API Keys](https://aistudio.google.com/app/apikey).
2.  Create a new API key (ensure **Generative Language** access is granted).
3.  Remove any restrictions that would block browser usage (no domain/IP restrictions).
4.  Copy the key value for later steps.

## 2. Local Environment Configuration

1.  Create a `.env` file in the project root by copying the example:
    ```bash
    cp .env.example .env
    ```
2.  Open the `.env` file and add your Google AI Studio API key:
        ```env
        GEMINI_API_KEY=your_google_ai_studio_key
        ```
    
    3.  Install dependencies and start the local development server:
        ```bash
        npm install
        npm run dev
        ```
        The application will be available at `http://localhost:5173`. The client sends requests to a local server which then proxies them to the Google AI API.

## 3. Production Deployment with Docker

This project is configured for easy deployment using Docker Compose.

1.  **Ensure Docker is running** on your server.
2.  **Create the environment file**: Just like for local development, create a `.env` file on your server by copying the example and adding your API key.
    ```bash
    cp .env.example .env
    # Now, edit .env with your key
    ```
3.  **Build and run the container**: Use Docker Compose to build the image and start the service in detached mode.
    ```bash
    docker-compose up -d --build
    ```
    Docker Compose will build the image, create a container, and run the application. The server is exposed on port `8080`. You can access the application at `http://<your_server_ip>:8080`.

## 4. Managing the Application

-   **To stop the application**:
    ```bash
    docker-compose down
    ```
-   **To view logs**:
    ```bash
    docker-compose logs -f
    ```
-   **To update the application**:
    1.  Pull the latest changes from your repository.
    2.  Re-build and restart the service:
        ```bash
        docker-compose up -d --build
        ```

## 5. Troubleshooting

-   **API key invalid**: Regenerate the key in Google AI Studio, ensure restrictions are disabled, and update the `.env` file. Remember to restart the container (`docker-compose up -d --build`) for the changes to take effect.
-   **Port conflicts**: If port `8080` is already in use on your server, you can change it in the `docker-compose.yml` file. For example, to use port `8000`, change `ports:` to `"8000:8080"`.