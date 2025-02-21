const router = require('express').Router();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwtGenerator = require('../utils/jwtGenerator');
const authorization = require('../middleware/authorization')
const jwt = require('jsonwebtoken');
// const token = req.header("token"); // or from Authorization
// const verified = jwt.verify(token, process.env.jwtSecret);

// registering
router.post("/register", async(req, res) => {
    try {
        // 1. destructure the req.body
        const {name, email, password, phone} = req.body;

        // 2. check if user exists
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if(user.rows.length !== 0){
            return res.status(401).json("User already exists");
        }
        
        // 3. Bcrypt the user password
        const saltRound = 10;
        const salt = await bcrypt.genSalt(saltRound);
        const bycrptPassword = await bcrypt.hash(password, salt);

        // 4. enter the new user inside our database
        const newUser = await pool.query(
            "INSERT INTO users (user_name, user_email, user_password, user_phone) VALUES ($1, $2, $3, $4) RETURNING *", 
            [name, email, bycrptPassword, phone]
        );

        // 5. generating our jwt token
        const token = jwtGenerator(newUser.rows[0].user_id);
        res.json({token});
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

router.get("/user-data", authorization, async (req, res) => {
    try {
      // req.user is already the user_id from your middleware
      const user = await pool.query(
        "SELECT user_name, user_email, user_phone FROM users WHERE user_id = $1",
        [req.user]  // Using req.user directly since it's already the user_id
      );
  
      if (user.rows.length === 0) {
        return res.status(404).json("User not found");
      }
  
      res.json(user.rows[0]);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  });

// login
router.post("/login", async(req, res) => {
    try {
        
        //1. destructure the req.body()
        const {email, password} = req.body;

        //2. check if user does exist (if not then we throw error)
        const user = await pool.query("SELECT * FROM users WHERE user_email = $1", [email]);

        if(user.rows.length === 0){
            return res.status(401).json("Password or Email is incorrect");
        }
        //3. check if incoming password is the same as the database password

        const validPassword = await bcrypt.compare(password, user.rows[0].user_password);

        if(!validPassword){
           return res.status(401).json("Password or Email is incorrect");
        }

        //4. give them jwt token
        const token = jwtGenerator(user.rows[0].user_id);
        res.json({token});

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error"); 
    }
});

router.get("/is-verify", authorization, async(req, res) => {
    try {
        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Admin login route
router.post("/admin/login", async(req, res) => {
    try {
        const {email, password} = req.body;
        
        // Check if admin exists
        const admin = await pool.query(
            "SELECT * FROM admins WHERE admin_email = $1",
            [email]
        );

        if (admin.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, admin.rows[0].admin_password);

        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // If everything is correct, send admin info
        res.json({
            admin_id: admin.rows[0].admin_id,
            admin_name: admin.rows[0].admin_name,
            isAdmin: true
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

// Verify admin token
router.get("/admin/verify", async(req, res) => {
    try {
        const token = req.header("token");
        
        if(!token) {
            return res.status(403).json("Not Authorized");
        }

        const verified = jwt.verify(token, process.env.jwtSecret);
        
        if(!verified.admin) {
            return res.status(403).json("Not an admin");
        }

        res.json(true);
    } catch (err) {
        console.error(err.message);
        res.status(403).json("Not Authorized");
    }
});

module.exports = router;
