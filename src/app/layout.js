"use client";
import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Modal from "react-modal";
import "./globals.css";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query'
import Sidebar from "/src/components/sidebar/index.jsx";
import { Toaster } from "/src/components/ui/toaster.jsx";
const queryClient = new QueryClient()
import { setCookie, deleteCookie } from "cookies-next";


const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathName = usePathname();
  useEffect(() => {
    Modal.setAppElement("#htmlParrent");
  }, []);
  return (
    <html lang="en" id="htmlParrent">
      <QueryClientProvider client={queryClient}>

        <body className={inter.className} >
       
            {pathName === "/login" ? null : 
            
            <Sidebar />}

            <main>
            
              {children}</main>
          
          <Toaster />
        </body>
      </QueryClientProvider>
     
    </html>
  );
}
