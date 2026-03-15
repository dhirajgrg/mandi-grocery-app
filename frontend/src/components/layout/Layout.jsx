import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#ffffff",
            color: "#202125",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          },
          success: {
            iconTheme: { primary: "#1db954", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#e23636", secondary: "#fff" },
          },
        }}
      />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
