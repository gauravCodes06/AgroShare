import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";
import { ref, onValue } from "firebase/database";

import { auth, db } from "./firebase";
import useAuthStore from "./store/useAuthStore";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BottomNav from "./components/BottomNav";

import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import EquipmentPage from "./pages/EquipmentPage";
import EquipmentDetailPage from "./pages/EquipmentDetailPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdvisorPage from "./pages/AdvisorPage";
import MarketplacePage from "./pages/MarketplacePage";
import CartPage from "./pages/CartPage";

import BookingModal from "./components/BookingModal";
import ListEquipmentModal from "./components/ListEquipmentModal";
import ProductDetailModal from "./components/ProductDetailModal";
import ListProductModal from "./components/ListProductModal";
import AuthModal from "./components/AuthModal";

export default function App() {
  const { setAuthUser, setUser, setLoading } = useAuthStore();

  // Modal States
  const [selectedEquipmentForBooking, setSelectedEquipmentForBooking] = useState(null);
  const [isListEquipmentModalOpen, setIsListEquipmentModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null);
  const [isListProductModalOpen, setIsListProductModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync Firebase Auth & Realtime Database user profile
  useEffect(() => {
    let userUnsub = null;

    const authUnsub = onAuthStateChanged(auth, (firebaseUser) => {
      // Clean up previous database listener if any
      if (typeof userUnsub === "function") {
        userUnsub();
        userUnsub = null;
      }

      if (firebaseUser) {
        setAuthUser(firebaseUser);
        const userRef = ref(db, `users/${firebaseUser.uid}`);
        userUnsub = onValue(
          userRef,
          (snap) => {
            // Only update if this user is still the active authenticated user
            if (auth.currentUser && auth.currentUser.uid === firebaseUser.uid) {
              setUser(snap.exists() ? snap.val() : {
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
                email: firebaseUser.email,
                role: "farmer"
              });
              setLoading(false);
            }
          },
          (error) => {
            console.warn("Realtime DB read:", error.message);
            // DO NOT re-set user if logged out or auth token is invalid
            if (auth.currentUser && auth.currentUser.uid === firebaseUser.uid) {
              setUser({
                uid: firebaseUser.uid,
                name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
                email: firebaseUser.email,
                role: "farmer"
              });
            }
            setLoading(false);
          }
        );
      } else {
        // User is signed out
        setAuthUser(null);
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (typeof userUnsub === "function") {
        userUnsub();
        userUnsub = null;
      }
    };
  }, [setAuthUser, setUser, setLoading]);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white text-[#17231D] font-sans antialiased selection:bg-[#15803D] selection:text-white">
        
        {/* Navigation Bar */}
        <Navbar 
          onOpenListModal={() => setIsListEquipmentModalOpen(true)} 
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-grow">
          <Routes>
            <Route 
              path="/" 
              element={
                <LandingPage 
                  onOpenBookModal={(eq) => setSelectedEquipmentForBooking(eq)}
                  onSelectProduct={(p) => setSelectedProductForDetail(p)}
                  onOpenListModal={() => setIsListEquipmentModalOpen(true)}
                />
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <DashboardPage 
                  onOpenListModal={() => setIsListEquipmentModalOpen(true)} 
                />
              } 
            />

            <Route 
              path="/equipment" 
              element={
                <EquipmentPage 
                  onOpenBookModal={(eq) => setSelectedEquipmentForBooking(eq)}
                  onOpenListModal={() => setIsListEquipmentModalOpen(true)}
                />
              } 
            />

            <Route 
              path="/equipment/:id" 
              element={
                <EquipmentDetailPage 
                  onOpenBookModal={(eq) => setSelectedEquipmentForBooking(eq)} 
                />
              } 
            />

            <Route 
              path="/my-bookings" 
              element={<MyBookingsPage />} 
            />

            <Route 
              path="/advisor" 
              element={<AdvisorPage />} 
            />

            <Route 
              path="/marketplace" 
              element={
                <MarketplacePage 
                  onSelectProduct={(p) => setSelectedProductForDetail(p)}
                  onOpenListProductModal={() => setIsListProductModalOpen(true)}
                />
              } 
            />

            <Route 
              path="/cart" 
              element={<CartPage />} 
            />

            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Modals */}
        <BookingModal
          equipment={selectedEquipmentForBooking}
          isOpen={!!selectedEquipmentForBooking}
          onClose={() => setSelectedEquipmentForBooking(null)}
        />

        <ListEquipmentModal
          isOpen={isListEquipmentModalOpen}
          onClose={() => setIsListEquipmentModalOpen(false)}
        />

        <ProductDetailModal
          product={selectedProductForDetail}
          isOpen={!!selectedProductForDetail}
          onClose={() => setSelectedProductForDetail(null)}
        />

        <ListProductModal
          isOpen={isListProductModalOpen}
          onClose={() => setIsListProductModalOpen(false)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Footer & Mobile Bottom Navigation */}
        <Footer />
        <BottomNav />

        {/* Toast System */}
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3500,
            style: {
              borderRadius: "16px",
              background: "#17231D",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              padding: "12px 18px",
              border: "1px solid #374151"
            },
            success: {
              iconTheme: {
                primary: "#22C55E",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#DC2626",
                secondary: "#fff",
              },
            },
          }}
        />

      </div>
    </Router>
  );
}
