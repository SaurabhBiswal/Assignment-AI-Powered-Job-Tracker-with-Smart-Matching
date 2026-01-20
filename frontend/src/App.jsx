import React, { useContext, useEffect } from "react";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react"; 
import axios from "axios"; 
import { toast } from "react-toastify"; 
import Home from "./pages/Home";
import Applications from "./pages/Applications";
import ApplyJob from "./pages/ApplyJob";
import CompanyProfile from "./pages/CompanyProfile"; 
import RecruiterLogin from "./components/RecruiterLogin";
import { AppContext } from "./context/AppContext";
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";
import ManageJobs from "./pages/ManageJobs";
import ViewApplications from "./pages/ViewApplications";
import Onboarding from "./pages/Onboarding";
import "quill/dist/quill.snow.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AISidebar from "./components/AISidebar";
import ApplyPopup from "./components/ApplyPopup";

const App = () => {
  const { showRecruiterLogin, companyToken, showApplyPopup, setShowApplyPopup, popupJobData, userData, backendUrl, fetchUserApplications } = useContext(AppContext);
  const { user } = useUser();
  const { getToken } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && userData) {
      if ((!userData.headline || !userData.resume) && location.pathname !== '/onboarding' && !location.pathname.startsWith('/recruiter') && !location.pathname.startsWith('/dashboard')) {
        navigate('/onboarding');
      }
    }
  }, [user, userData, navigate, location]);

  const handleApplyConfirm = async (status) => {
    if (status) {
      try {
        const token = await getToken();
        const { data } = await axios.post(backendUrl + '/api/users/apply',
          { jobId: popupJobData._id, status: 'Applied' },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success("Application Saved!");
          fetchUserApplications();
        } else {
          toast.error(data.message);
        }
      } catch (err) {
        console.error("Error saving external application:", err);
        toast.error(err.response?.data?.message || "Failed to save application");
      }
    }
    setShowApplyPopup(false);
  };

  return (
    <div>
      {showRecruiterLogin && <RecruiterLogin />}
      <ApplyPopup
        isOpen={showApplyPopup}
        onClose={() => setShowApplyPopup(false)}
        onConfirm={handleApplyConfirm}
        jobTitle={popupJobData?.title}
        companyName={popupJobData?.companyId?.name}
      />
      <ToastContainer />
      <AISidebar />
      <Routes>
        {/* Main Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/apply-job/:id" element={<ApplyJob />} />
        <Route path="/applications" element={<Applications />} />

        {/* Company Profile Route - New Addition */}
        <Route path="/company/:id" element={<CompanyProfile />} />

        {/* Naya Onboarding Route */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Recruiter Pages */}
        <Route path="/recruiter-login" element={<RecruiterLogin />} />

        {/* Dashboard with Nested Routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          {companyToken ? (
            <>
              <Route path="add-job" element={<AddJob />} />
              <Route path="manage-job" element={<ManageJobs />} />
              <Route path="view-applications" element={<ViewApplications />} />
            </>
          ) : null}
        </Route>
      </Routes>
    </div>
  );
};

export default App;