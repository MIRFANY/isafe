# SafeHand: Your AI Digital Safety Companion

SafeHand is a Next.js web application designed to be an AI-powered companion that helps users recognize and protect themselves from online scams and malicious content. It provides a safe environment to learn and practice identifying digital threats.

## ✨ Key Features

- **Training Ground (Scam Simulation):**
  - Engage in realistic, interactive chat simulations with an AI-powered "scammer".
  - Receive real-time feedback and tips from an AI "mentor" during the simulation.
  - A dynamic scoring system that adjusts based on your responses to the scammer.
  - A "Game Over" summary that provides a performance review and learning points.

- **The Shield (Real-Time Threat Analysis):**
  - Paste any suspicious text, email, or message to get an instant risk assessment.
  - The AI analyzes the content for red flags, explaining why it might be dangerous.
  - Receive a clear risk score (Low, Medium, High) for the analyzed content.

- **Vulnerable Group Modes:**
  - Tailor the simulation and analysis to specific user profiles: **Student**, **Senior**, or **Woman**.
  - The AI adjusts its language and scam scenarios to be more relevant to the selected profile.

- **Modern, Animated UI:**
  - A clean and intuitive user interface built with Tailwind CSS and shadcn/ui.
  - Smooth animations powered by Framer Motion for an engaging user experience.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 14 (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI:** [Groq Cloud API](https://groq.com/) (using the Llama 3 model)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Component Library:** [shadcn/ui](https://ui.shadcn.com/)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

## ⚙️ Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18.x or later)
- npm or yarn

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/MIRFANY/isafe.git
    cd isafe
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    - Create a new file named `.env.local` in the root of your project.
    - Add your Groq API key to this file:
      ```
      GROQ_API_KEY=your_api_key_here
      ```
    - You can get a free API key from the [Groq Cloud Console](https://console.groq.com/keys).

### Running the Application

Once the dependencies are installed and the environment variables are set, you can run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.
