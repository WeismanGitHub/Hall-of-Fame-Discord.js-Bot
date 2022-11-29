import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './dist/output.css';
import React from 'react';
import './styles.css';

import Home from './home';
import NotFound from './not-found'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<>
    <Router>
        <Routes>
            <Route exact path='/' element={<Home/>}/>
            <Route path='*' element={<NotFound/>}/>
        </Routes>
    </Router>
</>);