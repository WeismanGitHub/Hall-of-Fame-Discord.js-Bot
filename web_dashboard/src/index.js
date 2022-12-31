import { createRoot } from "react-dom/client";
import './dist/output.css';
import React from 'react';
import './styles.css';
import {
    createBrowserRouter,
    RouterProvider,
    Route,
    Link,
} from "react-router-dom";

import NotFound from './not-found';
import Login from './login';
import Main from './main';

const router = createBrowserRouter([
    {
        path: '/:guildId',
        element: <Main/>
    },
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