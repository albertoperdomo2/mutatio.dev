import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { EnvProvider } from "./providers"
import { Analytics } from "@vercel/analytics/react"
import "../styles/globals.css"
import "../styles/enhanced-ui.css"
import "../styles/markdown.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "mutatio.dev",
  description: "A prompt engineering mutation and validation engine using LLMs",
  metadataBase: new URL('https://mutatio.dev'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://mutatio.dev",
    title: "mutatio.dev | AI Prompt Engineering",
    description: "Craft, refine, and optimize your AI prompts with mutatio.dev",
    siteName: "mutatio.dev",
    images: [
      {
        url: "https://mutatio.dev/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "mutatio.dev | AI Prompt Engineering",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mutatio.dev | AI Prompt Engineering",
    description: "Craft, refine, and optimize your AI prompts with mutatio.dev",
    images: ["https://mutatio.dev/opengraph-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="styled-scrollbars">
      <body className={inter.className}>
        <AuthProvider>
          <EnvProvider encryptionKey={process.env.ENCRYPTION_KEY || "0123456789abcdef0123456789abcdef"}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <Analytics />
              <Toaster />
            </ThemeProvider>
          </EnvProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
