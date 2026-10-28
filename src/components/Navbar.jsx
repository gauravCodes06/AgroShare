import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Tractor, 
  TrendingUp, 
  Store, 
  LayoutDashboard, 
  CalendarCheck, 
  ShoppingCart, 
  Menu, 
  X,
  PlusCircle,
  Leaf,
  LogIn,
  LogOut,
  UserCheck
} from "lucide-react";
import { useCartStore } from "../store/useCartStore";
import { useBookingStore } from "../store/useBookingStore";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function Navbar({ onOpenListModal, onOpenAuthModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cartCount = useCartStore((state) => state.getTotalCount());
  const bookings = useBookingStore((state) => state.bookings);
  const activeBookingsCount = bookings.filter((b) => b.status === "Confirmed").length;

  const { user, authUser, logout } = useAuthStore();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Equipment", path: "/equipment", icon: Tractor },
    { name: "Crop Advisor", path: "/advisor", icon: TrendingUp },
    { name: "AgroMarket", path: "/marketplace", icon: Store },
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  ];

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleLogout = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await logout();
      toast.success("Signed out successfully.");
    } catch (err) {
      console.warn("Sign out fallback:", err);
      useAuthStore.setState({ authUser: null, user: null, isLoading: false });
      toast.success("Signed out successfully.");
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5EAE5] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left: Brand Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#166534] to-[#15803D] flex items-center justify-center text-white shadow-md shadow-green-900/10 transition-transform group-hover:scale-105">
              <Leaf className="w-5 h-5 text-[#EAB308]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-[#17231D] tracking-tight">
                  Farm<span className="text-[#15803D]">2</span>Value
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#15803D]/10 text-[#15803D]">
                  MVP
                </span>
              </div>
              <p className="text-[11px] font-medium text-[#647067] -mt-0.5 whitespace-nowrap">
                Grow More. Earn More.
              </p>
            </div>
          </Link>

          {/* Center: Desktop Navigation Links (Clean Single-Line Pill Menu) */}
          <nav className="hidden lg:flex items-center bg-[#F7F9F5] p-1.5 rounded-2xl border border-[#E5EAE5]">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    active
                      ? "bg-white text-[#15803D] shadow-xs"
                      : "text-[#647067] hover:text-[#17231D] hover:bg-white/60"
                  }`}
                >
                  {link.icon && (
                    <link.icon className={`w-3.5 h-3.5 shrink-0 ${active ? "text-[#15803D]" : "text-[#647067]"}`} />
                  )}
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions Bar */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            
            {/* Bookings Link */}
            <Link
              to="/my-bookings"
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap border ${
                location.pathname === "/my-bookings"
                  ? "border-[#15803D] bg-[#15803D]/5 text-[#15803D]"
                  : "border-[#E5EAE5] text-[#17231D] hover:bg-[#F7F9F5]"
              }`}
              title="My Equipment Bookings"
            >
              <CalendarCheck className="w-4 h-4 text-[#15803D] shrink-0" />
              <span>Bookings</span>
              {activeBookingsCount > 0 && (
                <span className="min-w-[18px] h-4.5 px-1 bg-[#EAB308] text-[#17231D] text-[10px] font-black rounded-full flex items-center justify-center">
                  {activeBookingsCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Icon Button */}
            <Link
              to="/cart"
              className={`relative p-2.5 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                location.pathname === "/cart"
                  ? "border-[#15803D] bg-[#15803D]/5 text-[#15803D]"
                  : "border-[#E5EAE5] text-[#17231D] hover:bg-[#F7F9F5]"
              }`}
              title="View Cart"
            >
              <ShoppingCart className="w-4 h-4 text-[#17231D]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-4.5 px-1 bg-[#15803D] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* List Equipment Primary CTA Button */}
            {onOpenListModal && (
              <button
                onClick={onOpenListModal}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold whitespace-nowrap transition-all shadow-xs hover:shadow-md cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#EAB308] shrink-0" />
                <span>List Equipment</span>
              </button>
            )}

            {/* User Auth Profile / Sign In */}
            {user || authUser ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#E5EAE5]">
                <div className="flex items-center gap-2 bg-[#F7F9F5] px-2.5 py-1.5 rounded-xl border border-[#E5EAE5]">
                  <div className="w-6 h-6 rounded-full bg-[#15803D] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    {(user?.name || authUser?.email || "F").charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden xl:block">
                    <span className="text-xs font-bold text-[#17231D] block leading-tight truncate max-w-[90px]">
                      {user?.name || authUser?.email?.split("@")[0]}
                    </span>
                    <span className="text-[10px] text-[#15803D] uppercase font-bold tracking-wider block">
                      {user?.role || "Farmer"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl border border-[#E5EAE5] text-gray-500 hover:text-red-600 hover:bg-red-50 active:scale-95 transition-all cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 pointer-events-none" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[#15803D] text-[#15803D] hover:bg-emerald-50 text-xs font-bold whitespace-nowrap transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 shrink-0" />
                <span>Sign In</span>
              </button>
            )}

          </div>

          {/* Mobile Screen Menu & Cart Trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <Link
              to="/cart"
              className="relative p-2 rounded-xl border border-[#E5EAE5] text-[#17231D]"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#15803D] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl border border-[#E5EAE5] text-[#17231D] hover:bg-gray-100 cursor-pointer"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#E5EAE5] bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          {user || authUser ? (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#15803D] text-white text-xs font-bold flex items-center justify-center">
                  {(user?.name || authUser?.email || "F").charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-sm font-bold text-[#17231D] block">
                    {user?.name || authUser?.email?.split("@")[0]}
                  </span>
                  <span className="text-[11px] text-[#15803D] uppercase font-bold">
                    {user?.role || "Farmer"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  handleLogout(e);
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAuthModal && onOpenAuthModal();
              }}
              className="w-full mb-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#15803D] text-[#15803D] font-bold text-sm bg-emerald-50/50"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold ${
                isActive(link.path)
                  ? "bg-[#15803D]/10 text-[#15803D]"
                  : "text-[#17231D] hover:bg-[#F7F9F5]"
              }`}
            >
              {link.icon && <link.icon className="w-4 h-4 text-[#15803D]" />}
              <span>{link.name}</span>
            </Link>
          ))}

          <Link
            to="/my-bookings"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-[#17231D] hover:bg-[#F7F9F5]"
          >
            <div className="flex items-center gap-3">
              <CalendarCheck className="w-4 h-4 text-[#15803D]" />
              <span>My Bookings</span>
            </div>
            {activeBookingsCount > 0 && (
              <span className="px-2 py-0.5 bg-[#EAB308] text-[#17231D] text-xs font-bold rounded-full">
                {activeBookingsCount}
              </span>
            )}
          </Link>

          {onOpenListModal && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenListModal();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#15803D] text-white font-bold text-sm shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#EAB308]" />
              <span>List Your Equipment</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
}
