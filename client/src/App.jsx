import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/patient components/Layout.jsx";
import RecentAppointments from "./components/patient components/RecentAppointments.jsx";
import UpcomingAppointments from "./components/patient components/UpcomingAppointments.jsx";
import NewAppointment from "./components/patient components/NewAppointment.jsx";
import CancelledAppointment from "./components/patient components/CancelledAppointment.jsx";
import LoginPage from "./pages/patient pages/LoginPage.jsx";
import Form from "./pages/patient pages/Form.jsx";
import FirstForm from "./pages/patient pages/FirstForm.jsx";
import Appointments from "./pages/patient pages/Appointments.jsx";
import Home from "./pages/patient pages/Home.jsx";
import Payments from "./pages/patient pages/Payments.jsx";
// import Invoices from './pages/patient pages/Invoices.jsx';
import Medicine from "./pages/patient pages/Medicine.jsx";
import Workshops from "./pages/patient pages/Workshops.jsx";
import Settings from "./pages/patient pages/Settings.jsx";
import Notification from "./components/patient components/Notification.jsx";
import Profile from "./pages/patient pages/Profile.jsx";
import ReferFriend from "./pages/patient pages/ReferFriend.jsx";
import NeedHelp from "./pages/patient pages/NeedHelp.jsx";
import Track from "./pages/patient pages/Track.jsx";
import PaymentPage from "./pages/patient pages/PaymentPage.jsx";
import Messenger from "./components/patient components/Messenger.jsx";
import HomePage from "./pages/patient pages/HomePage.jsx";
import RazorScreen from "./pages/patient pages/RazorScreen.jsx";
import FamilyTree from "./pages/patient pages/FamilyTree.jsx";
import ConsultationHistory from "./pages/patient pages/ConsultationHistory.jsx";
import PrescriptionView from "./pages/patient pages/PrescriptionView.jsx";
import MedicinePaymentPage from "./pages/patient pages/MedicinePaymentPage.jsx";

// import doctor website
import DoctorLayout from "./components/doctor components/DoctorLayout.jsx";
import DocAppointments from "./pages/doctor pages/DocAppointments.jsx";
import Dashboard from "./pages/doctor pages/Dashboard.jsx";
import AssistDoc from "./pages/doctor pages/AssistDoc.jsx";
import WorkshopPage from "./pages/doctor pages/WorkshopPage.jsx";
import Inventry from "./pages/doctor pages/Inventry.jsx";
import DocInvoices from "./pages/doctor pages/DocInvoices.jsx";
import DocMedicine from "./pages/doctor pages/DocMedicine.jsx";
import DoctorMessenger from "./components/doctor components/DoctorMessenger.jsx";
import DoctorNotification from "./components/doctor components/DoctorNotification.jsx";
import Patients from "./pages/doctor pages/Patients.jsx";
import DocPayments from "./pages/doctor pages/DocPayments.jsx";
import NewProfile from "./pages/doctor pages/NewProfile.jsx";
import DocSettings from "./pages/doctor pages/DocSettings.jsx";
import ViewDetails from "./pages/doctor pages/ViewDetails.jsx";
import AddDoctorModal from "./pages/doctor pages/AddDoctorModal.jsx";
import Calender from "./pages/doctor pages/Calender.jsx";
import AppointmentList from "./pages/doctor pages/AppointmentList.jsx";
import Accounts from "./pages/doctor pages/Accounts.jsx";
import Docprofile from "./pages/doctor pages/Docprofile.jsx";
import DoctorProfile from "./pages/doctor pages/DoctorProfile.jsx";
import NewWorkshop from "./pages/doctor pages/NewWorkshop.jsx";
import Content from "./pages/doctor pages/Content.jsx";
import Doctors from "./pages/doctor pages/Doctors.jsx";
import Patientcard from "./pages/doctor pages/Patientcard.jsx";
import Allocation from "./pages/doctor pages/Allocation.jsx";
import VideoCall from "./pages/doctor pages/VideoCall.jsx";
import AdminLoginPage from "./pages/doctor pages/AdminLogin.jsx";
import AdminDashboard from "/src/pages/doctor pages/AdminDashboard.jsx";
import AssistantDoctorDashboard from "/src/pages/doctor pages/AssistantDoctorDashboard.jsx";
import AddDoctor from "/src/pages/doctor pages/AddDoctor.jsx";
import AssistLeave from "/src/pages/doctor pages/AssistLeave.jsx";
import VideoSettings from "/src/pages/doctor pages/VideoSettings.jsx";
import AdminLeaveManagement from "./pages/doctor pages/AdminLeaveManagement.jsx";
import LeaveSettingsForm from "./pages/doctor pages/LeaveSettingsForm.jsx";
import PayrollSettings from "./pages/doctor pages/payrollsettings.jsx";
import Payroll from "./pages/doctor pages/payroll.jsx";
import SalaryStructure from "./pages/doctor pages/salarystructure.jsx";
import HRPage from "./pages/doctor pages/HRPage.jsx";
import BreakTimer from "./pages/doctor pages/BreakTimer.jsx";
import Payslip from "./pages/doctor pages/payslip.jsx";
import NoteTaking from "./pages/doctor pages/NoteTaking.jsx";
import PrescriptionWriting from "./components/calllog components/PrescriptionWriting.jsx";
import MedicinePreparationView from "./pages/doctor pages/MedicinePreparationView.jsx";
// import Form from "./PatientRegistration/SecondForm.jsx";
import InventoryPage from "./components/calllog components/InventoryPage.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";

// import '@zoomus/websdk/dist/css/bootstrap.css';
// import '@zoomus/websdk/dist/css/react-select.css';

// Inventory module
import InventoryLayout from "./components/Inventory/Layout.jsx";
import InventoryDashboard from "./components/Inventory/InventoryDashBoard.jsx";
import RawMaterialsList from "./components/Inventory/RawMaterials/RawMaterialsList.jsx";
import RawMaterialForm from "./components/Inventory/RawMaterials/RawMaterialForm.jsx";
import RawMaterialDetail from "./components/Inventory/RawMaterials/RawMaterialDetail.jsx";
import MedicinesList from "./components/Inventory/Medicine/MedicinesList.jsx";
import MedicineDetail from "./components/Inventory/Medicine/MedicineDetail.jsx";
import MedicineForm from "./components/Inventory/Medicine/MedicineForm.jsx";
import PriceCalculator from "./components/Inventory/Medicine/PriceCalculator.jsx";
import OrderRawMaterials from "./components/Inventory/Order/OrderRawMaterials.jsx";
import EditVendor from "./components/Vendor/EditVendor.jsx";
// Error Pages
import NotFound from "./pages/AuthPages/NotFound.jsx";
import Forbidden from "./pages/AuthPages/Forbidden.jsx";
import Unauthorized from "./pages/AuthPages/Unauthorized.jsx";
import ServerError from "./pages/AuthPages/InternalServerError.jsx";
import Maintenance from "./pages/AuthPages/MaintenancePage.jsx";
import ProtectedRoute from "./pages/AuthPages/ProtectedRoute.jsx";
// Auth Context
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { ErrorBoundary } from "react-error-boundary";

//Patient Registration pages
// import FirstForm from "./PatientRegistration/First-Form.jsx";

// Vendor Module
import VendorDashboard from "./components/Vendor/VendorDashboard.jsx";
import AddVendor from "./components/Vendor/AddVendor.jsx";
import Navbar from "./components/Vendor/Navbar.jsx";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// Error Fallback Component
const ErrorFallback = () => <ServerError />;

function App() {
  const [isUnderMaintenance] = useState(false);

  const MaintenanceCheck = () => {
    if (isUnderMaintenance) {
      return <Maintenance />;
    }

    return (
      <Routes>
        {/* Public Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/server-error" element={<ServerError />} />
        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/firstform" element={<FirstForm />}/>
        {/* <Route path ="/secondform" element={<Form /> } /> */}

        <Route
          path="/vendors"
          element={
            <ProtectedRoute allowedRoles={["admin", "Manager"]}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors/add"
          element={
            <ProtectedRoute allowedRoles={["admin", "Manager"]}>
              <AddVendor />
            </ProtectedRoute>
          }
        />  
        <Route
          path="/vendors/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin", "Manager"]}>
              <EditVendor />
            </ProtectedRoute>
          }
        />
        
        {/* Patient Protected Routes */}
        <Route
          path="/form"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Form />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/homepage"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/*"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Appointments />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/appointments/newappointment"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <NewAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments/upcoming"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <UpcomingAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments/recent"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <RecentAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments/cancelled"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <CancelledAppointment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/appointments/layout"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Layout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/consulthistory"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <ConsultationHistory />
            </ProtectedRoute>
          }
        />

      <Route 
        path="/prescription/:appointmentId" 
        element={
          <ProtectedRoute allowedRoles={["Patient"]}>
            <PrescriptionView />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/payment/:appointmentId" 
        element={
          <ProtectedRoute allowedRoles={["Patient"]}>
            <MedicinePaymentPage />
          </ProtectedRoute>
        }
      />
        <Route
          path="/payments"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Payments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/paymentpage"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicine"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Medicine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/track"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Track />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workshops"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Workshops />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Notification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/refer"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <ReferFriend />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messenger"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <Messenger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/needhelp"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <NeedHelp />
            </ProtectedRoute>
          }
        />
        <Route
          path="/razor"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}>
              <RazorScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/family"
          element={
            <ProtectedRoute allowedRoles={["Patient"]}> 
              <FamilyTree />
            </ProtectedRoute>
          }
        />

        {/* Doctor Protected Routes */}
        <Route
          path="/layout"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/calender"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Calender />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/list"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <AppointmentList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DocAppointments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistdoc"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <AssistDoc />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistdoc/docprofile"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Docprofile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistdoc/doctors"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Doctors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistdoc/doctorprofile/:id"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/adddoctormodal"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <AddDoctorModal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/content"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Content />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventry"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Inventry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoices"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DocInvoices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicine"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DocMedicine />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docmessenger"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorMessenger />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notification"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DoctorNotification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/card"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Patientcard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/viewdetails/:id"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <ViewDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docpayments"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DocPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newprofile"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <NewProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/docsettings"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <DocSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accounts"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Accounts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workshoppage"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <WorkshopPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/newworkshop"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <NewWorkshop />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allocation"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Allocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/video-call"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <VideoCall />
            </ProtectedRoute>
          }
        />
        <Route
          path="/note-taking"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <NoteTaking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescription-writing"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <PrescriptionWriting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prepare-medicine/:appointmentId"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <MedicinePreparationView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <InventoryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/raw-materials"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <RawMaterialsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/raw-materials/new"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <RawMaterialForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/raw-materials/:id"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <RawMaterialDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/raw-materials/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <RawMaterialForm isEdit={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <MedicinesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines/new"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <MedicineForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines/:id"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <MedicineDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines/:id/edit"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <MedicineForm isEdit={true} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicines/calculate-price"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <PriceCalculator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-raw-materials"
          element={
            <ProtectedRoute allowedRoles={["Doctor", "admin"]}>
              <OrderRawMaterials />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-dashboard/:tabType"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <AssistantDoctorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-doctor"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <AddDoctor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assistleave"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <AssistLeave />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leavemgt"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <AdminLeaveManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/leavesettings"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <LeaveSettingsForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/videosettings"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <VideoSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payrollsetting"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <PayrollSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payroll"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Payroll />
            </ProtectedRoute>
          }
        />
        <Route
          path="/salarystructure"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <SalaryStructure />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hrm"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <HRPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/break"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <BreakTimer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payslip"
          element={
            <ProtectedRoute allowedRoles={["Doctor"]}>
              <Payslip />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Wildcard - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  };
  return (
    <div>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider>
            <MaintenanceCheck />
        </AuthProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;
