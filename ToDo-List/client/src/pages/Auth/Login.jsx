import React,{useState} from 'react'
import styles from './Login.module.css';
import login from '../../assets/login.png';
import {Button, Input, message, Divider} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import AuthServices from '../../services/authServices';
import { getErrorMessage } from '../../util/GetError';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function Login() {
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async ()=>{
    try{
      setLoading(true);
      let data = {
        username,
        password
      }
      const response = await AuthServices.loginUser(data);
      console.log(response.data);
      localStorage.setItem('toDoAppUser',JSON.stringify(response.data));
      message.success("Logged in Successfully!");
      navigate('/to-do-list');
      setLoading(false);
    }catch(err){
      console.log(err);
      message.error(getErrorMessage(err));
      setLoading(false);
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      console.log(decoded);
      // Gửi thông tin Google user lên server để xử lý
      const response = await AuthServices.loginWithGoogle({
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });
      localStorage.setItem('toDoAppUser', JSON.stringify(response.data));
      message.success("Logged in with Google Successfully!");
      navigate('/to-do-list');
    } catch (err) {
      console.log(err);
      message.error(getErrorMessage(err));
    }
  };

  const handleGoogleError = () => {
    message.error("Google login failed!");
  };

  return (
    <div className={styles.login__container}>
      <div className={styles.login__card}>
          <img src={login} alt="login illustration" className={styles.login__image}/>
          <h2>Welcome Back!</h2>
          <p className={styles.login__subtitle}>Please login to your account</p>
          <div className={styles.input__wrapper}>
              <Input 
              prefix={<UserOutlined className={styles.input__icon} />}
              placeholder="Username" 
              value={username} 
              onChange={(e)=>setUsername(e.target.value)} 
              size="large"
              />
          </div>
          <div className={styles.input__wrapper}>
              <Input.Password 
              prefix={<LockOutlined className={styles.input__icon} />}
              placeholder="Password" 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)}
              size="large"
              />
          </div>
          <div className={styles.input__info}>
            New User? <Link to="/register">Create an account</Link>
          </div> 
          <Button 
            loading={loading} 
            type="primary" 
            size="large" 
            disabled={!username || !password} 
            onClick={handleSubmit}
            className={styles.login__button}
          >
            Sign In
          </Button>

          <Divider>Or</Divider>

          <div className={styles.google__login}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_blue"
              shape="rectangular"
              text="signin_with"
              locale="en"
            />
          </div>
      </div>
    </div>
  )
}

export default Login