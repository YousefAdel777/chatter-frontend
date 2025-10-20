# Chatter Frontend

This project is the frontend application for chatter web application, built using Next.js, TypeScript, and various other modern web development tools. It provides a user interface for real-time messaging and communication.

## Key Features & Benefits

- **Real-time Messaging:** Enables instant communication between users.
- **Modern UI:** Built with Next.js for a smooth and responsive user experience.
- **TypeScript:** Ensures type safety and maintainability.
- **Authentication:** Utilizes NextAuth.js for secure user authentication.
- **Image Handling:** Supports image uploads and display, with integrations for storage services like Azure Blob Storage and Backblaze B2.
- **Online Status:** Displays user online status, with options for control.
- **Message Read Receipts:** Allows users to know when their messages have been read.
- **Customizable Profiles:**  Users can set their bio, profile picture, and online status preferences.
- **Rich Text Editing:**  Leverages Tiptap for enhanced text formatting capabilities in messages.
- **Testing:** Includes comprehensive tests using Vitest and Testing Library.

## 🛠️ Tech Stack

- **Language:** TypeScript
- **Framework:** Next.js 15 (App Router)
- **UI Components:** Tailwind CSS
- **Rich Text Editor:** Tiptap
- **Testing:** Vitest, React Testing Library

## Installation & Setup Instructions

Follow these steps to get the project up and running:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/YousefAdel777/chatter-frontend.git
   cd chatter-frontend
   ```

2. **Install dependencies:**

   Using npm:

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the root directory. Add the necessary environment variables.  These will depend on the backend API and authentication setup. Example:

   ```
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="YourSecretHere" # Generate a secure random string
   NEXT_PUBLIC_API_URL="http://localhost:8080" # Example backend API URL
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open the application:**

   Open your browser and navigate to `http://localhost:3000`.

## Configuration Options

The following environment variables can be configured:

| Variable                  | Description                                                  | Example                                        |
| ------------------------- | ------------------------------------------------------------ | ---------------------------------------------- |
| `NEXTAUTH_URL`            | The URL of your Next.js application.                       | `http://localhost:3000`                        |
| `NEXTAUTH_SECRET`         | A secret used to encrypt the NextAuth.js JWT.                 | `YourSecureRandomString`                      |
| `NEXT_PUBLIC_API_URL`     | The base URL of the backend API.                           | `http://localhost:8080`                        |