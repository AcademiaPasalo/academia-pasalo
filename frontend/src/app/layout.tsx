import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from '@/contexts/AuthContext';
import SessionClosedModal from '@/components/SessionClosedModal';
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Pásalo - Academia Universitaria",
  description: "Plataforma educativa para estudiantes PUCP",
  icons: {
    icon: "/favicon.svg",
  },
};

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Icons - Rounded */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Icons+Round&display=swap"
        />
        {/* Material Icons - Outlined */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Icons+Outlined&display=swap"
        />
      </head>
      <body
        className={`${poppins.variable} antialiased`}
      >
        <GoogleOAuthProvider clientId={googleClientId}>
          <AuthProvider>
            {children}
            <SessionClosedModal />
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
