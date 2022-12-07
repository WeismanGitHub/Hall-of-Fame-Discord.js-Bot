function Login() {
    return <a href={ process.env.REACT_APP_REDIRECT_LINK }>
        <button>Login to Discord</button>
    </a>
}

export default Login