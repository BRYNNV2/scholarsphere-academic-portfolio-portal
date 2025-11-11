# ScholarSphere: Academic Portfolio Portal

[cloudflarebutton]

ScholarSphere is an elegant, modern, and scalable web platform designed for academics to create, manage, and showcase their professional portfolios. It provides a stunning public interface for visitors to explore lecturers' profiles, research, publications, and projects. Authenticated users get access to a clean, intuitive dashboard to effortlessly manage their content. The application is built with a focus on visual excellence, user experience, and a modular frontend architecture that consumes a well-defined API, making it a masterpiece of both form and function.

## ✨ Key Features

*   **Stunning Public Interface**: A beautiful landing page, lecturer directory, and detailed portfolio pages to showcase academic work.
*   **Intuitive User Dashboard**: A secure, private area for authenticated lecturers to effortlessly manage their profile, publications, and research projects.
*   **Search & Filter**: A powerful and easy-to-use directory to find lecturers by specialization or name.
*   **Responsive Perfection**: Flawless layouts across all device sizes, from mobile phones to large desktops.
*   **Visually Excellent UI**: A minimalist design aesthetic with a sophisticated color scheme, beautiful typography, and polished micro-interactions.
*   **Scalable Architecture**: Built on Cloudflare Workers and Durable Objects for high performance and scalability.

## 🚀 Technology Stack

*   **Frontend**: React, Vite, TypeScript, React Router
*   **UI**: Tailwind CSS, shadcn/ui, Framer Motion, Lucide React
*   **State Management**: Zustand, React Hook Form
*   **Backend**: Hono on Cloudflare Workers
*   **Data Persistence**: Cloudflare Durable Objects
*   **Tooling**: Bun, Vite, ESLint, TypeScript

## 📂 Project Structure

The project is organized into three main directories:

-   `src/`: Contains the frontend React application, including pages, components, hooks, and utility functions.
-   `worker/`: Contains the backend Hono application that runs on Cloudflare Workers, including API routes and entity definitions for Durable Objects.
-   `shared/`: Contains TypeScript types and interfaces shared between the frontend and backend to ensure end-to-end type safety.

## 🏁 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

-   [Bun](https://bun.sh/) installed on your machine.
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) for interacting with the Cloudflare platform.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd scholarsphere
    ```

2.  **Install dependencies:**
    This project uses `bun` as the package manager.
    ```bash
    bun install
    ```

3.  **Run the development server:**
    This command starts the Vite development server for the frontend and the Wrangler development server for the backend API simultaneously.
    ```bash
    bun dev
    ```
    The application will be available at `http://localhost:3000`.

## 💻 Development

### Frontend

The frontend code is located in the `src` directory. Pages are in `src/pages`, reusable components are in `src/components`, and global state management is handled with Zustand. When adding new pages, be sure to update the router configuration in `src/main.tsx`.

### Backend

The backend API is built with Hono and runs on Cloudflare Workers. API routes are defined in `worker/user-routes.ts`. Data persistence is managed through entities that interact with a single global Durable Object. To add new data types, create a new `Entity` class in `worker/entities.ts` and expose its functionality through new API endpoints.

### Shared Types

To maintain type safety between the frontend and backend, define all data structures in `shared/types.ts`. These types can be imported into both the `src` and `worker` directories.

## ☁️ Deployment

This project is configured for one-click deployment to Cloudflare.

1.  **Deploy with the button:**
    Click the button below to deploy this application to your Cloudflare account.

    [cloudflarebutton]

2.  **Manual Deployment via CLI:**
    You can also deploy the application using the Wrangler CLI. This will build the application and deploy it to your Cloudflare account.
    ```bash
    bun deploy
    ```

## 📜 Available Scripts

-   `bun dev`: Starts the local development server for both frontend and backend.
-   `bun build`: Builds the frontend application for production.
-   `bun deploy`: Builds and deploys the application to Cloudflare Workers.
-   `bun lint`: Lints the codebase using ESLint.

## ⚠️ Important Notes

*   **Data Modeling**: Ensure the data models in `shared/types.ts` are flexible enough to accommodate various types of academic work.
*   **UI Consistency**: Maintain a clear separation and consistent design between public-facing pages and the private dashboard.
*   **Form Validation**: Implement robust form state management and validation (e.g., using React Hook Form and Zod) to prevent data entry errors.