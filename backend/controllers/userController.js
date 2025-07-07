const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

//register new user
const registerUser = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Email, password, and name required'
            });
        }
        const existingUser = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: 'User already exists'
            });
        }

        //bcryptjs, used to hash passwords => more saltrounds will be used for increased security
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        //create new user
        const result = await db.query(
            'INSERT INTO users (email, password_hash, profile) VALUES ($1, $2, $3) RETURNING id, email, created_at',
            [email, hashedPassword, JSON.stringify({ name })]
        );

        const user = result.rows[0];
        
        //jwt token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: user.id,
                email: user.email,
                name: name
            },
            token
        });
    }
    
    catch (error) {
        console.error('Registration error: ', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

//login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password required'
            });
        }

        //get user
        const result = await db.query(
            'SELECT id, email, password_hash, profile FROM users WHERE email = $1', [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const user = result.rows[0];

        //verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        //get JWT
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login success',
            user: {
                id: user.id,
                email: user.email,
                profile: user.profile
            },
            token
        });
    }
    catch (error) {
        console.error('Login error: ', error);
        res.status(500).json({
            error: 'Internal server error'
        });
    }
};

module.exports = { registerUser, loginUser };