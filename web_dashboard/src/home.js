import { useState, useEffect } from 'react';

function Home() {
    useEffect(() => {
        console.log('HELLO WORLD')
    }, [])
    return <h1>Homepage</h1>
}

export default Home;