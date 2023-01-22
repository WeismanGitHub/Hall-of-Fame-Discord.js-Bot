function Login() {
    return <a href={ process.env.REACT_APP_PROD_LINK }>
        <button class='login'>Discord Login</button>
    </a>
}

export default Login