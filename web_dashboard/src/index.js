import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './dist/output.css';
import React from 'react';
import './styles.css';

import Main from './main';
import NotFound from './not-found'

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<>
    <Router>
        <Routes>
            <Route exact path='/:guildId?' element={<Main/>}/>
            <Route path='*' element={<NotFound/>}/>
        </Routes>
    </Router>
</>);