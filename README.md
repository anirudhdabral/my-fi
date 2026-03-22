This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Prerequisites

- Node.js installed
- pnpm installed (`npm install -g pnpm`)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd my-fi
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Environment Variables:**
   Copy the example environment file and fill in your credentials:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and add your specific configurations.

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
