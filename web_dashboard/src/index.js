import ReactDOM from 'react-dom/client';
import React from 'react';
import './styles.css';

import Home from './home';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<>
    <div className="App">
        <Home/>
    </div>
</>);
