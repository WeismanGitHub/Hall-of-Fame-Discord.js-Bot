function Login() {
    return <a href={process.env.REACT_APP_OAUTH_URL}>
        <button class='login'>Discord Login</button>
    </a>
}

export default Login