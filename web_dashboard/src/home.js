import { useState, useEffect } from 'react';
import axios, * as others from 'axios'

function Home() {
    const [loggedIn, setLoggedIn] = useState(false)

    useEffect(() => {
        const code = String(window.location).split('code=')[1]
        setLoggedIn(code)

        if (code) {
            axios.post('/api/login', { code: code })
        }
    }, [])
    
    if (!loggedIn) {
        return (<div>
            <a href={ process.env.REACT_APP_REDIRECT_LINK }>
                <button>Login to Discord</button>
            </a>
        </div>)
    }

    return (<div>
        <h1>Home Page</h1>
    </div>)
}

export default Home;