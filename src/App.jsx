import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Rootlayout from "./layout/Rootlayout";
import Newdashboard from "./components/Newdashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Rootlayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Newdashboard />} />
      </Route>
    </>,
  ),
);

const App = () => <RouterProvider router={router} />;

export default App;
