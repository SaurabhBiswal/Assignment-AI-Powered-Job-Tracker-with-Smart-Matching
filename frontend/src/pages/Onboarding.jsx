import React, { useState, useContext } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";

const Onboarding = () => {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const { backendUrl, fetchUserData } = useContext(AppContext);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        headline: '',
        portfolio: '',
        location: '',
        skills: ''
    });

    const [resume, setResume] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = await getToken();

            const formDataObj = new FormData();
            formDataObj.append('headline', formData.headline);
            formDataObj.append('portfolio', formData.portfolio);
            formDataObj.append('location', formData.location);
            formDataObj.append('skills', formData.skills);

            if (resume) {
                formDataObj.append('resume', resume);
            }

            const { data } = await axios.post(backendUrl + '/api/users/update-profile',
                formDataObj,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                await fetchUserData();
                toast.success("Profile Setup Complete!");
                navigate('/');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
                <h2 className="text-3xl font-bold mb-2 text-blue-600">Welcome!</h2>
                <p className="text-gray-600 mb-8">Complete your professional profile to start applying.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Professional Headline</label>
                        <input
                            type="text"
                            placeholder="e.g. Senior MERN Stack Developer"
                            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Portfolio / Personal Website</label>
                        <input
                            type="url"
                            placeholder="https://yourwebsite.com"
                            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Skills (Comma separated)</label>
                        <input
                            type="text"
                            placeholder="React, Node.js, MongoDB"
                            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 text-gray-700">Upload Resume</label>
                        <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setResume(e.target.files[0])}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Required for AI Job Matching</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        {loading ? 'Saving Profile...' : 'Complete Registration'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;