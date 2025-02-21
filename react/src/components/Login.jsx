import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from "jwt-decode"; // Import JWT decoder

const Login = ({ setAuth }) => {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    email: '',
    password: ''
  });

  const { email, password } = inputs;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  // const onSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //       const body = {email, password}

  //       const response = await fetch("http://localhost:5000/auth/login", {
  //           method: "POST",
  //           headers: {"Content-Type": "application/json"},
  //           body: JSON.stringify(body)
  //       });

  //       const parseRes = await response.json()

  //       if (parseRes.token) {
  //         localStorage.setItem("token", parseRes.token);
  //         setAuth(true);
  //         navigate('/'); // Redirect to home page after successful login
  //       } else {
  //         // Handle login error (show message to user)
  //         console.error("Login failed");
  //       }
  //   } catch (err) {
  //     console.error(err.message);
  //   }
  // };


  const onSubmit = async (e) => {
    e.preventDefault();
    try {
        const body = { email, password };

        const response = await fetch("http://localhost:5000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        const parseRes = await response.json();

        if (parseRes.token) {
            // Store token
            localStorage.setItem("token", parseRes.token);
            
            // Decode user ID
            const decodedToken = jwtDecode(parseRes.token);
            const userId = decodedToken.user;

            if (userId) {
                localStorage.setItem("userId", userId);
                // REMOVED THE RESET-DIALOG-SHOWN CALL
            }

            setAuth(true);
            navigate('/');
        } else {
            console.error("Login failed");
        }
    } catch (err) {
        console.error(err.message);
    }
};


  return (
    <div className="flex justify-center items-center min-h-screen bg-pink-50">
      <div className="bg-white p-8 shadow-lg rounded-lg w-96">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={e => onChange(e)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={e => onChange(e)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button 
            type="submit"
            className="w-full bg-[#6c79b0] text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don't have an account? <a href="/register" className="text-blue-500 hover:underline">Register</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
