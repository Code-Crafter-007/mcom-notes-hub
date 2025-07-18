import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar";
// import RouteLoader from "@/components/RouteLoader";


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "M.Com Notes Hub - Ace Your Exams",
  description: "Expert curated notes and PYQs for M.Com EA Group students",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
          {/* <RouteLoader /> shows spinner during route change */}

        {children}
      </body>
    </html>
  )
}
