const express = require('express')
const route = express.Router()
const {postBooking,getBooking,updateBooking} = require('../controller/bookController')
const razorpayController = require('../controller/razorpayController')
const inputMiddleware = require("../middleware/inputMiddleware")

route.post('/api/booking',inputMiddleware,postBooking)
route.get('/api/booking/:id',getBooking)
route.put('/api/booking/:id',updateBooking)
route.post("/create-order", razorpayController.createOrder);
route.post("/verify-payment", razorpayController.verifyPayment);

module.exports = route