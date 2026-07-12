import React, { useContext, useState } from 'react';
import { StateContext } from '../context/StateContext';

const LoginSignupView = () => {
  const { loginUser, signupUser, departments } = useContext(StateContext);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedDept, setSelectedDept] = useState(departments[0]?.name || 'Operations');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (isLogin) {
      const res = loginUser(email, password);
      if (!res.success) {
        setError(res.message);
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all fields.');
        return;
      }
      const res = signupUser(name, email, password, selectedDept);
      if (res.success) {
        setSuccess(res.message);
        setIsLogin(true);
        // Clear fields
        setName('');
        setPassword('');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="glass-card auth-card">
        <div className="auth-header">
          <div className="auth-logo">AF</div>
          <h1>AssetFlow</h1>
          <p>{isLogin ? 'Sign in to your enterprise portal' : 'Register your employee profile'}</p>
        </div>

        {error && <div className="alert-box alert-danger">{error}</div>}
        {success && <div className="alert-box alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Work Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              placeholder="name@assetflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="dept">Department</label>
              <select
                id="dept"
                className="form-control"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map(d => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-footer-text">
          {isLogin ? "Don't have an account?" : 'Already registered?'}
          <span className="auth-link" onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setSuccess('');
          }}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default LoginSignupView;
