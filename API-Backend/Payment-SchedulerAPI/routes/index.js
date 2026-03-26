var express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const { getOrderId, verifyPayment } = require("../helpers/razorpay_helper");
const auth = require("../middleware/auth_pay");
const { SendMail } = require("../helpers/mailing");
var router = express.Router();
const shiprocketHelper = require("../helpers/shiprocket_helper");
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.post("/status", (req, res) => {
  res.json({ status: "Alive" });
});

router.post("/getorderid", auth, async (req, res) => {
  try {
    const { address, items, totals, ...billdetails } = req.body;



    const pickupUser = await User.findOne({ pickup_location: billdetails.pickup_location });
    if (!pickupUser) {
      return res.status(404).json({ error: "No user found with the given pickup location" });
    }
    const pickupUserId = pickupUser._id;
    //console.log(req.user._id)
    // console.log(req.body)
    //console.log(billdetails)
    if (!address || !items.length) {
      return res
        .status(400)
        .json({ error: "Address and cart items are required" });
    }

    const newOrder = new Order({
      userId: req.user._id,
      brandId : pickupUserId,
      address,
      items,
      subtotal: totals.subtotal,
      tax: totals.tax,
      shipping: totals.shipping,
      total: totals.total,
      orderStatus: "pending", // Default status (no payment integration for now)
      pickup_location: billdetails.pickup_location,
      billing_customer_name: billdetails.billing_customer_name,
      billing_address: billdetails.billing_address,
      billing_city: billdetails.billing_city,
      billing_pincode: billdetails.billing_pincode,
      billing_state: billdetails.billing_state,
      billing_country: billdetails.billing_country,
      billing_email: billdetails.billing_email,
      billing_phone: billdetails.billing_phone,
      createdAt: new Date(),
    });

    await newOrder.save();
    //console.log(newOrder);
    const user = await User.findById(req.user._id);

    getOrderId(totals.total).then((response) => {
      let orderId = response;
      if (response != false) {
        console.log(orderId);
        // console.log(booking)
        res
          .status(200)
          .send({
            orderid: orderId,
            order_id: newOrder._id,
            "email:": user.email,
          });
      } else {
        res.status(500).send({ error: "Failed to create order" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});

// // Checkout Route
// router.post('/api/checkout', authenticate ,async (req, res) => {
//     try {

//         const { address, items, totals } = req.body;
//         //console.log(req.user._id)
//        // console.log(req.body)
//         if (!address || !items.length) {
//             return res.status(400).json({ error: 'Address and cart items are required' });
//         }

//         const newOrder = new Order({
//             User : req.user._id,
//             address,
//             items,
//             subtotal: totals.subtotal,
//             tax: totals.tax,
//             shipping: totals.shipping,
//             total: totals.total,
//             status: 'Pending', // Default status (no payment integration for now)
//             createdAt: new Date(),
//         });
//         console.log(newOrder);
//         await newOrder.save();

//         res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder._id });
//     } catch (error) {
//         console.error('Checkout error:', error);
//         res.status(500).json({ error: 'Something went wrong' });
//     }
// });

router.post("/verifypayment", async (req, res) => {
  try {
    console.log(req.body.razorpay_signature);
    console.log(req.body.razorpay_order_id);
    console.log(req.query.id);
    console.log(req.query.email);

    verifyPayment(req.body).then(async (response) => {
      if (response == false) {
        let url = process.env.FAILED_URL;
        res.redirect(url);
      } else {
        // Update booking status to confirmed and paymentid
        const booking = await Order.findById(req.query.id);
        if (!booking) {
          return res.status(404).json({ error: "Booking not found" });
        }
        booking.orderStatus = "processing";
        booking.paymentid = req.body.razorpay_order_id;

        let tk = shiprocketHelper.checktoken();
        if (tk == null) {
          tk = await shiprocketHelper.authenticate(
            SHIPROCKET_EMAIL,
            SHIPROCKET_PASSWORD
          );
        }
        if (tk == null) {
          return res.status(500).json({ error: "Not authorized" });
        }

        let shipment_id = "";
        let email = booking.billing_email;

        try {
          const response = await shiprocketHelper.createOrder({
            order_id: req.body.razorpay_order_id,
            order_date: new Date().toISOString().split("T")[0], // todays date
            pickup_location: booking.pickup_location,
            billing_customer_name: booking.billing_customer_name,
            billing_last_name: booking.billing_customer_name,
            billing_address: booking.billing_address,
            billing_city: booking.billing_city,
            billing_pincode: booking.billing_pincode,
            billing_state: booking.billing_state,
            billing_country: booking.billing_country,
            billing_email: booking.billing_email,
            billing_phone: booking.billing_phone,
            shipping_is_billing: true,
            order_items: booking.items.map((item) => ({
              name: item.title,
              sku: item.title,
              units: item.quantity,
              selling_price: item.price,
            })),
            payment_method: "Prepaid",
            sub_total: booking.subtotal,
            length: 60, //in cm
            breadth: 30,
            height: 5,
            weight: 0.5, // in kg
          });

          console.log(response);
          shipment_id = response.shipment_id;
        } catch (err) {
          console.log(err);
          return res.status(400).json({ error: err });
        }
        try{
          try{
            const resp1 = await shiprocketHelper.getAWBNumber(shipment_id);
            console.log(resp1)
          }
          catch(err){
            console.log(err)
            return res.status(400).json({ error: err });
          }
          const response2 = await shiprocketHelper.requestPickup(shipment_id)
          console.log(response2)
          
        }
        catch(err){
          console.log(err);
          return res.status(400).json({ error: err });
        }
        // Save all changes at once
        booking.shipment_id = shipment_id;
        await booking.save();

        SendMail(
          "Your Booking is confirmed and payment done processing",
          "Booking Confirmation",
          email
        );
        let url = process.env.SUCCESS_URL;
        res.redirect(url);
      }
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
});

router.get("/pending-bookings", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const bookings = await Booking.find({
      event_completion_date: today,
      vendor_status: "pending",
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/bookings-with-cost", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .select("eventDates totalcost status servicename contact")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const bcrypt = require("bcrypt");

router.post("/add-brand-account", async (req, res) => {
  try {
    const {
      email,
      password,
      username,
      pickup_location,
      pincode,
      phone,
      address,
      city,
      state,
      country,
    } = req.body;

    if (
      !email ||
      !password ||
      !username ||
      !pickup_location ||
      !pincode ||
      !phone ||
      !address ||
      !city ||
      !state ||
      !country
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

    let tk = shiprocketHelper.checktoken();
    if (tk == null) {
      tk = await shiprocketHelper.authenticate(
        SHIPROCKET_EMAIL,
        SHIPROCKET_PASSWORD
      );
    }
    if (tk == null) {
      return res.status(500).json({ error: "Not authorized" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User with this email already exists." });
    }

    const lastName = "";

    let isVerified = true;
    let isBrand = true;

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    console.log({    pickup_location: pickup_location,
      name: username,
      email: email,
      phone: phone,
      address: address,
      address_2: "",
      city: city,
      state: state,
      country: country,
      pin_code: pincode,})

    // // Validate address for Shiprocket requirements
    // const addressRegex = /\d+/; // Checks for at least one digit (house/flat/road number)
    // if (!addressRegex.test(address)) {
    //   return res.status(400).json({
    //     error:
    //       "Address line 1 should have House no / Flat no / Road no. Please provide a more specific address.",
    //   });
    // }

    // // Add pickup location to Shiprocket
    // const shiprocketResponse = await shiprocketHelper.addPickupLocation({
    //   pickup_location: pickup_location,
    //   name: username,
    //   email: email,
    //   phone: phone,
    //   address: address,
    //   address_2: "",
    //   city: city,
    //   state: state,
    //   country: country,
    //   pin_code: pincode,
    // });

    // Create user in database
    const newUser = await User.create({
      email,
      password: hashedPassword,
      username,
      lastName,
      isVerified,
      isBrand,
      pickup_location,
      pincode,
      phone,
      address,
      city,
      state,
      country,
    });

    res.status(201).json({
      message: "Brand account created successfully.",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        pickup_location: newUser.pickup_location,
      },
      // shiprocket: shiprocketResponse,
    });
  } catch (error) {
    console.error("Error in /add-brand-account:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});



router.post("/get-pickup-location", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const pickupData = {
      pickup_location: user.pickup_location || "",
      name: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      address_2: user.address_2 || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "",
      pin_code: user.pincode || "",
    };
    res.json(pickupData);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/update-pickup-location", auth, async (req, res) => {
  try {
    const {
      pickup_location,
      name,
      email,
      phone,
      address,
      address_2,
      city,
      state,
      country,
      pin_code,
    } = req.body;

    const updateFields = {
      pickup_location,
      username: name,
      email,
      phone,
      address,
      address_2,
      city,
      state,
      country,
      pincode: pin_code,
    };

    // Remove undefined fields
    Object.keys(updateFields).forEach(
      (key) => updateFields[key] === undefined && delete updateFields[key]
    );

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateFields,
      { new: true }
    ).lean();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Pickup location updated successfully", pickupData: updateFields });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/list-brands", auth, async (req, res) => {
  try {
    const brands = await User.find({
      isBrand: true,
      _id: { $ne: req.user._id }
    }).select("username _id");
    res.json({ brands });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});




module.exports = router;
