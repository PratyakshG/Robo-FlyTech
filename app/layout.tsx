import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/Toast";
import FloatButtons from "@/components/WhatsAppFloat";
import "./globals.css";

export const metadata = {
  title: "Robo Flytech",
  description:
    "Robo Flytech sells Drones, Drone Parts, Walkie Talkies, and advanced diy accessories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {children}
              <FloatButtons />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
