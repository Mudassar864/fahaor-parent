'use client';
import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';
import { LanguageProvider } from '@/lib/LanguageContext';
import Navbar from './navbar/page';
import './globals.css';
import { ThemeProvider } from 'next-themes';

// Import Google font
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const [themeClass, setThemeClass] = useState('light'); // Default theme
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State for auth status
  const [initialized, setInitialized] = useState(false); // Track if client-side logic has run

  useEffect(() => {
    // Set theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'light';
    setThemeClass(savedTheme);
    document.documentElement.className = savedTheme;

    // Check for token in localStorage
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Convert token to boolean

    // Mark client initialization as complete
    setInitialized(true);
  }, []);

  if (!initialized) {
    // Render a skeleton or loading spinner while initializing
    return (
      <html lang="en" className="light">
        <body>
          <div>Loading...</div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" className={themeClass}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Fahaor - A platform for managing families, child tasks, finance tracking, event management, and more." />
        <meta name="keywords" content="family management, child task management, finance tracking, event management, calendar, family organization" />
        <meta name="author" content="Fahaor" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Fahaor - Family Management Platform" />
        <meta property="og:description" content="Manage your family tasks, track finances, manage events like a calendar, and more with Fahaor." />
        <meta property="og:image" content="https://fahaor.com/images/og-image.jpg" /> {/* Change the image URL as per your project */}
        <meta property="og:url" content="https://fahaor.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@fahaor" />
        <meta name="twitter:title" content="Fahaor - Family Management Platform" />
        <meta name="twitter:description" content="Manage your family tasks, track finances, manage events like a calendar, and more with Fahaor." />
        <meta name="twitter:image" content="https://fahaor.com/images/og-image.jpg" /> {/* Change the image URL as per your project */}
        <title>Fahaor - Family Management Platform</title>
      </head>
      <body className={`${inter.className} antialiased`}>
        <LanguageProvider>
          <ThemeProvider attribute="class" enableSystem={true} defaultTheme="light">
            {/* Conditionally render Navbar based on authentication status */}
            {isAuthenticated && <Navbar />}
            <main>{children}</main>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
