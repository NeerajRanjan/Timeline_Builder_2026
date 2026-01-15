# 2026 Timeline Builder

> **Make time visible.** Build your perfect 2026. Drag, drop, and let AI structure your success.

![Project Preview](public/preview.png)

## Overview

2026 Timeline Builder is a modern, interactive React application designed to help you visualize and plan your goals for the year 2026. With a seamless drag-and-drop interface and AI-powered scheduling, it transforms abstract resolutions into a concrete, actionable timeline.

## Features

- **Interactive Builder**: intuitive drag-and-drop interface to place goals across the months of 2026.
- **AI-Powered Scheduling**: Uses **Google Gemini** to analyze your timeline and provide specific actionable suggestions, frequency recommendations, and motivational quotes.
- **Smart Formatting**: Automatically handles goal conflicts and layout.
- **Undo/Redo**: Full history support to experiment with your timeline fearlessly.
- **Dark/Light Mode**: Beautifully designed themes for any time of day.
- **Export to Calendar**: Generate `.ics` files to import your plan directly into Google Calendar, Outlook, or Apple Calendar.

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI Integration**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Utilities**: `html2canvas-pro` (for image generation)

> [!NOTE]
> This project uses **Tailwind CSS v4**. Ensure your editor plugins are updated for v4 support.
>
> It also uses **`html2canvas-pro`** instead of the standard `html2canvas` package to ensure better compatibility with modern CSS features.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Google Cloud Project with the **Gemini API** enabled.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/timeline_builder_2026.git
    cd timeline_builder_2026
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add your keys. You need the Google Gemini API Key for AI features, and the Google Apps Script URL/Token for the email accountability feature.
    ```env
    VITE_GEMINI_API_KEY=your_api_key_here
    VITE_GSHEET_URL=https://script.google.com/macros/s/deployment_id/exec
    VITE_GSHEET_TOKEN=your_secret_token_matching_script
    ```

4.  Start the development server:
    ```bash
    npm run dev
    ```

## Usage

1.  **Enter your name**: Start by personalizing your session.
2.  **Drag Goals**: Drag predefined goals from the sidebar onto the timeline.
3.  **Custom Goals**: Create your own custom goals if they aren't in the list.
4.  **Organize**: Move goals between months. Use Undo/Redo if you change your mind.
5.  **Finish & Generate**: Click "Finish" to let Gemini AI analyze your year and generate a detailed plan.
6.  **Export**: Download your comprehensive plan or export it to your calendar.

## License

MIT
