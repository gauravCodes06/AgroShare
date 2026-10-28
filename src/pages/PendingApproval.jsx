import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaClock, FaShieldAlt } from "react-icons/fa";
import { MdAdminPanelSettings } from "react-icons/md";

const PendingApproval = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 pt-16 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md text-center space-y-6"
            >
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 bg-amber-100 rounded-3xl flex items-center justify-center shadow-lg">
                            <FaClock className="h-12 w-12 text-amber-500" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center shadow">
                            <FaShieldAlt className="h-4 w-4 text-white" />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-black text-gray-900 font-display">
                        Account Pending Approval
                    </h1>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Your farmer registration has been submitted successfully.
                        Our admin team will review your identity document and
                        <strong className="text-amber-700"> activate your account within 24 hours</strong>.
                    </p>
                </div>

                {/* Steps */}
                <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 space-y-3 text-left">
                    {[
                        ["✅", "Registration submitted", "Your details and document are saved"],
                        ["⏳", "Admin Review", "Our team manually verifies your document"],
                        ["🎉", "Account Activated", "You'll receive a confirmation and can log in"],
                    ].map(([icon, title, desc]) => (
                        <div key={title} className="flex items-start gap-3">
                            <span className="text-xl">{icon}</span>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">{title}</p>
                                <p className="text-gray-400 text-xs">{desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Admin contact note */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start text-left">
                    <MdAdminPanelSettings className="text-amber-600 h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-xs leading-relaxed">
                        If you are an admin, please go to the{" "}
                        <button
                            onClick={() => navigate("/admin")}
                            className="font-bold underline hover:text-amber-900 transition-colors"
                        >
                            Admin Panel → Verifications
                        </button>{" "}
                        tab to review pending requests.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/auth")}
                    className="w-full py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:border-green-400 hover:text-green-700 transition-all"
                >
                    Back to Login
                </button>
            </motion.div>
        </div>
    );
};

export default PendingApproval;
