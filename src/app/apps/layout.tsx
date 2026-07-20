import { Inter, JetBrains_Mono } from "next/font/google"
import { AppsProvider } from "./apps-provider"
import "./apps-theme.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-apps-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-apps-mono",
})

export default function AppsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`apps-theme h-dvh ${inter.variable} ${jetbrainsMono.variable}`}>
      <AppsProvider>{children}</AppsProvider>
    </div>
  )
}
