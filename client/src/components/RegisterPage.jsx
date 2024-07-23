import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = async (event) => {
    event.preventDefault();
    try {
      let { data } = await axios({
        method: "POST",
        url: "/register",
        data: {
          username,
          email,
          password,
        },
      });

      console.log(data);
      setUsername("");
      setEmail("");
      setPassword("");
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">
          REGISTER
        </h1>
        <form className="space-y-4" onSubmit={register}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-900 dark:text-white"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Username"
              required
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900 dark:text-white"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Email@mail.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
