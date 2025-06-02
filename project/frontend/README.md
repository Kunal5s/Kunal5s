# Project Frontend

This directory contains the frontend application for the AutoBlog project, built with React and Vite.

## Environment Variables

Before running the application, you need to set up environment variables. Copy the `.env.example` file to a new file named `.env` in this directory (`project/frontend/.env`):

```bash
cp .env.example .env
```

Then, open `.env` and modify the variables as needed. The primary variable is:

- `VITE_API_BASE_URL`: The base URL for the backend API. For local development, this typically defaults to `http://localhost:3000` if your backend is running on port 3000.

## Key Dependencies

- **React**: For building the user interface.
- **Vite**: As the build tool and development server.
- **axios**: For making HTTP requests to the backend API.
- **react-router-dom**: For client-side routing.

## Available Scripts

In the `project/frontend` directory, you can run the following commands:

### `npm install`

Installs all the dependencies required for the project. You need to run this once after cloning or when new dependencies are added.

### `npm run dev`

Runs the app in development mode.
Open [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include hashes.
Your app is ready to be deployed!

### `npm run preview`

Serves the production build from the `dist` folder locally. This is a good way to check if the production build works correctly before deploying.

## Project Structure

- `public/`: Contains static assets that are copied directly to the build output.
- `src/`: Contains the main source code for the React application.
  - `assets/`: Static assets like images, fonts imported by components.
  - `components/`: Reusable UI components. (Create if needed)
  - `pages/`: Top-level components representing different pages/views of the application (e.g., `HomePage.jsx`).
  - `App.jsx`: The main application component that sets up routing (if any) and layout.
  - `main.jsx`: The entry point of the application, renders the root `App` component.
  - `index.css`: Global styles (Vite default).
  - `App.css`: App-specific global styles.
- `.env.example`: Example environment variables.
- `.env`: Local environment variables (gitignored).
- `vite.config.js`: Vite configuration file.
- `package.json`: Project dependencies and scripts.
