import AppRoutes from "./routes/AppRoutes";

import {
    ToastProvider,
    useToast
} from "./context/ToastContext";

import Toast from "./components/Toast/Toast";


function App() {

    return (

        <ToastProvider>

            <AppRoutes />

            <ToastRenderer />

        </ToastProvider>

    );

}


function ToastRenderer() {

    const {
        toasts,
        removeToast
    } = useToast();


    return (

        <div className="toast-container">

            {toasts.map((toast) => (

                <Toast
                    key={toast.id}
                    toast={toast}
                    onClose={removeToast}
                />

            ))}

        </div>

    );

}
export default App;