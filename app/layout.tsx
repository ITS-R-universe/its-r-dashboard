import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'ITS-R Dashboard — Control Room', description: 'ITS-R Universe admin dashboard' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
