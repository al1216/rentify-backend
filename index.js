const express = require("express");
const app = express();
const dotEnv = require("dotenv");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const Property = require("./models/property");
const nodemailer = require("nodemailer");
dotEnv.config();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

app.get("/", (req, res) => {
  res.json({ message: "Server is Running!" });
});

// Login API endpoint
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT token upon successful login (replace with your token generation logic)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ success: true, token, email }); // Send success response with token
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" }); // Handle unexpected errors gracefully
  }
});

app.post("/api/signup", async (req, res) => {
  const { Fname, Lname, email, phone, password } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({
      Fname,
      Lname,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ token, email });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/add-property", async (req, res) => {
  const propertyData = req.body;
  console.log(propertyData.property);
  const property = new Property(propertyData.property);

  try {
    await property.save();
    res.status(201).json({ message: "Property saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error saving property", error });
  }
});

app.get("/api/properties", async (req, res) => {
  try {
    const properties = await Property.find();
    res.send(properties);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/api/property/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/user/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { Fname, Lname, phone, email: userEmail } = user;
    res.json({ name: Fname + " " + Lname, phone, email: userEmail });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/:id/like", async (req, res) => {
  try {
    const propertyId = req.params.id;
    // Find the property by ID
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    // Increment the like count (assuming you have a property field called 'likes')
    property.like++;
    // Save the updated property
    await property.save();
    // Send the updated property with the incremented like count
    res.json({ likes: property.like });
  } catch (error) {
    console.error("Error increasing like count:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/send-email", async (req, res) => {
  try {
    // Extract data from request body
    const params = req.body;

    // send this email message from seller to customer
    let mailOptions = {
      from: "The Idea project",
      to: params.to_email,
      subject: `Details of ${params.property_name} Property You Visited`,
      text: `
      Dear Sir/Madam,

I hope this email finds you well.

We are pleased to provide you with the details of the ${params.property_name} Property that you recently visited on our Rentify website.

Seller Information:

Name: ${params.seller_name}
Phone: ${params.seller_contact}
Email: ${params.seller_email}
Should you require further information or wish to proceed with any inquiries regarding this property, we encourage you to reach out directly to the seller.

Thank you for choosing Rentify for your property search needs.

Best Regards,
Rentify Team
      `,
    };

    transporter.sendMail(mailOptions, (err) => {
      console.log("seller to customer", err);
    });

    // send email to seller from rentify
    const email = params.seller_email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { Fname, Lname, phone, email: userEmail } = user;
    const cust_name = Fname + " " + Lname;
    mailOptions = {
      from: "The Idea project",
      to: email,
      subject: `Follow-up on ${params.property_name} Property Inquiry`,
      text: `
      Dear Sir/Madam,

I hope this message finds you well.

We are reaching out from Rentify to provide you with details regarding the ${params.property_name} Property that a potential customer recently visited on our website.

Customer Information:

Name: ${cust_name}
Phone: ${phone}
Email: ${email}
We kindly request that you reach out to the customer for further assistance or clarification regarding their inquiry.

Thank you for your attention to this matter.

Warm regards,
Rentify Team
      `,
    };

    transporter.sendMail(mailOptions, (err) => {
      console.log("seller to customer", err);
    });

    // Send success response
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    // Send error response
    res.status(500).json({ message: "Failed to send email" });
  }
});

app.listen(process.env.SERVER_PORT, () => {
  mongoose
    .connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connected to MongoDB");
      console.log(`Server running on port ${process.env.SERVER_PORT}`);
    })
    .catch(() => {
      console.log("Could not connect to MongoDB");
    });
});
