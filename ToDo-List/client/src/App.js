import React from 'react'
import {Route, Routes} from 'react-router';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Landing from './pages/Landing/Landing';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ToDoList from './pages/ToDo/ToDoList';
import './App.css';
import 'antd/dist/reset.css';

function App() {
  return (
    <GoogleOAuthProvider clientId="395853026700-uq0ocflgucbd24jf5lekfg4b998toren.apps.googleusercontent.com">
      <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/to-do-list" element={<ToDoList />} />
      </Routes>
    </GoogleOAuthProvider>
  )
}

export default App