import { useState, useEffect } from "react";
import axios from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async (event) => {
    event.preventDefault();
    try {
      let { data } = await axios({
        method: "POST",
        url: "/login",
        data: {
          email,
          password,
        },
      });

      //   console.log(data);
      localStorage.setItem("access_token", data.access_token);
      navigate("/Homepage");
    } catch (error) {
      console.log(error);
    }
  };

  async function handleCredentialResponse(response) {
    try {
      let { data } = await axios({
        method: "POST",
        url: "/login-google",
        headers: {
          google_token: response.credential,
        },
      });
      //   console.log(res);
      console.log(data);
      localStorage.setItem("access_token", data.access_token);
      navigate("/Homepage");
    } catch (error) {
      console.log(error);
    }
    // console.log("Encoded JWT ID token: " + response.credential);
  }
  useEffect(() => {
    // console.log(import.meta.env.VITE_CLIENT_ID);
    window.onload = function () {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("buttonDiv"),
        { theme: "outline", size: "large" } // customization attributes
      );
      google.accounts.id.prompt(); // also display the One Tap dialog
    };
  });

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-800">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-red-600 mb-6">
          Login
        </h1>
        <form className="space-y-4" onSubmit={login}>
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Email@example.com"
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              placeholder="Password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <span className="text-gray-600 dark:text-gray-300">
            Don't have an account?
          </span>
          <Link
            to="/register"
            className="text-red-600 hover:underline dark:text-red-400"
          >
            Register
          </Link>
        </div>
        <div
          className="flex justify-center max-w-sm mx-auto mt-3"
          id="buttonDiv"
        ></div>
      </div>
    </div>
  );
}
