// middleware/validateBookingFields.js
module.exports = function inputMiddleware(req, res, next) {
  const { name, email, phone_number, domain, experience, bio, resume_link } = req.body;

  if (!name || !email || !phone_number || !domain || !experience || !bio || !resume_link) {
    return res.status(400).json({ message: "Please fill all the fields." });
  }

  next(); 
};
