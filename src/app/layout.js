"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Provider } from "react-redux";
import store from "./store/store";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      publishableKey={
        "pk_test_ZXZvbHZpbmctc3RpbmdyYXktNjIuY2xlcmsuYWNjb3VudHMuZGV2JA"
      }
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Provider store={store}>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
