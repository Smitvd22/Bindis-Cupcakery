const express = require("express");
const router = express.Router();
const MessagingResponse = require("twilio").twiml.MessagingResponse;

router.post("/webhook", (req, res) => {
    console.log("Received a WhatsApp message:", req.body); // Debugging log

    const incomingMsg = req.body.Body ? req.body.Body.trim().toLowerCase() : "";
    const twiml = new MessagingResponse();

    if (incomingMsg === "hi") {
        twiml.message("Hello! Welcome to our WhatsApp service.");
    } else {
        twiml.message("👋 Hello!\nWelcome to *Bindi's Cupcakery*! 🎂🍩\nHow can we sweeten your day today? 😊\n\nYou can:\n🔹 Place an order 🍰\n🔹 Ask about your existing order 📦\n🔹 Explore our menu 📝\n🔹 Get in touch with us 📞\n\nJust type your query, and we’ll be happy to assist you! 💕\n\n🍩 *Bindi's Cupcakery* 🍩\n📞 Contact: +918849130189`");
    }

    res.set("Content-Type", "text/xml");
    res.send(twiml.toString());
});

module.exports = router;