import React, { useState } from "react";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  MapPin, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Eye,
  EyeOff
} from "lucide-react";
import useAuthStore, { signUpWithEmail as directSignUp, signInWithEmail as directSignIn } from "../store/useAuthStore";
import toast from "react-hot-toast";

export default function AuthModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("farmer");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const store = useAuthStore();
  const signInFn = store?.signInWithEmail || directSignIn;
  const signUpFn = store?.signUpWithEmail || directSignUp;

  const handleFillDemo = (demoType) => {
    if (demoType === "farmer") {
      setEmail("farmer.demo@farm2value.in");
      setPassword("Farm2Value@2026");
      setName("Balasaheb Patil");
      setRole("farmer");
      setVillage("Baramati");
      setDistrict("Pune");
    } else {
      setEmail("buyer.demo@farm2value.in");
      setPassword("Farm2Value@2026");
      setName("Aditi Joshi");
      setRole("buyer");
      setVillage("Kothrud");
      setDistrict("Pune");
    }
  };

  const friendlyError = (rawErr = "") => {
    if (rawErr.includes("auth/user-not-found") || rawErr.includes("auth/invalid-credential")) {
      return "Invalid email or password. If you don't have an account, please sign up.";
    }
    if (rawErr.includes("auth/wrong-password")) {
      return "Incorrect password. Please try again.";
    }
    if (rawErr.includes("auth/email-already-in-use")) {
      return "This email is already registered. Please sign in instead.";
    }
    if (rawErr.includes("auth/weak-password")) {
      return "Password should be at least 6 characters long.";
    }
    if (rawErr.includes("auth/invalid-email")) {
      return "Please enter a valid email address.";
    }
    return rawErr || "Authentication failed. Please check your credentials.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const res = await signInFn(email, password);
        if (!res.success) {
          setError(friendlyError(res.error));
          toast.error(friendlyError(res.error));
        } else {
          toast.success(`Welcome back, ${res.user?.name || "Farmer"}! 👋`);
          onClose();
        }
      } else {
        if (!name.trim()) {
          setError("Please provide your name.");
          setIsSubmitting(false);
          return;
        }

        const res = await signUpFn({
          email,
          password,
          name,
          role,
          village,
          district
        });

        if (!res.success) {
          setError(friendlyError(res.error));
          toast.error(friendlyError(res.error));
        } else {
          toast.success(`Account created successfully in Firebase Realtime DB! 🎉`);
          onClose();
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E5EAE5] shadow-2xl p-6 sm:p-8 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-[#17231D] hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-[#15803D] text-[11px] font-bold uppercase tracking-wider mb-2 border border-emerald-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Firebase Auth & Realtime DB</span>
          </div>
          <h3 className="text-2xl font-black text-[#17231D]">
            {mode === "signin" ? "Sign In to Farm2Value" : "Create Farmer Account"}
          </h3>
          <p className="text-xs text-[#647067] mt-1">
            {mode === "signin" 
              ? "Access your saved equipment bookings and crop analyses." 
              : "Join India's community of progressive farm mechanizers."}
          </p>
        </div>

        {/* Demo Fast-Fill Pill */}
        <div className="mb-4 p-2.5 rounded-2xl bg-[#F7F9F5] border border-[#E5EAE5] flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-600">Quick Test Credentials:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleFillDemo("farmer")}
              className="px-2 py-1 rounded-lg bg-emerald-100 text-[#15803D] font-bold text-[11px] hover:bg-emerald-200"
            >
              Farmer
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("buyer")}
              className="px-2 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-[11px] hover:bg-amber-200"
            >
              Buyer
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 leading-snug">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {mode === "signup" && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#17231D] mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Patil"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#17231D] mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5EAE5] bg-white text-[#17231D] focus:ring-2 focus:ring-[#15803D] outline-none font-medium"
                  >
                    <option value="farmer">Farmer / Renter</option>
                    <option value="owner">Equipment Owner</option>
                    <option value="buyer">Consumer / Buyer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#17231D] mb-1">
                    Village / Town
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Baramati"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#17231D] mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#17231D] mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-[#E5EAE5] focus:ring-2 focus:ring-[#15803D] outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#15803D] hover:bg-[#166534] disabled:bg-gray-300 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{mode === "signin" ? "Sign In" : "Register & Save in DB"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Mode Toggle */}
        <div className="mt-5 text-center text-xs text-[#647067] border-t border-[#E5EAE5] pt-4">
          {mode === "signin" ? (
            <p>
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                }}
                className="font-bold text-[#15803D] hover:underline"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already registered with email?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                }}
                className="font-bold text-[#15803D] hover:underline"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
