const asyncHandler = require("express-async-handler");
const axios = require("axios");
const Patient = require("../models/patientModel");
const MedicalDetails = require("../models/patientDetails");
const PatientDetails = require("../models/patientDetails");
const ChronicPatient = require("../models/chronicModel");
const Payment = require("../models/Payment");
const FamilyLink = require("../models/FamilyLink");
const Appointment = require("../models/appointmentModel");
const Referral = require("../models/referralModel");
require("dotenv").config({ path: "./config/.env" });
const Doctor = require("../models/doctorModel");
const moment = require("moment");
const momentIST = require("moment-timezone");
const twilio = require("twilio");
const fs = require("fs");
const crypto = require("crypto");
const { google } = require("googleapis");
const { createGoogleMeet } = require("./Gmeet");
const cloudinary = require("cloudinary").v2;
// patientController.js
const UserGoogleTokens = require("../models/UserTokenSchema");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = new twilio(accountSid, authToken);
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { response } = require("express");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_REDIRECT_URI = process.env.ZOOM_REDIRECT_URI;

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

const refreshGoogleToken = async (doctor) => {
  try {
    const { tokens } = await oauth2Client.refreshToken(
      doctor.googleRefreshToken
    );
    return tokens.access_token;
  } catch (error) {
    console.error("Error refreshing Google token:", error);
    throw new Error("Failed to refresh Google token");
  }
};

// Step 2: Handle OAuth callback and get access token
exports.handleGoogleCallback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Save the tokens (e.g., in the database) for the user
    const accessToken = tokens.access_token;
    const refreshToken = tokens.refresh_token;

    // Use the access token to create a Google Meet link
    const meetLink = await createGoogleMeet(
      accessToken,
      appointmentDate,
      timeSlot,
      patient,
      doctor
    );

    res.status(200).json({ meetLink });
  } catch (error) {
    console.error("Error during Google OAuth callback:", error);
    res.status(500).json({ error: "Failed to authenticate with Google" });
  }
};

//Initial Form
exports.sendForm = asyncHandler(async (req, res) => {
  // const { name, age, phone, email, gender, diseaseName, diseaseType } =
  //   req.body;
  const {
    consultingFor,
    name,
    age,
    phone,
    whatsappNumber,
    email,
    gender,
    diseaseName,
    diseaseType, // This will now be an object from the frontend
    currentLocation,
    patientEntry,
    symptomNotKnown,
    password,
  } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const { referralCode, familyToken } = req.query; // Get the referral code from query params
  console.log("Received request body:", req.query);
  // Check if referral code is provided
  let friendDetails = null;
  if (referralCode) {
    // Find the referral record by the referral code
    const referral = await Referral.findOne({ code: referralCode });

    if (referral) {
      // Fetch the referred friend's phone number from the referral document
      friendDetails = {
        name: referral.referredFriendName,
        phone: referral.referredFriendPhone,
      };
    }
  }

  const familyLink = await FamilyLink.findOne({ token: familyToken });

  let familyDetails = null;
  let familyGender;
  if (familyToken && familyLink) {
    if (
      familyLink.relationship == "Father" ||
      familyLink.relationship == "Son" ||
      familyLink.relationship == "Father-in-law"
    ) {
      familyGender = "Male";
    } else {
      familyGender = "Female";
    }
    const familyDetails = {
      name: familyLink.name,
      phone: familyLink.phone,
      gender: familyGender,
    };
    console.log(familyDetails);
  }

  // Check if the patient with the given phone already exists
  const existingPatient = await Patient.findOne({ phone });

  if (existingPatient) {
    return res.status(400).json({
      success: false,
      message: "Patient with this mobile number already exists",
    });
  }

  let processedDiseaseType = {
    name: "",
    edit: false,
  };

  // If diseaseType is provided and is an object
  if (diseaseType && typeof diseaseType === "object") {
    processedDiseaseType = {
      name: diseaseType.name || "",
      edit: diseaseType.edit || false,
    };
  }

  const basicDetails = new Patient({
    name,
    age,
    phone,
    whatsappNumber,
    email,
    gender,
    patientEntry,
    currentLocation,
    password: hashedPassword,
  });

  if (referralCode) {
    basicDetails.coupon = referralCode;
  }

  const saveBasic = await basicDetails.save();


  const medicalDetails = new MedicalDetails({
    patientId: saveBasic._id,
    consultingFor,
    // name,
    // age,
    // phone,
    // whatsappNumber,
    // email,
    // gender,
    diseaseName,
    diseaseType: processedDiseaseType,
    // currentLocation,
    // patientEntry,
    symptomNotKnown,
  });

  // Find if the phone number is already registered

  const saveMedical = await medicalDetails.save();

  // Create a new patient document
  // const patientDocument = new Patient({
  //   name,
  //   age,
  //   phone,
  //   email,
  //   gender,
  //   diseaseName,
  //   diseaseType,
  // });

  // await patientDocument.save();

  if (familyToken && familyLink) {
    const senderId = familyLink.userId;
    await Patient.findByIdAndUpdate(senderId, {
      $push: {
        familyMembers: {
          memberId: basicDetails._id, // Add patient ID as memberId
          IndividulAccess: true, // Set IndividulAccess to true
          relationship: familyLink.relationship, // Include relationship role
          name: name, // Store the family member's name here
        },
      },
    });
  }

  res.status(201).json({
    message: "Patient data saved successfully",
    patient: basicDetails,
  });
});

//Patient Profile
// exports.patientDetails = asyncHandler(async (req, res) => {
//   console.log("Patient Details endpoint reached");
//   const phone = req.user.phone;
//   if (!phone) {
//     return res.status(400).json({ message: "Phone number not available" });
//   }

//   // Fetch the patient
//   const patient = await Patient.findOne({ phone });

//   if (!patient) {
//     return res.status(404).json({ message: "Patient not found" });
//   }

//   const patientDetails = await PatientDetails.findOne({
//     patientId: patient._id,
//   });

//   co
// });

exports.patientDetails = asyncHandler(async (req, res) => {
  console.log("Patient Details endpoint reached");

  const phone = req.user.phone;
  if (!phone) {
    return res.status(400).json({ message: "Phone number not available" });
  }
  // Fetch the patient
  const patient = await Patient.findOne({ phone });
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  // Fetch patient details
  const patientDetails = await PatientDetails.findOne({
    patientId: patient._id,
  });
  if (!patientDetails) {
    return res.status(404).json({ message: "Patient details not found" });
  }

  // Fetch medical details
  const medicalDetails = await MedicalDetails.findOne({
    patientId: patient._id,
  });
  if (!medicalDetails) {
    return res.status(404).json({ message: "Medical details not found" });
  }

  // Determine if the patient has a chronic condition
  const isChronic = medicalDetails.diseaseType?.name === "Chronic";

  // Response
  res.status(200).json({
    patientId: patient._id,
    phone: patient.phone,
    consultingFor: medicalDetails.consultingFor,
    diseaseName: medicalDetails.diseaseName,
    diseaseType: medicalDetails.diseaseType,
    isChronic,
  });
});

//Chronic Form
// Send Chronic Form
exports.sendChronicForm = asyncHandler(async (req, res) => {
  try {
    

    const {
      weight,
      height, // Will contain {feet, inches}
      occupation,
      country,
      state,
      city,
      complaint,
      symptoms,
      associatedDisease,
      allopathy,
      diseaseHistory,
      surgeryHistory,
      familyHistory, // Added from frontend
      allergies,
      bodyType,
      clinicReferral, // Added from frontend
    } = req.body;

    // // Validate required fields
    // if (!weight || !height || !occupation || !country || !state || !city || !complaint || !associatedDisease || !bodyType) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Required fields missing"
    //   });
    // }

    console.log("Endpoint reached");

    const phone = req.user.phone;

    // Check if the patient with the provided phone number exists
    const existingPatient = await Patient.findOne({ phone });
    if (!existingPatient) {
      return res.status(404).json({ 
        success: false, 
        message: "Patient not found" 
      });
    }

    // Ensure the patient is classified as chronic
    if (!existingPatient.diseaseType || 
        existingPatient.diseaseType.name.toLowerCase() !== "chronic") {
      return res.status(400).json({ 
        success: false, 
        message: "Patient isn't chronic!" 
      });
    }

    // Check if chronic form already exists for this patient
    const existingChronicPatient = await ChronicPatient.findOne({ phone });
    if (existingChronicPatient) {
      return res.status(409).json({
        success: false,
        message: "Chronic form already submitted for this patient"
      });
    }

    // Convert height from feet/inches to a single value or keep as object
    const heightInCm = (height.feet * 30.48) + (height.inches * 2.54);
    
    // Create a new chronic patient document
    const chronicPatientDocument = new ChronicPatient({
      phone,
      dob: existingPatient.dob || new Date(), // Use existing patient DOB or current date
      weight: parseInt(weight),
      height: heightInCm, // Store as cm or keep as object based on your schema
      occupation,
      country,
      state,
      city,
      complaint,
      symptoms: symptoms || [],
      associatedDisease,
      allopathy: allopathy || '',
      diseaseHistory,
      surgeryHistory: surgeryHistory || '',
      familyHistory: familyHistory || '', // Added
      allergies: allergies || '',
      bodyType,
      clinicReferral: clinicReferral || [], // Added
    });

    // Save the chronic patient document to the "chronics" collection in the database
    await chronicPatientDocument.save();

    // Send a success response
    res.status(201).json({
      success: true,
      message: "Data saved successfully",
      patient: chronicPatientDocument,
    });

  } catch (error) {
    console.error("Error in sendChronicForm:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
});



// Check Available Slots
exports.checkAvailableSlots = asyncHandler(async (req, res) => {
  const { appointmentDate } = req.body;
  const phone = req.user.phone;

  const patient = await Patient.findOne({ phone });
  if (!patient) {
    return res.status(404).json({ message: "Patient not found" });
  }

  const medicalDetails = await MedicalDetails.findOne({
    patientId: patient._id,
  });
  if (!medicalDetails) {
    return res.status(404).json({ message: "Medical details not found" });
  }

  const diseaseType = medicalDetails.diseaseType.name.toLowerCase();

  const timeSlots = [
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];
  const appointments = await Appointment.find({ appointmentDate });

  const isMorningSlot = (slot) => timeSlots.indexOf(slot) < 4;

  const availableSlots = timeSlots.filter((slot) => {
    const isBooked = appointments.some((appt) => appt.timeSlot === slot);
    if (isBooked) return false;

    if (diseaseType === "chronic") {
      const chronicBookingInMorning = appointments.some(
        (appt) => appt.isChronic && isMorningSlot(appt.timeSlot)
      );
      const chronicBookingInAfternoon = appointments.some(
        (appt) => appt.isChronic && !isMorningSlot(appt.timeSlot)
      );

      if (
        (chronicBookingInMorning && isMorningSlot(slot)) ||
        (chronicBookingInAfternoon && !isMorningSlot(slot))
      ) {
        return false;
      }
    }

    return true;
  });

  res.status(200).json({ availableSlots });
});

const addEventToGoogleCalendar = async (doctorId, appointment) => {
  try {
    // Only select the fields we need for calendar integration
    const doctor = await Doctor.findById(doctorId)
      .select("googleAccessToken googleRefreshToken name email")
      .lean(); // Use lean() to get a plain JavaScript object without Mongoose validation

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    // Check if the doctor has the necessary tokens
    // if (!doctor.googleAccessToken || !doctor.googleRefreshToken) {
    if (!doctor.googleAccessToken) {
      throw new Error("Doctor does not have Google OAuth tokens");
    }

    // Use the tokens to set the credentials for googleClient
    oauth2Client.setCredentials({
      access_token: doctor.googleAccessToken,
      refresh_token: doctor.googleRefreshToken,
    });

    // Set up Google Calendar API
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Prepare event details
    const event = {
      summary: `Appointment with ${appointment.patientName}`,
      description: `Consultation for ${appointment.reason || "General Consultation"
        }`,
      start: {
        dateTime: `${appointment.appointmentDate}T${appointment.timeSlot}:00`,
        timeZone: "Asia/Kolkata",
      },
      end: {
        dateTime: `${appointment.appointmentDate}T${String(
          parseInt(appointment.timeSlot.split(":")[0]) + 1
        ).padStart(2, "0")}:00:00`,
        timeZone: "Asia/Kolkata",
      },
      conferenceData: {
        createRequest: {
          requestId: `appointment-${appointment._id || Date.now()}`,
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
      attendees: [{ email: appointment.patientEmail }],
    };

    try {
      // Insert the event into the doctor's Google Calendar
      const calendarEvent = await calendar.events.insert({
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
      });

      // If token was refreshed, update it in the database
      if (calendarEvent.config && calendarEvent.config.headers) {
        const newAccessToken =
          calendarEvent.config.headers.Authorization.split(" ")[1];
        if (newAccessToken !== doctor.googleAccessToken) {
          await Doctor.findByIdAndUpdate(doctorId, {
            googleAccessToken: newAccessToken,
          });
        }
      }

      return {
        id: calendarEvent.data.id,
        meetLink: calendarEvent.data.hangoutLink,
        start: calendarEvent.data.start,
        end: calendarEvent.data.end,
      };
    } catch (error) {
      if (
        error.message.includes("invalid_token") ||
        error.message.includes("Invalid Credentials")
      ) {
        // Token expired, try to refresh
        const { tokens } = await oauth2Client.refreshToken(
          doctor.googleRefreshToken
        );

        // Update the doctor's access token
        await Doctor.findByIdAndUpdate(doctorId, {
          googleAccessToken: tokens.access_token,
        });

        // Retry with new token
        oauth2Client.setCredentials({
          access_token: tokens.access_token,
          refresh_token: doctor.googleRefreshToken,
        });

        const calendarEvent = await calendar.events.insert({
          calendarId: "primary",
          resource: event,
          conferenceDataVersion: 1,
        });

        return {
          id: calendarEvent.data.id,
          meetLink: calendarEvent.data.hangoutLink,
          start: calendarEvent.data.start,
          end: calendarEvent.data.end,
        };
      }
      throw error;
    }
  } catch (error) {
    console.error("Failed to add event to Google Calendar:", error);
    throw new Error("Could not add event to Google Calendar.");
  }
};

const refreshZoomToken = async (doctor) => {
  try {
    console.log("Inside!");
    const response = await axios.post("https://zoom.us/oauth/token", null, {
      params: {
        grant_type: "refresh_token",
        refresh_token: doctor.zoomRefreshToken,
      },
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
    });

    const { access_token, refresh_token } = response.data;
    console.log("yuhh! Zoom Access Token:", access_token);
    console.log("Zoom Refresh Token:", refresh_token);
    // Save the new tokens in the doctor's database
    doctor.zoomAccessToken = access_token;
    doctor.zoomRefreshToken = refresh_token;
    await doctor.save();

    return access_token;
  } catch (error) {
    console.error("Failed to refresh Zoom token:", error);
    throw new Error("Zoom token refresh failed");
  }
};

//zoom function
const addAppointmentToCalendar = async (doctorId, appointment) => {
  try {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) throw new Error("Doctor not found");

    if (!doctor.zoomAccessToken) {
      throw new Error("Doctor is missing Zoom access token");
    }

    let accessToken = doctor.zoomAccessToken;
    try {
      await axios.get("https://api.zoom.us/v2/users/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      console.log("Zoom token expired, refreshing...");
      accessToken = await refreshZoomToken(doctor);
    }

    const startTime = new Date(
      `${appointment.appointmentDate}T${appointment.timeSlot}:00`
    );
    const isoStartTime = startTime.toISOString();

    const meetingDetails = {
      topic: `Appointment with ${appointment.patientName}`,
      type: 2, // Scheduled meeting
      start_time: isoStartTime,
      duration: 60,
      timezone: "Asia/Kolkata",
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        waiting_room: true, // Enable waiting room for better control
        mute_upon_entry: true, // Participants are muted when they join
        approval_type: 0, // No registration required
        registration_type: 1,
        audio: "both", // Allow both computer and phone audio
        enforce_login: false,
        auto_recording: "none",
        // alternative_hosts: doctor.personalEmail,
        meeting_authentication: false,
        screen_share: false, // Only host can share screen
        whiteboard: false, // Disable whiteboard access for participants
        allow_multiple_devices: false, // Prevent login from multiple devices
        allow_participants_to_rename: false, // Prevent participants from renaming themselves
        allow_participants_chat: false, // Disable chat for participants
        allow_file_transfer: false, // Disable file transfer
        allow_live_streaming: false, // Disable live streaming
        allow_participants_unmute: false, // Prevent participants from unmuting themselves
        allow_participants_reactions: false, // Disable reactions
      },
    };
    // Add more detailed error logging
    try {
      const zoomResponse = await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        meetingDetails,
        {
          headers: {
            Authorization: `Bearer ${doctor.zoomAccessToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const zoomLink = zoomResponse.data.join_url;
      console.log("Zoom Link:", zoomLink);
      // Rest of your calendar code...
      // oauth2Client.setCredentials({
      //   access_token: process.env.GOOGLE_ACCESS_TOKEN,
      //   refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      // });

      // const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      // const event = {
      //   summary: `Appointment with ${appointment.patientName}`,
      //   description: `Consultation\nZoom Link: ${zoomLink}`,
      //   start: {
      //     dateTime: isoStartTime,
      //     timeZone: "Asia/Kolkata",
      //   },
      //   end: {
      //     dateTime: new Date(startTime.getTime() + 60 * 60000).toISOString(), // Add 60 minutes
      //     timeZone: "Asia/Kolkata",
      //   },
      //   attendees: [{ email: appointment.patientEmail }],
      // };

      // const calendarEvent = await calendar.events.insert({
      //   calendarId: "primary",
      //   resource: event,
      // });

      return {
        // googleEventId: calendarEvent.data.id,
        zoomLink,
      };
    } catch (zoomError) {
      console.error("Zoom API Error Details:", {
        status: zoomError.response?.status,
        statusText: zoomError.response?.statusText,
        data: zoomError.response?.data,
      });
      throw new Error(
        `Zoom meeting creation failed: ${zoomError.response?.data?.message || zoomError.message
        }`
      );
    }
  } catch (error) {
    console.error("Failed to add appointment to calendar:", error.message);
    throw error; // Throw the actual error instead of a generic one
  }
};

exports.finalizeAppointment = asyncHandler(async (req, res) => {
  const { appointmentId, paymentId } = req.body;

  // Find the draft appointment
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment || appointment.status !== "draft") {
    return res.status(404).json({ message: "Draft appointment not found" });
  }

  // Find the patient
  const phone = req.user.phone;
  const user = await Patient.findOne({ phone });
  if (!user) return res.status(404).json({ message: "Patient not found" });

  const doctorId = "67bc3391654d85340a8ce713"; // Get from configuration
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return res.status(404).json({ message: "Doctor not found" });
  }

  // Ensure the appointment belongs to this user
  if (appointment.patient.toString() !== user._id.toString()) {
    return res
      .status(403)
      .json({ message: "Not authorized to finalize this appointment" });
  }

  try {
    // Verify the appointment is still available (double check)
    const timeSlots = [
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];
    const isMorningSlot = (slot) => timeSlots.indexOf(slot) < 4;

    // Check for conflicting appointments again (in case something was booked between draft and finalize)
    const conflictingAppointments = await Appointment.find({
      appointmentDate: appointment.appointmentDate,
      status: "confirmed",
      _id: { $ne: appointment._id }, // Exclude current appointment
    });

    if (appointment.isChronic) {
      const chronicBookingInMorning = conflictingAppointments.some(
        (appt) => appt.isChronic && isMorningSlot(appt.timeSlot)
      );
      const chronicBookingInAfternoon = conflictingAppointments.some(
        (appt) => appt.isChronic && !isMorningSlot(appt.timeSlot)
      );

      if (
        (isMorningSlot(appointment.timeSlot) && chronicBookingInMorning) ||
        (!isMorningSlot(appointment.timeSlot) && chronicBookingInAfternoon)
      ) {
        return res.status(400).json({
          message:
            "The selected time slot is no longer available for chronic patients",
        });
      }
    } else {
      const isSlotBooked = conflictingAppointments.some(
        (appt) => appt.timeSlot === appointment.timeSlot
      );

      if (isSlotBooked) {
        return res
          .status(400)
          .json({ message: "Time slot is no longer available" });
      }
    }

    // Apply referral logic
    const previousAppointments = await Appointment.find({
      patient: user._id,
      status: "confirmed",
    });

    const couponCode = user.coupon;
    if (previousAppointments.length === 0 && couponCode) {
      const referral = await Referral.findOne({
        code: couponCode,
        isUsed: false,
      });
      if (referral) {
        referral.firstAppointmentDone = true;
        await referral.save();
      }
    }

    // Auto-apply coupon logic for referrer
    let appliedCoupon = null;
    const referrerCoupons = await Referral.find({
      referrerId: user._id,
      isUsed: false,
      firstAppointmentDone: true,
    });

    if (referrerCoupons.length > 0) {
      appliedCoupon = referrerCoupons[0];
      appliedCoupon.isUsed = true; // Mark the coupon as used
      await appliedCoupon.save();
      console.log(
        `Coupon ${appliedCoupon.code} automatically applied for referrer ${user.name}.`
      );
    }

    // Format the date to YYYY-MM-DD format
    const formatDateForCalendar = (dateString) => {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    };

    // Generate meeting link
    let calendarEvent;
    const formattedDate = formatDateForCalendar(appointment.appointmentDate);

    if (doctor.videoPlatform === "googleMeet") {
      calendarEvent = await addEventToGoogleCalendar(doctorId, {
        _id: appointment._id,
        patientName: user.name,
        patientEmail: user.email,
        appointmentDate: formattedDate,
        timeSlot: appointment.timeSlot,
        reason: appointment.reason,
      });

      if (calendarEvent && calendarEvent.meetLink) {
        appointment.meetLink = calendarEvent.meetLink;
      }
    } else if (doctor.videoPlatform === "zoom") {
      calendarEvent = await addAppointmentToCalendar(doctor, {
        patient: user._id,
        patientName: user.name,
        patientEmail: user.email,
        appointmentDate: formattedDate,
        timeSlot: appointment.timeSlot,
      });

      if (calendarEvent && calendarEvent.zoomLink) {
        appointment.meetLink = calendarEvent.zoomLink;
      }
    } else {
      return res
        .status(400)
        .json({ message: "Invalid calendar type in doctor's preferences." });
    }

    // Update appointment status and add payment details
    appointment.status = "confirmed";
    appointment.paymentId = paymentId;

    // Update patient follow-up status
    user.follow = "Follow up-C";
    await user.save();

    // Save the updated appointment
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment finalized successfully",
      calendarEvent,
      appointment,
      appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
    });
  } catch (error) {
    // If an error occurs, revert coupon status if applied
    if (appliedCoupon) {
      appliedCoupon.isUsed = false;
      await appliedCoupon.save();
    }

    // If referral was applied, revert it
    if (
      previousAppointments &&
      previousAppointments.length === 0 &&
      couponCode
    ) {
      const referral = await Referral.findOne({
        code: couponCode,
        isUsed: false,
      });
      if (referral) {
        referral.firstAppointmentDone = false;
        await referral.save();
      }
    }

    console.error("Failed to finalize appointment:", error);
    res.status(500).json({
      message: "Failed to finalize appointment",
      error: error.message,
    });
  }
});

// Book appointment
exports.bookAppointment = asyncHandler(async (req, res) => {
  const phone = req.user.phone;
  const {
    appointmentDate,
    timeSlot,
    consultingFor,
    consultingReason,
    symptom,
  } = req.body;

  const doctorId = "67bc3391654d85340a8ce713"; // should be changed

  try {
    // Find user and validate
    const user = await Patient.findOne({ phone });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Patient not found",
      });
    }

    const medicalDetails = await MedicalDetails.findOne({
      patientId: user._id,
    });

    if (!medicalDetails) {
      return res.status(400).json({
        success: false,
        message: "Medical details not found",
      });
    }

    // Find doctor
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.role !== "admin-doctor") {
      return res.status(400).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Validate time slot
    const timeSlots = [
      "10:00",
      "11:00",
      "12:00",
      "13:00",
      "14:00",
      "15:00",
      "16:00",
      "17:00",
    ];

    if (!timeSlots.includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot",
      });
    }

    // Validate date
    const currentDate = new Date();
    const appointmentDateObj = new Date(appointmentDate);
    const oneMonthLater = new Date();
    oneMonthLater.setMonth(currentDate.getMonth() + 1);

    if (
      appointmentDateObj < currentDate ||
      appointmentDateObj > oneMonthLater
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment date",
      });
    }

    // Check slot availability with concurrency protection
    const isChronic =
      medicalDetails.diseaseType.name.toLowerCase() === "chronic";
    const isMorningSlot = (slot) => timeSlots.indexOf(slot) < 4;

    // Check for existing confirmed or reserved appointments
    const existingAppointments = await Appointment.find({
      appointmentDate,
      status: { $in: ["reserved", "confirmed"] },
      expiresAt: { $gt: new Date() }, // Only consider non-expired reservations
    });

    // Slot availability logic
    if (isChronic) {
      const chronicBookingInMorning = existingAppointments.some(
        (appt) => appt.isChronic && isMorningSlot(appt.timeSlot)
      );
      const chronicBookingInAfternoon = existingAppointments.some(
        (appt) => appt.isChronic && !isMorningSlot(appt.timeSlot)
      );

      if (
        (isMorningSlot(timeSlot) && chronicBookingInMorning) ||
        (!isMorningSlot(timeSlot) && chronicBookingInAfternoon)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The selected time slot is not available for chronic patients",
        });
      }
    } else {
      const isSlotBooked = existingAppointments.some(
        (appt) => appt.timeSlot === timeSlot
      );

      if (isSlotBooked) {
        return res.status(400).json({
          success: false,
          message: "Time slot is not available",
        });
      }
    }

    // Handle referral logic (existing code)
    const referrerCoupons = await Referral.find({
      referrerId: user._id,
      isUsed: false,
      firstAppointmentDone: true,
    });

    let appliedCoupon = null;
    if (referrerCoupons.length > 0) {
      appliedCoupon = referrerCoupons[0];
      appliedCoupon.isUsed = true;
      await appliedCoupon.save();
    }

    // Handle referee logic
    const previousAppointments = await Appointment.findOne({
      patient: user._id,
      status: "confirmed",
    });

    const couponCode = user.coupon;
    let referralToUpdate = null;
    if (!previousAppointments && couponCode) {
      const referral = await Referral.findOne({
        code: couponCode,
        isUsed: false,
      });

      if (referral) {
        referral.firstAppointmentDone = true;
        await referral.save();
        referralToUpdate = referral;
      }
    }

    // Create RESERVED appointment (not confirmed yet)
    const newAppointment = new Appointment({
      patient: user._id,
      patientEmail: user.email,
      patientName: user.name,
      consultingFor: consultingFor, // Fixed: remove .label since consultingFor is now just the ID
      diseaseName: consultingReason,
      symptom: symptom,
      doctor: doctor._id,
      doctorName: doctor.name,
      appointmentDate,
      timeSlot,
      isChronic,
      status: "reserved", // Key change: only reserved, not confirmed
      isPaid: false,
      payment: 500, // Amount in paise
      reservedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 60 * 1000), // 7 minutes expiry
    });

    const savedAppointment = await newAppointment.save();

    res.status(201).json({
      success: true,
      message:
        "Slot reserved temporarily. Please complete payment within 7 minutes.",
      appointmentId: savedAppointment._id,
      amount: 50000, // Amount in paise
      expiresAt: new Date(Date.now() + 7 * 60 * 1000),
    });
  } catch (error) {
    console.error("Failed to reserve appointment:", error);

    res.status(400).json({
      success: false,
      message: error.message || "Failed to reserve appointment",
    });
  }
});

// Optional: Add a cleanup job to remove expired reservations
exports.cleanupExpiredReservations = asyncHandler(async (req, res) => {
  try {
    const result = await Appointment.deleteMany({
      status: "reserved",
      expiresAt: { $lt: new Date() },
    });

    console.log(`Cleaned up ${result.deletedCount} expired reservations`);

    if (res) {
      res.status(200).json({
        success: true,
        message: `Cleaned up ${result.deletedCount} expired reservations`,
      });
    }
  } catch (error) {
    console.error("Error cleaning up expired reservations:", error);
    if (res) {
      res.status(500).json({
        success: false,
        message: "Failed to cleanup expired reservations",
      });
    }
  }
});

exports.getUserAppointments = async (req, res) => {
  console.log("User Appointments endpoint reached");
  try {
    const userId = req.user.id; // Assuming you have user authentication middleware
    const { filter } = req.query;
    console.log("user id:", userId);
    console.log("Filter:", filter);
    let query = { patient: userId };
    const currentDate = moment().startOf("day");

    switch (filter) {
      case "past":
        query.appointmentDate = { $lt: currentDate.toDate() };
        break;
      case "today":
        query.appointmentDate = {
          $gte: currentDate.toDate(),
          $lt: moment(currentDate).endOf("day").toDate(),
        };
        break;
      case "thisWeek":
        query.appointmentDate = {
          $gte: currentDate.toDate(),
          $lt: moment(currentDate).endOf("week").toDate(),
        };
        break;
      case "thisMonth":
        query.appointmentDate = {
          $gte: currentDate.toDate(),
          $lt: moment(currentDate).endOf("month").toDate(),
        };
        break;
      case "nextAppointment":
        console.log("Inside");
        const nextAppointment = await Appointment.findOne({
          patient: userId,
          appointmentDate: { $gte: new Date() },
        })
          .populate("patient", "name") // Get patient name
          .sort({ appointmentDate: 1, timeSlot: 1 }) // Get closest upcoming appointment
          .select("appointmentDate timeSlot diseaseName patient");
        console.log("nextAppointment", nextAppointment);
        if (!nextAppointment) {
          return res
            .status(404)
            .json({ message: "No upcoming appointments found" });
        }

        const appointmentDate = new Date(nextAppointment.appointmentDate);
        return res.json({
          patientName: nextAppointment.patient.name,
          diseaseName: nextAppointment.diseaseName,
          date: appointmentDate.getDate(),
          month: appointmentDate.toLocaleString("default", { month: "long" }),
          time: nextAppointment.timeSlot,
        });
      default:
        // If no filter or 'all', fetch all appointments
        break;
    }

    const appointments = await Appointment.find(query)
      .populate("doctor", "name specialty") // Assuming doctor has name and specialty fields
      .sort({ appointmentDate: 1, timeSlot: 1 });

    res.json(appointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching appointments", error: error.message });
  }
};

exports.updateFollowUpStatus = async (req, res) => {
  try {
    const { patientId } = req.params;
    const appointment = await Appointment.findById(patientId);
    if (!appointment) {
      return res.status(404).json({ message: "appointment not found" });
    }

    const exDtTm = new Date();

    // Update follow-up status
    switch (appointment.follow) {
      case "Follow up-C":
        appointment.follow = "Follow up-P";
        break;
      case "Follow up-P":
        appointment.follow = "Follow up-Mship";
        appointment.followUpTimestamp = exDtTm; // Store timestamp when status changes to Mship
        break;
      case "Follow up-Mship":
        appointment.follow = "Follow up-MP";
        break;
      case "Follow up-MP":
        appointment.follow = "Follow up-ship";
        break;
      default:
        return res.status(400).json({ message: "Invalid follow-up status" });
    }

    await appointment.save();

    res.status(200).json({
      message: "Follow-up status updated successfully",
      appointment: {
        id: appointment._id,
        follow: appointment.follow,
        followUpTimestamp: appointment.followUpTimestamp,
      },
    });
  } catch (error) {
    console.error("Error updating follow-up status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update Call Status
exports.updateFollowPatientCall = async (req, res) => {
  const { patientId } = req.params;
  const { newCallStatus } = req.body;

  try {
    // Find the patient by ID
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Update the call status
    patient.enquiryStatus = newCallStatus;

    // If the new call status is 'Completed', update the follow-up status
    if (newCallStatus === "Completed") {
      patient.follow = "Follow up-C"; // Change this to the desired follow-up status
    }

    // Save the updated patient record
    await patient.save();

    res
      .status(200)
      .json({ message: "Call status updated successfully", patient });
  } catch (error) {
    console.error("Error updating call status:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

exports.referFriend = asyncHandler(async (req, res) => {
  const { friendName, friendPhone } = req.body;
  console.log("Received request body:", req.body);
  const referrerPhone = req.user.phone;
  console.log(referrerPhone);

  const generateReferralCode = () => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // 62 characters
    let referralCode = "";
    for (let i = 0; i < 8; i++) {
      referralCode += chars[Math.floor(Math.random() * chars.length)];
    }
    return referralCode;
  };

  try {
    // Check if the referrer is a registered patient
    const referrer = await Patient.findOne({ phone: referrerPhone });
    if (!referrer) {
      return res
        .status(404)
        .json({ success: false, message: "Referrer not found" });
    }

    // Check if referrer has made at least one appointment
    const appointmentBooked = await Appointment.findOne({
      patient: referrer._id,
    });
    if (!appointmentBooked) {
      return res.status(400).json({
        success: false,
        message: "First make an appointment to refer a friend",
      });
    }

    const coupon = generateReferralCode();

    const check = await Patient.findOne({ phone: friendPhone });
    console.log("Check", check);
    if (check) {
      return res
        .status(400)
        .json({ message: "Patient with this mobile number already exists!" });
    }

    // Check if a referral for this friend already exists
    let referral = await Referral.findOne({
      referredFriendPhone: friendPhone,
      referrerId: referrer._id, // Match the same referrer
    });
    if (referral) {
      // If the current user has already referred this friend, don't allow duplication
      return res
        .status(400)
        .json({ message: "You have already referred this friend!" });
    } else {
      // Create a new referral document for the friend
      referral = await Referral.create({
        code: coupon,
        referrerId: referrer._id, // The referrer's ID
        referredFriendPhone: friendPhone, // The phone of the friend being referred
        referredFriendName: friendName,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      });
    }
    // Also pass the referee phone and name via query
    // Send an SMS to the friend with the registration link
    const referralLink = `https://localhost:5173/firstform?code=${coupon}`;
    console.log(referralLink);
    // await client.messages.create({
    //   body: `Hi ${friendName}, you've been referred by ${referrer.phone}. Click here to register: ${referralLink}`,
    //   from: "+12512728851", // Replace with your Twilio phone number
    //   to: friendPhone,
    // });

    res.status(200).json({
      success: true,
      message: "Referral sent successfully",
      referralLink: referralLink,
    });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.query;
    const referral = await Referral.findOne({
      code,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (referral) {
      res.status(200).json({
        success: true,
        data: {
          referredFriendName: referral.referredFriendName || "",
          referredFriendPhone: referral.referredFriendPhone,
        },
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Invalid or already used referral code.",
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addFamily = async (req, res) => {
  try {
    console.log("Endpoint reached addFamily at patientController");
    const { IndividulAccess, relationship } = req.body;
    const myPhone = req.user.phone;
    const User = await Patient.findOne({ phone: myPhone });
    if (!User) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if User has made at least one appointment
    const appointmentBooked = await Appointment.findOne({
      patient: User._id,
    });
    if (!appointmentBooked) {
      return res.status(400).json({
        success: false,
        message: "First make an appointment to add a family member",
      });
    }
    if (
      relationship.toLowerCase() !== "son" &&
      relationship.toLowerCase() !== "daughter"
    ) {
      // Check if the `relationship` already exists in the user's familyMembers
      const isPatientExists = User.familyMembers.some(
        (member) => member.relationship === relationship
      );
      console.log("isPatientExists: " + isPatientExists);

      if (isPatientExists) {
        return res.status(400).json({
          message: "This relationship already exists in familyMembers.",
        });
      }

      // Check if the `relationship` already exists in the `familyLink` collection
      const isFamilyLinkExists = await FamilyLink.findOne({
        userId: User._id,
        relationship: relationship,
      });

      if (isFamilyLinkExists) {
        return res.status(400).json({
          message:
            "This relationship already exists in the familyLink collection.",
        });
      }
    }

    if (
      !relationship ||
      ![
        "Father",
        "Mother",
        "Son",
        "Daughter",
        "Father in law",
        "Mother in law",
        "Husband",
        "Wife",
      ].includes(relationship)
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing relationship" });
    }
    if (IndividulAccess) {
      const { familyMemberPhone, familyMemberName } = req.body;
      console.log(
        "Received request body:",
        familyMemberName,
        familyMemberPhone
      );
      const check = await Patient.findOne({ phone: familyMemberPhone });
      if (check) {
        return res.json({
          message: "Patient with this mobile number already exists!",
        });
      }

      const token = crypto.randomBytes(16).toString("hex");
      let family = await FamilyLink.findOne({
        phone: familyMemberPhone,
      });

      if (family) {
        // Update existing referral with a new coupon code
        family.token = token;
        //family.referrerId = referrer._id; // Update the referrer if needed
        await family.save();
      } else {
        await FamilyLink.create({
          token,
          userId: User._id,
          name: familyMemberName,
          phone: familyMemberPhone,
          relationship,
        });
      }

      const link = `https://localhost:5173/firstform?familyToken=${token}`;

      // await client.messages.create({
      //   body: `Hi ${familyMemberName}, you've been referred by ${User.phone}. Click here to register: ${link}`,
      //   from: "+12512728851", // Replace with your Twilio phone number
      //   to: friendPhone,
      // });

      console.log(link);
      res.status(200).json({
        success: true,
        message: "Link sent successfully",
        link: link,
      });
    } else {
      const { name, age, phone, email, gender, diseaseName, diseaseType } =
        req.body;
      const {
        dob,
        weight,
        height,
        occupation,
        country,
        state,
        city,
        complaint,
        symptoms,
        associatedDisease,
        allopathy,
        diseaseHistory,
        surgeryHistory,
        allergies,
        bodyType,
      } = req.body;
      const existingPatient = await Patient.findOne({ phone });

      if (existingPatient) {
        // If patient already exists, return an error response
        return res.status(400).json({
          message: "Patient with this mobile number already exists",
        });
      }
      const currentLocation = country + ", " + state + ", " + city;
      // Create a new patient document
      const patientDocument = new Patient({
        name,
        age,
        phone,
        email,
        // gender,
        // diseaseName,
        // diseaseType,
        patientEntry: "Family Tree",
        currentLocation,
      });
      const saveBasic = await patientDocument.save();

      const medicalDocument = new MedicalDetails({
        patientId: saveBasic._id,
        consultingFor: relationship,
        //   name,
        //   age,
        //   phone,
        //   email,
        //   // gender,
        diseaseName,
        diseaseType,
      });
      const saveMedical = await medicalDocument.save();

      if (
        relationship == "Father" ||
        relationship == "Son" ||
        relationship == "Father-in-law"
      ) {
        patientDocument.gender = "Male";
      } else {
        patientDocument.gender = "Female";
      }
      await patientDocument.save();
      const chronicPatientDocument = new ChronicPatient({
        phone,
        dob,
        weight,
        height,
        occupation,
        country,
        state,
        city,
        complaint,
        symptoms,
        associatedDisease,
        allopathy,
        diseaseHistory,
        surgeryHistory,
        allergies,
        bodyType,
      });

      // Save the chronic patient document to the "chronics" collection in the database
      await chronicPatientDocument.save();
      res.status(201).json({
        message: "Patient data saved successfully",
        AcuteDetails: patientDocument,
        ChronicDetails: chronicPatientDocument,
      });
      const senderId = User._id;
      await Patient.findByIdAndUpdate(senderId, {
        $push: {
          familyMembers: {
            IndividulAccess: false,
            memberId: patientDocument._id, // Add patient ID as memberId
            relationship, // Include relationship role
            name: name, // Store the family member's name here
          },
        },
      });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.fetchFamilyDetails = async (req, res) => {
  try {
    const { familyToken } = req.query;

    if (!familyToken) {
      return res.status(400).json({
        success: false,
        message: "Family token is required",
      });
    }

    const familyLink = await FamilyLink.findOne({ token: familyToken });

    if (!familyLink) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired family token",
      });
    }

    // Derive gender
    const getGenderFromRelationship = (relationship) => {
      const maleRelationships = ["Father", "Son", "Father in law", "Husband"];
      const femaleRelationships = [
        "Mother",
        "Daughter",
        "Mother in law",
        "Wife",
      ];

      if (maleRelationships.includes(relationship)) {
        return "Male";
      } else if (femaleRelationships.includes(relationship)) {
        return "Female";
      } else {
        return "";
      }
    };

    const gender = getGenderFromRelationship(familyLink.relationship);

    return res.status(200).json({
      success: true,
      data: {
        name: familyLink.name,
        phone: familyLink.phone,
        gender: gender,
      },
    });
  } catch (error) {
    console.error("Error fetching family details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getFamily = async (req, res) => {
  try {
    // Find the patient document using the authenticated user's ID
    console.log("Reached!");
    const patient = await Patient.findOne({ _id: req.user.id });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Check if familyMembers array exists
    if (!patient.familyMembers || !Array.isArray(patient.familyMembers)) {
      return res.json({
        success: true,
        familyMembers: [],
      });
    }

    // Map through family members to structure the response
    const enrichedFamilyMembers = patient.familyMembers.map((member) => ({
      _id: member.memberId,
      name: member.name,
      relationship: member.relationship,
      IndividulAccess: member.IndividulAccess || false,
      dob: member.dob,
      weight: member.weight,
      height: member.height,
      occupation: member.occupation,
      country: member.country,
      state: member.state,
      city: member.city,
      complaint: member.complaint,
      symptoms: member.symptoms,
      associatedDisease: member.associatedDisease,
      allopathy: member.allopathy,
      diseaseHistory: member.diseaseHistory,
      surgeryHistory: member.surgeryHistory,
      allergies: member.allergies,
      bodyType: member.bodyType,
    }));

    return res.json({
      success: true,
      familyMembers: enrichedFamilyMembers,
    });
  } catch (error) {
    console.error("Error fetching family members:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching family members",
      error: error.message,
    });
  }
};

//getting family members details while making appointments
exports.getFamilyMembers = async (req, res) => {
  try {
    const myPhone = req.user.phone;
    const user = await Patient.findOne({ phone: myPhone });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const familyMembers = user.familyMembers.map((member) => ({
      id: member.memberId, // Unique identifier
      relationship: `${member.relationship} - ${member.name}`, // Display format
      IndividulAccess: member.IndividulAccess,
    }));

    res.status(200).json({
      success: true,
      familyMembers,
    });
  } catch (error) {
    console.error("Error fetching family members:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve family members" });
  }
};

exports.getPatientDetails = async (req, res) => {
  console.log("Patient Details endpoint reached");
  const patientId = req.user.id; // Adjust this based on your authentication method
  console.log(patientId);
  const patient = await Patient.findById(patientId);
  try {
    const patientId = req.user.id; // Adjust this based on your authentication method
    console.log(patientId);
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patientDetails = {
      consultingFor: patient.consultingFor,
      name: patient.name,
      age: patient.age,
      phone: patient.phone,
      whatsappNumber: patient.whatsappNumber,
      email: patient.email,
      gender: patient.gender,
      diseaseName: patient.diseaseName,
      diseaseType: patient.diseaseType,
      currentLocation: patient.currentLocation,
      patientEntry: patient.patientEntry,
    };

    res.json(patientDetails);
  } catch (error) {
    console.error("Error fetching family member details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching family member details",
      error: error.message,
    });
  }
};

exports.getFamilyMemberDetails = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user.id;

    const familyMember = await FamilyLink.findOne({
      memberId,
      userId,
    });

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    res.status(200).json({
      success: true,
      familyMember,
    });
  } catch (error) {
    console.error("Error fetching family member details:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching family member details",
      error: error.message,
    });
  }
};

// Update family member access
exports.updateFamilyMemberAccess = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { IndividulAccess } = req.body;
    const userId = req.user.id;

    const familyMember = await FamilyLink.findOneAndUpdate(
      { memberId, userId },
      { IndividulAccess },
      { new: true }
    );

    if (!familyMember) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    res.status(200).json({
      success: true,
      familyMember,
    });
  } catch (error) {
    console.error("Error updating family member access:", error);
    res.status(500).json({
      success: false,
      message: "Error updating family member access",
      error: error.message,
    });
  }
};

// Add new family member
exports.addFamilyMember = async (req, res) => {
  try {
    const { name, relationship } = req.body;
    const userId = req.user.id;

    // Validate relationship
    const validRelationships = [
      "Father",
      "Mother",
      "Son",
      "Daughter",
      "Father in law",
      "Mother in law",
    ];
    if (!validRelationships.includes(relationship)) {
      return res.status(400).json({
        success: false,
        message: "Invalid relationship type",
      });
    }

    const newFamilyMember = new FamilyLink({
      name,
      relationship,
      memberId: new mongoose.Types.ObjectId(),
      userId,
      IndividulAccess: false,
    });

    await newFamilyMember.save();

    res.status(201).json({
      success: true,
      familyMember: newFamilyMember,
    });
  } catch (error) {
    console.error("Error adding family member:", error);
    res.status(500).json({
      success: false,
      message: "Error adding family member",
      error: error.message,
    });
  }
};

// Remove family member
exports.removeFamilyMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const userId = req.user.id;

    const result = await FamilyLink.findOneAndDelete({
      memberId,
      userId,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Family member not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Family member removed successfully",
    });
  } catch (error) {
    console.error("Error removing family member:", error);
    res.status(500).json({
      success: false,
      message: "Error removing family member",
      error: error.message,
    });
  }
};

// Search family members
exports.searchFamilyMembers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;

    const searchRegex = new RegExp(query, "i");

    const familyMembers = await FamilyLink.find({
      userId,
      $or: [{ name: searchRegex }, { relationship: searchRegex }],
    }).select("name relationship memberId IndividulAccess");

    res.status(200).json({
      success: true,
      familyMembers,
    });
  } catch (error) {
    console.error("Error searching family members:", error);
    res.status(500).json({
      success: false,
      message: "Error searching family members",
      error: error.message,
    });
  }
};

// Filter family members by relationship
exports.filterFamilyMembers = async (req, res) => {
  try {
    const { relationship } = req.query;
    const userId = req.user.id;

    const query = { userId };

    if (relationship !== "All") {
      if (relationship === "Parents") {
        query.relationship = {
          $in: ["Father", "Mother", "Father in law", "Mother in law"],
        };
      } else if (relationship === "Children") {
        query.relationship = {
          $in: ["Son", "Daughter"],
        };
      } else if (relationship === "In-Laws") {
        query.relationship = {
          $regex: /in law/i,
        };
      } else if (relationship === "Individual Access") {
        query.IndividulAccess = true;
      } else if (relationship === "No Access") {
        query.IndividulAccess = false;
      }
    }

    const familyMembers = await FamilyLink.find(query)
      .select("name relationship memberId IndividulAccess")
      .sort({ relationship: 1, name: 1 });

    res.status(200).json({
      success: true,
      familyMembers,
    });
  } catch (error) {
    console.error("Error filtering family members:", error);
    res.status(500).json({
      success: false,
      message: "Error filtering family members",
      error: error.message,
    });
  }
};

exports.fetchProfile = async (req, res) => {
  try {
    const patientId = req.user.id; // Adjust this based on your authentication method
    console.log(patientId);
    // const patient = await Patient.findById(patientId);
    const patient = await Patient.findById(patientId).select("-password"); // Exclude sensitive data

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(patient);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const patientId = req.user._id; // assuming authentication middleware sets this
    const patient = await Patient.findById(patientId);

    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    let profilePhotoUrl = "";

    if (req.file) {
      // 📤 Upload file to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "patient_profiles",
        resource_type: "image",
      });

      profilePhotoUrl = uploadResult.secure_url;

      // if (req.file) {
      //   const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      //     folder: "patient_profile_photos",
      //     public_id: `${patientId}_profile`,
      //     overwrite: true,
      //   });

      //   profilePhotoUrl = uploadResult.secure_url;

      // 🧹 Clean up local file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });
    } else {
      // 🖼️ Generate avatar using initials if no file uploaded
      const initials = patient.name
        ? patient.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
        : "P";

      profilePhotoUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128`;
    }

    // ✅ Save to patient
    patient.profilePhoto = profilePhotoUrl;
    await patient.save();

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully",
      profilePhoto: profilePhotoUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload profile picture",
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Destructure the fields from the request body
    const { name, age, phone, whatsappNumber, gender } = req.body;

    // Find and update the patient document
    const updatedPatient = await Patient.findByIdAndUpdate(
      userId,
      {
        name,
        age,
        phone,
        whatsappNumber,
        gender,
      },
      { new: true, runValidators: true }
    );

    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// exports.getProfile = async (req, res) => {
//   try {
//     const patientId = req.user._id;
//     const patient = await Patient.findById(patientId).select(
//       "name email profilePhoto"
//     );

//     if (!patient) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Patient not found" });
//     }

//     res.status(200).json({ success: true, data: patient });
//   } catch (error) {
//     console.error("Fetch error:", error);
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Failed to fetch profile",
//         error: error.message,
//       });
//   }
// };

// // Update Appointment
// exports.updateAppointment = asyncHandler(async (req, res) => {
//   const { id } = req.params;
//   const { status } = req.body;

//   const appointment = await Appointment.findById(id);
//   if (!appointment) {
//     return res.status(404).json({ message: "Appointment not found" });
//   }

//   appointment.status = status || appointment.status;
//   await appointment.save();

//   res.status(200).json({
//     message: "Appointment updated successfully",
//     appointment,
//   });
// });

// // Get Appointments by Date
// exports.getAppointmentsByDate = asyncHandler(async (req, res) => {
//   const { date } = req.query;

//   const appointmentDate = new Date(date);
//   const appointments = await Appointment.find({ appointmentDate });

//   res.status(200).json(appointments);
// });

// // Get Appointment by ID
// exports.getAppointmentById = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const appointment = await Appointment.findById(id);
//   if (!appointment) {
//     return res.status(404).json({ message: "Appointment not found" });
//   }

//   res.status(200).json(appointment);
// });

// // Cancel Appointment
// exports.cancelAppointment = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const appointment = await Appointment.findByIdAndDelete(id);
//   if (!appointment) {
//     return res.status(404).json({ message: "Appointment not found" });
//   }

//   res.status(200).json({ message: "Appointment cancelled successfully" });
// });

exports.getPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find().populate("userId", "name"); // Assuming user has 'name'
    res.json(payments);
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    console.log("GetAppointment is reaching");
    const { appointmentId } = req.params;
    console.log("Appointment ID: ", appointmentId);
    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID format" });
    }
    console.log("1");
    const appointment = await Appointment.findById(appointmentId)
      .populate("doctor", "name specialty")
      .populate("patient", "name");

    console.log("appointment: ", appointment);
    if (!appointment) {
      return res
        .status(404)
        .json({ message: `Appointment not found with ID: ${appointmentId}` });
    }
    console.log("2");
    // Check if the user is the patient or the doctor for this appointment
    console.log(
      "appointment.patient._id: ",
      appointment.patient._id.toString()
    );
    console.log("req.user.id: ", req.user.id);
    // console.log("req.user.role: ", req.user.role);
    // Must be implemented
    // if (
    //   appointment.patient._id.toString() !== req.user.id &&
    //   appointment.doctor._id.toString() !== req.user.id &&
    //   req.user.userType !== "admin"
    // ) {
    //   return res
    //     .status(403)
    //     .json({ message: "Not authorized to access this appointment" });
    // }
    console.log("3");

    res.json(appointment);
    console.log("4");
  } catch (error) {
    console.log("5");
    res
      .status(500)
      .json({ message: "Error fetching appointment", error: error.message });
  }
};

// Update appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(appointmentId)) {
      return res.status(400).json({ message: "Invalid appointment ID format" });
    }

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res
        .status(404)
        .json({ message: `Appointment not found with ID: ${appointmentId}` });
    }

    // Check authorization - only allow updates by the patient, doctor, or admin
    if (
      appointment.patient.toString() !== req.user.id &&
      appointment.doctor.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this appointment" });
    }

    // Update only allowed fields
    const allowedUpdates = ["status", "medicalPayment", "notes"];

    // Filter out updates that are not allowed
    const updates = Object.keys(req.body)
      .filter((update) => allowedUpdates.includes(update))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    // Apply updates
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate("doctor", "name specialty");

    res.json(updatedAppointment);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating appointment", error: error.message });
  }
};

exports.getPatientById = async (req, res) => {
  try {
    const user = await Patient.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAppointedDocs = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patient: req.query.id });
    const uniqueDoctorIds = [...new Set(appointments.map(doc => doc.doctor.toString()))];
    const docDetails = await Doctor.find({_id:{$in:uniqueDoctorIds}})
    res.json(docDetails);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};
