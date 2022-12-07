import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './dist/output.css';
import React from 'react';
import './styles.css';

import Guild from './guild';
import Login from './login';
import Home from './home';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<>
    <Router>
        <Routes>
            <Route path='/login' element={<Login/>}/>
            <Route path='/' element={<Home/>}>
                <Route path=':guildId' element={<Guild/>}/>
            </Route>
        </Routes>
    </Router>
</>);