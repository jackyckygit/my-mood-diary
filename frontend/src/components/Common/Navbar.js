import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login'); // Redirect to login after logout
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <NavLink to="/diary">My Mood Diary</NavLink>
            </div>
            <div className="navbar-links">
                <NavLink to="/diary">Today's Diary</NavLink>
                <NavLink to="/browse">Browse History</NavLink>
                <NavLink to="/categories">Categories</NavLink>
            </div>
            <div className="navbar-user">
                <span>Welcome, {user?.username}!</span>
                {/* Apply the new reusable classes here */}
                <button onClick={handleLogout} className="btn btn-danger">
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;