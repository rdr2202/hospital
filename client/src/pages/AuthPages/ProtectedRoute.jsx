import { Navigate, useLocation } from "react-router-dom";
// import jwtDecode from "jwt-decode";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    window.alert("Not token");
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  try {
    // window.alert(`Trying`);
    const decoded = jwtDecode(token);
    // window.alert(`Decoded`);
    const userType = decoded.user.userType;
    // window.alert(`allowed list: ${allowedRoles.join(', ')}`);
    // window.alert(`allowed: ${allowedRoles.includes(userType)}`);
    if (allowedRoles.includes(userType)) {
    // window.alert(`inside`);

      return children;
    } else {
    // window.alert(`else`);

      return <Navigate to="/forbidden" replace />;
    }
  } catch (error) {
    // window.alert(`catching`);

    return <Navigate to="/unauthorized" replace />;
  }
};

export default ProtectedRoute;
