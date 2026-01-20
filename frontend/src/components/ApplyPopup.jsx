
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ApplyPopup = ({ isOpen, onClose, onConfirm, jobTitle, companyName }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full"
                >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Did you apply?</h3>
                    <p className="text-gray-600 mb-6">
                        You just visited the application page for <span className="font-semibold text-primary">{jobTitle}</span> at <span className="font-semibold">{companyName}</span>.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={() => onConfirm('Applied')}
                            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Yes, I Applied
                        </button>
                        <button
                            onClick={() => onConfirm('Interview')}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                            I have an Interview
                        </button>
                        <button
                            onClick={() => onClose()}
                            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                        >
                            No, just browsing
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ApplyPopup;
