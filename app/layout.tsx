import { Analytics } from '@vercel/analytics/react'
import './app.css'  // Assuming you want to keep your global styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
