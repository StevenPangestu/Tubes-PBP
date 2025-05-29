import { Alert, Box, Button, Container, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../utils/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage('Please fill in all fields');
      setError(true);
      return;
    }
    if (!email.includes('@')) {
      setMessage('Invalid email format');
      setError(true);
      return;
    }
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setError(true);
      return;
    }    

    try {
      const res = await API.post('/auth/login', { email, password });
      console.log('Login response:', res.data);

      const token = res.data.session?.token;
      const user = res.data.user;

      if (!token || !user) {
        setMessage('Login failed: invalid server response');
        setError(true);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setError(false);
      setMessage('Login successful!');
      navigate('/home');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Login failed');
      setError(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleLogin} sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" align="center">Login</Typography>
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
        <Button type="submit" variant="contained" sx={{ backgroundColor: '#ff5700', '&:hover': { backgroundColor: '#e04f00' } }} fullWidth>
          Login
        </Button>
        <Button onClick={() => navigate('/register')} variant="outlined" sx={{ color: '#ff5700', borderColor: '#ff5700', '&:hover': { borderColor: '#e04f00', color: '#e04f00' } }} fullWidth>
          Go to Register
        </Button>
        {message && <Alert severity={error ? 'error' : 'success'}>{message}</Alert>}
      </Box>
    </Container>
  );
}
