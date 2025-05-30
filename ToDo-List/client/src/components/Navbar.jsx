import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import logo from '../assets/logo.png';
import { getUserDetails } from '../util/GetUser';
import { Dropdown } from 'antd';
import avatar from '../assets/login.png';
import styles from './Navbar.module.css';

function Navbar({active}) {
  const [user,setUser] = useState("");
  const navigate = useNavigate();

  useEffect(()=>{
    const userDetails = getUserDetails();
    setUser(userDetails);
  },[]);

  const handleLogout = ()=>{
    localStorage.removeItem('toDoAppUser');
    navigate('/login');
  }

  const items = [
    {
      key: '1',
      label: (
        <span onClick={handleLogout}> Logout</span>
      ),
    },
  ];

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.logo__wrapper}>
          <img src={logo} alt="logo" className={styles.logo} />
          <h4>DoDo</h4>
        </div>
        <ul className={styles.navigation_menu}>
          <li><Link to="/" className={active==='home' ? styles.activeNav : ''}>Home</Link></li>
          {user && <li><Link to="/to-do-list" className={active==='myTask' ? styles.activeNav : ''}>My Task</Link></li>}
          {user ? (
            <Dropdown
              menu={{ items }}
              placement="bottom"
              arrow
            >
              <div className={styles.userInfoNav}>
                <img src={avatar} alt="." />
                <span>{user?.firstName ? `Hello, ${user?.firstName} ${user?.lastName}` : user?.username}</span>
              </div>
            </Dropdown>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Navbar