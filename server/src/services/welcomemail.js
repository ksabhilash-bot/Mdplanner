import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a welcome email to a new user
 * @param {string} toEmail - The user's email address
 * @param {string} userName - The user's name
 */
export async function sendWelcomeEmail({ email, name }) {
  try {
    const mailOptions = {
      from: `"Meal Planner" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Welcome to Meal Planner 🍎",
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <div style="background-color: #22c55e; padding: 20px; text-align: center; color: white;">
              <h1>Welcome to Meal Planner!</h1>
            </div>
            <div style="padding: 20px;">
              <p>Hi <strong>${name}</strong>,</p>
              <p>We're thrilled to have you on board 🎉</p>
              <p>Meal Planner helps you create personalized diet plans and stay on track with your health goals.</p>
              <p>Start exploring and build your first meal plan today!</p>
              <a href="https://mealplanner.example.com" style="display:inline-block; padding: 10px 20px; background-color:#22c55e; color:white; text-decoration:none; border-radius:5px; margin-top:10px;">Get Started</a>
              <p style="margin-top:20px;">Stay healthy,<br>The Meal Planner Team 🥗</p>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending welcome email:", error);
  }
}
