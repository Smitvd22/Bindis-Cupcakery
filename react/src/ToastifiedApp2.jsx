import React, {Fragment, useState, useEffect} from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

const App2 = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const setAuth = boolean => {
        setIsAuthenticated(boolean);
        if (boolean) {
            toast.success('Authentication Successful');
        } else {
            toast.info('Logged Out');
        }
    }

    async function isAuth() {
        try {
            const response = await fetch("http://localhost:5000/auth/is-verify", {
                method: "GET",
                headers: { token : localStorage.token}
            });

            const parseRes = await response.json()

            parseRes === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
        } catch (err) {
            console.error(err.message)
            toast.error('Authentication Check Failed');
        }
    }

    useEffect(() => {
        isAuth()
    }, [])

    return (
        <Fragment>
        <Router>
            <div className="container">
                <Routes>
                    <Route 
                    path='/login' 
                    element={!isAuthenticated ? <Login setAuth = {setAuth}/> : <Navigate to="/dashboard" />} 
                    />
                    <Route 
                    path='/register' 
                    element={!isAuthenticated ? <Register setAuth = {setAuth}/> : <Navigate to="/login" />} 
                    />
                    <Route 
                    path='/dashboard' 
                    element={isAuthenticated ? <Dashboard setAuth = {setAuth}/> : <Navigate to="/login" />} 
                    />
                </Routes>
            </div>
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Router>
        </Fragment>
    );
};

export default App2;