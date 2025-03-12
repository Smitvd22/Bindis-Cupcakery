const express = require('express');
const router = express.Router();

router.get("/", async (req, res) => {
    try {
      res.json("Welcome To Bindi's Cupcakery");
    } catch (err) {
      console.error("Error:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;