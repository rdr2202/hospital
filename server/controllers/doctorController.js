const mongoose = require("mongoose");
const Doctor = require("../models/doctorModel");
const Appointment = require("../models/appointmentModel.js");
const Patient = require("../models/patientModel.js");
const ConsultationNote = require("../models/ConsultationNots.js")
const moment = require("moment");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

exports.addDoctor = async (req, res) => {
  const { name, age, gender, photo, specialization, bio, phone, role } =
    req.body;

  try {
    // Check if the requesting doctor is an admin
    const requestingDoctor = await Doctor.findOne({ phone: req.user.phone });
    if (!requestingDoctor || requestingDoctor.role !== "admin-doctor") {
      return res
        .status(403)
        .json({ message: "Only admin doctors can add new doctors" });
    }

    // Check if a doctor with the same phone number already exists
    const checkDoctor = await Doctor.findOne({ phone });
    if (checkDoctor) {
      return res.status(400).json({ message: "Doctor already exists!" });
    }

    // Create and save the new doctor
    const newDoctor = new Doctor({
      name,
      age,
      gender,
      photo,
      specialization,
      bio,
      phone,
      role: role || "assistant-doctor", // Default to "assistant-doctor" if no role is provided
    });

    await newDoctor.save();
    res
      .status(201)
      .json({ message: `${role || "Assistant"} doctor added successfully` });
  } catch (error) {
    // Improved error handling for validation errors
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation failed", error: error.message });
    }
    res
      .status(500)
      .json({ message: "Failed to add doctor", error: error.message });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const phone = req.user.phone;
    const email = req.user.email;
    const doctor = await Doctor.findOne({ phone });
    // console.log(doctor);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const { dateFilter, typeFilter } = req.query;
    const doctorRole = doctor.role;

    let query = {};
    let startDate, endDate;
    const now = new Date();

    switch (dateFilter) {
      case "today":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        query.appointmentDate = { $gte: startDate, $lte: endDate };
        break;
      case "this week":
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        endDate.setHours(23, 59, 59, 999);
        query.appointmentDate = { $gte: startDate, $lte: endDate };
        break;
      case "this month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        query.appointmentDate = { $gte: startDate, $lte: endDate };
        break;
      case "past":
        endDate = new Date(now.setHours(0, 0, 0, 0));
        query.appointmentDate = { $lt: endDate };
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
        endDate = new Date(now.setHours(23, 59, 59, 999));
        query.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    if (
      typeFilter === "mine" ||
      (doctorRole !== "admin-doctor" && typeFilter !== "all")
    ) {
      query.doctor = doctor._id;
    }

    const appointments = await Appointment.find(query)
      .populate({
        path: "patient",
        select: "name",
      })
      .populate({
        path: "doctor",
        select: "name",
      });

    if (appointments.length === 0) {
      return res
        .status(200)
        .json({ message: "No appointments found", appointments: [] });
    }

    const modifiedAppointments = appointments.map((appointment) => ({
      ...appointment._doc,
      canRedirect: doctorRole === "admin-doctor",
      doctorName: appointment.doctor ? appointment.doctor.name : "Unknown",
      patientName: appointment.patient ? appointment.patient.name : "Unknown",
    }));

    res.status(200).json({ appointments: modifiedAppointments });
  } catch (error) {
    res.status(500).json({
      message: "Failed to retrieve appointments",
      error: error.message,
    });
  }
};

exports.redirectAppointment = async (req, res) => {
  const { assistantDoctorId, appointmentId } = req.body;
  console.log("Assistant Doctor ID:", assistantDoctorId);
  console.log("Appointment ID:", appointmentId);

  try {
    const assistantDoctor = await Doctor.findOne({ _id: assistantDoctorId });
    const appointment = await Appointment.findById(appointmentId);

    // console.log("Assistant Doctor found:", assistantDoctor);
    // console.log("Appointment found:", appointment);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    if (!assistantDoctor) {
      return res.status(404).json({
        message: "No such doctor found or doctor is not allowed to redirect",
      });
    }

    appointment.doctor = assistantDoctorId;
    appointment.status = `redirected`;
    await appointment.save();

    res
      .status(200)
      .json({ message: "Appointment redirected successfully", appointment });
  } catch (e) {
    console.error("Error redirecting appointment:", e.message);
    res.status(500).json({
      message: "Failed to redirect appointment",
      error: e.message,
    });
  }
};

exports.getAssistantDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ role: "assistant-doctor" });
    res.status(200).json({ doctors });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Failed to fetch assistant doctors", error: e.message });
  }
};

exports.getUserRole = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const doctor = await Doctor.findById(decodedToken.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.status(200).json({ role: doctor.role });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Failed to get user role", error: e.message });
  }
};

exports.doctorDetails = async (req, res) => {
  try {
    console.log("Doctor details Endpoint reached");
    const doctorPhone = req.user.phone;
    console.log("Searching for doctor with phone:", doctorPhone);

    // Find the doctor by phone number
    const doctor = await Doctor.findOne({ phone: doctorPhone });

    if (!doctor) {
      console.log("Doctor not found for phone:", doctorPhone);
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    console.log("Doctor found:", doctor.name);

    // Return the doctor's details
    res.json({
      success: true,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        experience: doctor.experience,
        role: doctor.role,
        // Add any other relevant fields
      },
    });
  } catch (error) {
    console.error("Error in doctor/details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getDoctorFollow = async (req, res) => {
  console.log("GetDoctorFollow reached");
  const phone = req.user.phone; // Use the phone from the token
  console.log("doctor Phone:", phone);
  try {
    const doctor = await Doctor.findOne({ phone }); // Find by phone instead of ID
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json({ follow: doctor.follow });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

//add/modify amount for the appointment
exports.addAmount = async (req, res) => {
  const { amount } = req.body;

  try {
    // Check if the requesting doctor is an admin
    const requestingDoctor = await Doctor.findOne({ phone: req.user.phone });
    if (!requestingDoctor || requestingDoctor.role !== "admin-doctor") {
      return res
        .status(403)
        .json({ message: "Only admin doctors can add new doctors" });
    }
  } catch (e) {
    console.log(e);
  }
};

exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.doctorId);
    res.json({ videoPlatform: doctor.videoPlatform || "" });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Unable to fetch settings" });
  }
};

// exports.updateSettings = async (req, res) => {
//   try {
//     const { videoPlatform } = req.body;
//     const doctor = await Doctor.findByIdAndUpdate(
//       req.doctorId,
//       { videoPlatform },
//       { new: true }
//     );
//     res.json({ message: "Settings updated successfully", videoPlatform: doctor.videoPlatform });
//   } catch (error) {
//     console.error("Error updating settings:", error);
//     res.status(500).json({ error: "Failed to update settings" });
//   }
// };

exports.updateSettings = async (req, res) => {
  try {
    const { videoPlatform } = req.body;

    if (!videoPlatform) {
      return res.status(400).json({ error: "Video platform is required" });
    }

    console.log("Doctor ID from request:", req.doctorId);

    // Use req.doctorId, which was added by the middleware, to update the doctor’s settings
    const doctor = await Doctor.findByIdAndUpdate(
      req.doctorId, // Use the doctorId from the request
      { videoPlatform },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    console.log("Platform:", doctor.videoPlatform);
    res.json({
      message: "Settings updated successfully",
      videoPlatform: doctor.videoPlatform,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    // Fetch all appointments and populate patient details
    const appointments = await Appointment.find()
      .populate("patient", {
        name: 1,
        age: 1,
        newExisting: 1,
        phone: 1,
        whatsappNumber: 1,
        email: 1,
        gender: 1,
        medicalRecords: 1,
        patientEntry: 1,
        currentLocation: 1,
        appointmentFixed: 1,
        appDownload: 1,
        follow: 1,
        followComment: 1,
        followUpTimestamp: 1,
        familyMembers: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .lean(); // Fetch as plain objects for easier formatting

    // Transform data into the desired format
    const formattedData = appointments.map((appointment) => {
      const patientDetails = appointment.patient || {};
      return {
        ...patientDetails,
        medicalDetails: {
          _id: appointment._id,
          patientId: appointment.patient?._id,
          consultingFor: appointment.consultingFor,
          diseaseName: appointment.diseaseName,
          diseaseType: appointment.diseaseType,
          follow: appointment.follow,
          followComment: appointment.followComment,
          followUpTimestamp: appointment.followUpTimestamp,
          medicalPayment: appointment.medicalPayment,
          callCount: appointment.callCount,
          comments: appointment.comments,
          __v: appointment.__v,
        },
      };
    });
    console.log("data:", formattedData);
    res.status(200).json(formattedData);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API endpoint to fetch patient and appointment data
exports.getAllAppointmentsWithPatientData = async (req, res) => {
  try {
    const { selectedDate } = req.query;

    const query = {};

    if (selectedDate) {
      const start = new Date(selectedDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(23, 59, 59, 999);
      query.appointmentDate = { $gte: start, $lte: end };
    }

    const appointments = await Appointment.find(query);
    const patientIds = [
      ...new Set(appointments.map((appointment) => appointment.patient.toString())),
    ];

    const patients = await Patient.find({ _id: { $in: patientIds } });

    const response = [];

    patients.forEach((patient) => {
      const patientAppointments = appointments.filter(
        (appointment) => appointment.patient.toString() === patient._id.toString()
      );

      patientAppointments.forEach((appointment) => {
        response.push({
          _id: patient._id,
          name: patient.name,
          age: patient.age,
          newExisting: patient.newExisting,
          phone: patient.phone,
          whatsappNumber: patient.whatsappNumber,
          email: patient.email,
          gender: patient.gender,
          medicalRecords: patient.medicalRecords,
          patientEntry: patient.patientEntry,
          currentLocation: patient.currentLocation,
          appointmentFixed: patient.appointmentFixed,
          appDownload: patient.appDownload,
          follow: patient.follow,
          followComment: patient.followComment,
          followUpTimestamp: patient.followUpTimestamp,
          familyMembers: patient.familyMembers,
          createdAt: patient.createdAt,
          updatedAt: patient.updatedAt,
          medicalDetails: {
            _id: appointment._id,
            patientId: appointment.patient,
            doctorId: appointment.doctor, // Added this line
            consultingFor: appointment.consultingFor,
            appointmentDate: appointment.appointmentDate,
            timeSlot: appointment.timeSlot,
            diseaseName: appointment.diseaseName,
            diseaseType: appointment.diseaseType,
            follow: appointment.follow,
            followComment: appointment.followComment,
            followUpTimestamp: appointment.followUpTimestamp,
            medicalPayment: appointment.medicalPayment,
            callCount: appointment.callCount,
            comments: appointment.comments,
            meetLink: appointment.meetLink,
            drafts: appointment.notes,
            prescriptionCreated: appointment.prescriptionCreated,
          },
        });
      });
    });

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



exports.submitNotes = async (req, res) => {
  console.log("Reached");
  const { appointmentID, notes } = req.body;

  try {
    const appointment = await Appointment.findById(appointmentID);
    if (!appointment) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not found" });
    }

    appointment.notes = notes;
    await appointment.save();

    res
      .status(200)
      .json({ success: true, message: "Notes submitted successfully" });
  } catch (error) {
    console.error("Error submitting notes:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.fetchProfile = async (req, res) => {
  try {
    const doctorId = req.user.id; // Adjust this based on your authentication method
    console.log(doctorId);
    // const patient = await Patient.findById(doctorId);
    const doctor = await Doctor.findById(doctorId).select("-password"); // Exclude sensitive data

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Destructure the fields from the request body
    const { name, age, phone, whatsappNumber, gender } = req.body;

    // Find and update the patient document
    const updatedDoctor = await Doctor.findByIdAndUpdate(
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

    if (!updatedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedDoctor,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.uploadProfilePicture = async (req, res) => {
  try {
    const doctorId = req.user._id; // assuming authentication middleware sets this
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "Doctor not found" });
    }

    let profilePhotoUrl = "";

    if (req.file) {
      // 📤 Upload file to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "doctor_profiles",
        resource_type: "image",
      });

      profilePhotoUrl = uploadResult.secure_url;

      // if (req.file) {
      //   const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      //     folder: "doctor_profile_photos",
      //     public_id: `${doctorId}_profile`,
      //     overwrite: true,
      //   });

      //   profilePhotoUrl = uploadResult.secure_url;

      // 🧹 Clean up local file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });
    } else {
      // 🖼️ Generate avatar using initials if no file uploaded
      const initials = doctor.name
        ? doctor.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
        : "P";

      profilePhotoUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&size=128`;
    }

    // ✅ Save to doctor
    doctor.profilePhoto = profilePhotoUrl;
    await doctor.save();

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

//To check he is appointed with consultation or not
exports.getDoctorByFollow = async (req, res) => {
  try {
    const doctorId = req.user.id; // You should extract from token
    const doctor = await Doctor.findById(doctorId).select("role follow");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(doctor);
  } catch (err) {
    console.error("Error fetching doctor details:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


exports.getAppointmentWithTimedata = async (req, res) => {
  try {
    const patientId = new mongoose.Types.ObjectId(req.query.id);
    const type = req.query.type; // "past" or "future"

    const allAppointments = await Appointment.find({ patient: patientId });

    if (allAppointments.length === 0) {
      return res.json({ message: "The appointments are not found" });
    }

    const now = new Date();

    const filteredAppointments = allAppointments.filter(app => {
      const date = new Date(app.appointmentDate);
      const [hour, minute] = app.timeSlot.split(":").map(Number);
      date.setHours(hour, minute, 0, 0);
      return type === "past" ? date < now : date >= now;
    });

    res.json(filteredAppointments);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAppointedPatients = async (req,res)=>{
  try {
    const appointments = await Appointment.find({doctor:req.query.id});
    const appointedPatients = [...new Set(appointments.map(patient => patient.patient.toString()))];
    const patientDetails = await Patient.find({_id:{$in:appointedPatients}})
    res.json(patientDetails)
  } catch (error) {
    console.log(error)
  }
}

exports.consultationNotes = async (req, res) => {
  try {
    console.log('Received consultation note data:', req.body); // Debug log
    
    // Validate required fields
    const { patientId, userId, note } = req.body;
    
    if (!patientId || !userId || !note) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: patientId, userId, and note are required',
        received: req.body
      });
    }

    // Create new consultation note
    const consultationNote = new ConsultationNote({
      patientId,
      userId,
      note,
      date: req.body.date || new Date()
    });

    console.log('Saving consultation note:', consultationNote); // Debug log
    
    const savedNote = await consultationNote.save();
    
    console.log('Successfully saved note:', savedNote); // Debug log
    
    res.status(201).json({
      success: true,
      message: 'Consultation note saved successfully',
      data: savedNote
    });
    
  } catch (error) {
    console.error('Error saving consultation note:', error); // Detailed error log
    
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: Object.values(error.errors).map(err => err.message)
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry error',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};