import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ITS-R Passport — Your Universal Identity',
  description: 'One identity for all ITS-R Universe services.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:`
          (function(){
            var t=localStorage.getItem('its-r-theme');
            if(t==='light') document.documentElement.setAttribute('data-theme','light');
            else document.documentElement.removeAttribute('data-theme');
          })()
        `}} />
      </head>
      <body style={{margin:0,fontFamily:'system-ui,sans-serif'}}>{children}</body>
    </html>
  )
}
