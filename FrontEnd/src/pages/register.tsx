import { useState } from 'react';
import { registerUser } from '../api';
import { useNavigate } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Alert } from '@mui/material';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
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
      await registerUser({ username, email, password });
      setMessage('Registration successful!');
      setError(false);
      navigate('/login');
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Registration failed');
      setError(true);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box component="form" onSubmit={handleRegister} sx={{ mt: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h4" align="center">Register</Typography>
        <TextField label="Username" value={username} onChange={(e) => setUsername(e.target.value)} required fullWidth />
        <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth />
        <Button type="submit" variant="contained" sx={{ backgroundColor: '#ff5700', '&:hover': { backgroundColor: '#e04f00' } }} fullWidth>
          Register
        </Button>
        <Button onClick={() => navigate('/login')} variant="outlined" sx={{ color: '#ff5700', borderColor: '#ff5700', '&:hover': { borderColor: '#e04f00', color: '#e04f00' } }} fullWidth>
          Go to Login
        </Button>
        {message && <Alert severity={error ? 'error' : 'success'}>{message}</Alert>}
      </Box>
    </Container>
  );
}
