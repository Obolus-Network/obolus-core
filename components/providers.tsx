"use client"

import type React from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ConvexClientProvider } from "./convex-client-provider"
import { MeshProvider } from "@meshsdk/react"
import "@meshsdk/react/styles.css"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MeshProvider>
      <ConvexClientProvider>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </ConvexClientProvider>
    </MeshProvider>
  )
}
