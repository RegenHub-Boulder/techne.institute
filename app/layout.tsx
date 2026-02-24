import type { Metadata } from 'next'
import { Cormorant, Source_Serif_4, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'
import Nav from './_components/Nav'
import Footer from './_components/Footer'

const cormorant = Cormorant({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-source-serif',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Techne Institute',
    template: '%s | Techne Institute',
  },
  description:
    'An Integral Technology Learning Center. Building with AI as a creative partner — in community with others doing the same. Boulder, Colorado.',
  openGraph: {
    title: 'Techne Institute',
    description: 'An Integral Technology Learning Center in Boulder, Colorado.',
    url: 'https://techne.institute',
    siteName: 'Techne Institute',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${sourceSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
