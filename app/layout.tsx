import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { headers } from 'next/headers'
import Web3ContextProvider from '@/context/web3'
import './globals.css'

export const metadata: Metadata = {
  title: 'Snel OS',
  description: 'A decentralized social OS built on Farcaster and Lens',
  generator: 'v0.app',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <Web3ContextProvider cookies={cookies}>
          {children}
        </Web3ContextProvider>
      </body>
    </html>
  )
}
