import { createRoot } from "react-dom/client";
import React from 'react';
import './styles.css';
import {
    createBrowserRouter,
    RouterProvider,
} from "react-router-dom";

import NotFound from './not-found';
import Login from './login';
import Main from './main';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Main/>
    },
    {
        path: '/login',
        element: <Login/>,
    },
    {
        path: '*',
        element: <NotFound/>
    }
]);

createRoot(document.getElementById('root')).render(<RouterProvider router={ router }/>)