require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const http = require('http');
const hsts = require('hsts'); 
const { default: helmet } = require('helmet');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET;
// JWT Token expiration (1 day)
const JWT_EXPIRES_IN = '1d';

const app = express();
const PORT_HTTPS = 3443; // Port for HTTPS
const PORT_HTTP = 3000; // Port for HTTP

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Your client URL
  credentials: true
}));
app.use(express.json());

// Function to cache static content
const staticCache = (maxAge) => {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
};

// Middleware to check if user exists
const checkUserExists = async (req, res, next) => {
  // Implementation for checking if user exists
  // This is a placeholder - you would implement actual logic here
  next();
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

// Authentication middleware
const requireAuth = async (req, res, next) => {
  // Get token from authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('Missing or invalid Authorization header:', authHeader);
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // First verify with our own JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('JWT verified successfully:', decoded);
    
    // No need to verify with Supabase here - we trust our own JWT
    // Just set the user from the decoded token
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
};

// Admin middleware
const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', req.user.id)
      .single();
    
    if (error || !data || data.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// Auth Routes
app.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Generate JWT token
    const token = generateToken(data.user);
    
    return res.json({ 
      user: data.user,
      token 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/auth/signin', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Create our own JWT token using the Supabase user data
    const token = generateToken(data.user);
    console.log('Generated JWT token for:', data.user.email);
    
    return res.json({ 
      user: {
        id: data.user.id,
        email: data.user.email
      },
      token 
    });
  } catch (error) {
    console.error('Signin error:', error);
    return res.status(500).json({ error: 'Signin failed' });
  }
});

app.post('/auth/signout', requireAuth, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Signout error:', error);
    return res.status(500).json({ error: 'Signout failed' });
  }
});

app.get('/auth/user', requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

// Protected routes
app.get('/api/dashboard', requireAuth, (req, res) => {
  return res.json({ 
    message: 'Dashboard data', 
    user: req.user 
  });
});

app.get('/api/admin/dashboard', requireAuth, requireAdmin, (req, res) => {
  return res.json({ 
    message: 'Admin dashboard data', 
    user: req.user.email
  });
});

app.get('/api/admin/users', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    
    return res.json(data.users);
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

app.get('/feed', staticCache(300), (req, res) => {  // 5 minutes
  res.sendFile(path.join(__dirname, '/src/feed.html'));
});

app.get('/posts', staticCache(3600), (req, res) => {  // 1 hour 
  res.sendFile(path.join(__dirname, '/src/feed.html'));
});

app.get('/upload', (req, res) => {
  res.set('Cache-Control', 'no-store');  // Disable caching
  res.sendFile(path.join(__dirname, '/src/index.html'));
});

// API endpoint to get all valid users
app.get('/api/users', (req, res) => { // Disable caching
  res.set('Cache-Control', 'no-store');  
  res.json([]);
});

// Route to validate token and return user info
app.get('/auth/validate', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    // Verify with our JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    
    return res.json({ 
      valid: true, 
      user: {
        id: decoded.userId,
        email: decoded.email
      }
    });
  } catch (error) {
    console.log('Token validation failed:', error.message);
    return res.status(401).json({ valid: false, error: error.message });
  }
});

const hstsOptions = {
  maxAge: 31536000, 
  includeSubDomains: true, 
  preload: true
};

http.createServer(app).listen(PORT_HTTP, () => {
  console.log(`HTTP Server running at http://localhost:${PORT_HTTP}`);
});

const sslOptions = {
  key: fs.readFileSync('private-key.pem'), 
  cert: fs.readFileSync('certificate.pem'), 
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, (req, res) => {
  hsts(hstsOptions)(req, res, () => {
    app(req, res);
  });
});

// Start HTTPS server
httpsServer.listen(PORT_HTTPS, () => {
  console.log(`HTTPS Server running at https://localhost:${PORT_HTTPS}`);
});