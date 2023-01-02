function Login() {
    return <a href={ process.env.REACT_APP_REDIRECT_LINK }>
        <button>Discord Login</button>
    </a>
}

export default Login