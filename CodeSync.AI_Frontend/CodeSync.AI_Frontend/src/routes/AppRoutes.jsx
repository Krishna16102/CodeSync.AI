import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Dashboard from "../pages/Dashboard/Dashboard";
import Workspace from "../pages/Workspace/Workspace";
import Signup from "../pages/Signup/Signup";
import ChatWindow from "../components/ChatWindow/ChatWindow";
import ChatInput from "../components/ChatInput/ChatInput";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login/>} />

                <Route path="/login" element={<Login />} />

                <Route path="/signup" element={<Signup />} />

                <Route path="/dashboard" element={<Dashboard />} />

                <Route path="/workspace" element={<Workspace />} />

                <Route  path="/workspace/:projectId" element={<Workspace />}/>
                <Route path="/window" element={<ChatWindow />} />
                <Route path="/input" element={<ChatInput />} />

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;

// <BrowserRouter> → The manager that enables routing.
//  This wraps your entire application and enables routing


// <Routes> → A container that holds all your routes.
// <Route> → A single mapping between a URL and a React component.