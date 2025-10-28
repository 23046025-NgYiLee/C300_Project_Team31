const express = require('express');
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Simulated user database
// TODO: This you need to convert into actual database. You can use files.io or any other database.
const users = [
    {
        id: 1,
        email: 'admin@example.com',
        password: 'admin123'
    }
];

// Login endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, email: user.email }
        });
    } else {
        res.status(401).json({
            success: false,
            message: 'Invalid username or password'
        });
    }
});

// Register endpoint
app.post('/api/register', (req, res) => {
    const { email, password } = req.body;

    // Check if email already exists
    if (users.find(u => u.email === email)) {
        return res.status(400).json({
            success: false,
            message: 'Email already exists'
        });
    }

    // Create new user
    const newUser = {
        id: users.length + 1,
        email,
        password
    };

    users.push(newUser);

    res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: { id: newUser.id, email: newUser.email }
    });
});

// Forgot password endpoint
app.post('/api/forgot-password', (req, res) => {
    const { email } = req.body;

    // Find user by email
    const user = users.find(u => u.email === email);

    if (user) {
        // In a real application, you would send an email here
        res.json({
            success: true,
            message: 'Password reset instructions sent to email'
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Email not found'
        });
    }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
