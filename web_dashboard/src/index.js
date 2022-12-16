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
import Guild from './guild';
import Login from './login';
import Home from './home';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home/>,
    },
    {
        path: '/login',
        element: <Login/>,
    },
    {
        path: 'guilds/:guildId',
        element: <Guild/>
    },
    {
        path: '*',
        element: <NotFound/>
    }
]);

createRoot(document.getElementById('root')).render(<RouterProvider router={ router }/>)