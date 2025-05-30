import React,{useState} from 'react'
import styles from './Login.module.css';
import login from '../../assets/login.png';
import {Button, Input, message} from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import AuthServices from '../../services/authServices';
import { getErrorMessage } from '../../util/GetError';
import { UserOutlined, LockOutlined } from '@ant-design/icons';

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
      </div>
    </div>
  )
}

export default Login