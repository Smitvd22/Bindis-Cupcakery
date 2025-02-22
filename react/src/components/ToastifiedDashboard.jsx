import React, { Fragment, useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const Dashboard = ({setAuth}) => {
    const [name, setName] = useState("")

    async function getName() {
        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.dashboard), {
                method: "GET",
                headers: {token: localStorage.token }
            })

            const parseRes = await response.json()

            setName(parseRes.user_name)
            toast.success(`Welcome, ${parseRes.user_name}!`)
        } catch (err) {
            console.error(err.message)
            toast.error('Failed to fetch user name')
        }
    }

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token")
        setAuth(false);
        toast.info('Logged out successfully')
    };

    useEffect(() => {
        getName()
    }, [])

    return (
        <Fragment>
            <h1>Welcome, Master {name}</h1>
            <button onClick={e => logout(e)}>Logout</button>
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
        </Fragment>
    )
}

export default Dashboard