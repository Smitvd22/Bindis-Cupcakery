import React, {Fragment, useState, useEffect} from 'react'
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
        } catch (err) {
            console.error(err.message)
        }
    }

    const logout = (e) => {
        e.preventDefault();
        localStorage.removeItem("token")
        setAuth(false);
    };

    useEffect(() => {
        getName()
    }, [])

  return (
    <Fragment>
        <h1>Welcome, Master {name}</h1>
        <button onClick={e => logout(e)}>Logout</button>

    </Fragment>
  )
}

export default Dashboard