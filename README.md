# Bulls & Cows Colosseum

A real-time, multiplayer web application for the classic game of "Bulls and Cows".

## How to Run

### 1. Build the Docker Image

From the project's root directory, run the build command:

```bash
docker build -t colosseum-app .
```

### 2. Run the Docker Container

You have two options for running the container.

#### Option A: Simple Run

This command starts the application without the optional game history feature.

```bash
docker run -d -p 8080:8080 --name colosseum-container colosseum-app
```

#### Option B: Run with Game History (Optional)

This project can save game history to a Google Sheet. To enable this, you must provide credentials via an environment file.

1.  Create a file named `local.env` in the project root.
2.  Add your Google Sheets credentials to the file:
    ```env
    SPREADSHEET_ID="your_spreadsheet_id_here"
    GOOGLE_CREDENTIALS_JSON='{"type": "service_account", "project_id": "...", ...}'
    ```
3.  Run the container using the `--env-file` flag:
    ```bash
    docker run -d -p 8080:8080 --env-file local.env --name colosseum-container colosseum-app
    ```

### 3. Access the Application

Open your browser and navigate to:

**[http://localhost:8080](http://localhost:8080)**

---

### Managing the Container

- **To stop the container:**
  ```bash
  docker stop colosseum-container
  ```
- **To remove the container:**
  ```bash
  docker rm colosseum-container
  ```
