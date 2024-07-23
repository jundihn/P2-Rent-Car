import { createBrowserRouter, redirect } from "react-router-dom";
import LoginPage from "../components/LoginPage";
import Homepage from "../components/Homepage";
import HomePage from "../HomePage";
import RootLayout from "../layouts/RootLayout";
import FormEdit from "../components/FormEdit";
import RegisterPage from "../components/RegisterPage";
import WishList from "../components/WishList";

const router = createBrowserRouter([
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: <LoginPage />,
    loader: () => {
      return localStorage.getItem("access_token")
        ? redirect("/Homepage")
        : null;
    },
  },
  {
    path: "/Homepage",
    element: <Homepage />,
  },
  {
    path: "/edit_profile",
    element: <FormEdit />,
  },
  {
    path: "/wishList",
    element: <WishList />,
  },
  // {
  //   path: "/payment",
  //   element: <Payment />,
  // },
]);

export default router;
