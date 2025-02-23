import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const Register = ({setAuth}) => {
  const [inputs, setInputs] = useState({
    name: '',
    email: '',
    password: '',
  });

  const { name, email, password } = inputs;

  const onChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
        const body = {email, password, name}

        const response = await fetch(getApiUrl(API_ENDPOINTS.register), {
            method: "POST",
            headers: {"Content-Type" : "application/json"},
            body: JSON.stringify(body)   
        });

        const parseRes = await response.json()

        if (parseRes.token) {
          localStorage.setItem("token", parseRes.token)
          setAuth(true);
          toast.success('Registration Successful!');
        } else {
          toast.error('Registration Failed: ' + (parseRes.message || 'Please try again'));
        }
    } catch (err) {
        console.error(err.message)
        toast.error('An error occurred during registration');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-4 sm:p-8 shadow-lg rounded-lg w-full max-w-md mx-4">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">Register</h1>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={name}
            onChange={e => onChange(e)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
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
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Register
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Already have an account? <a href="/login" className="text-blue-500 hover:underline">Login</a>
        </p>
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
      </div>
    </div>
  );
};

export default Register;