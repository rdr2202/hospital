import React from "react";
import consultation from "/src/assets/images/patient images/Consultation.png";
import article1 from "/src/assets/images/patient images/article1.png";
import article2 from "/src/assets/images/patient images/article2.png";
import workshop from "/src/assets/images/patient images/workshop.jpg";
import { ArrowRightCircle } from 'lucide-react'; // Correct icon import
import { useNavigate } from 'react-router-dom';


const HomePage = () => 
    { 
    const navigate = useNavigate();
    const book = () => {
    navigate('/appointments/newappointment');
    };
  return (
   
    <div className="bg-gray-100 min-h-screen flex flex-col items-center">
      {/* Navigation Bar */}
      <header className="bg-white w-full py-4 shadow-md">
        <nav className="container mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">Medapp</div>
          <div>
            <a href="#services" className="text-gray-600 px-4">
              Our Services
            </a>
            <a href="#about" className="text-gray-600 px-4">
              About Us
            </a>
            <a href="#contact" className="text-gray-600 px-4">
              Contact Us
            </a>
          </div>
          <div className="text-orange-600 font-bold">+1800 121 2323</div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between w-full py-12 bg-blue-100">
        <div className="lg:w-1/2 px-8 lg:px-20 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-blue-400 mb-4">
          Find your doctor and make an appoinments. 
          </h1>

          <p className="text-gray-700 mb-6">
          Talk to online doctors and now and get medical advices,online prescription and healthcare services
         
          </p>
          <button 
          onClick={book}
          className="bg-blue-400 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600">
            Book Now
          </button>
        </div>
        <div className="lg:w-1/2 flex justify-center">
          <img
            src={consultation}
            alt="Doctor Thumbs Up"
            className="max-w-sm rounded-full"
          />
        </div>
      </section>

      {/* Appointment Containers */}
      <div className="flex flex-row justify-center items-center mt-8 gap-6 w-full px-6">
        {/* Book Appointment Container */}
        <div className="flex flex-col items-center justify-center bg-blue-200 text-gray-700 shadow-lg rounded-lg p-6 w-40 h-52 md:w-52 md:h-60">
          <img
            src={consultation}
            alt="Book Appointment"
            className="h-25 w-25 object-contain mb-4"
          />
          <p className="font-bold text-md">Book Appointment</p>
        </div>

        {/* View Appointment Container */}
        <div className="flex flex-col items-center justify-center bg-purple-200 text-gray-700 shadow-lg rounded-lg p-6 w-40 h-52 md:w-52 md:h-60">
          <img
            src={consultation}
            alt="View Appointment"
            className="h-25 w-25 object-contain mb-4"
          />
          <p className="font-bold text-md">View Appointment</p>
        </div>

        {/* View Invoices Container */}
        <div className="flex flex-col items-center justify-center bg-indigo-200 text-gray-700 shadow-lg rounded-lg p-6 w-40 h-52 md:w-52 md:h-60">
          <img
            src={consultation}
            alt="View Invoices"
            className="h-25 w-25 object-contain mb-4"
          />
          <p className="font-bold text-md">View Invoices</p>
        </div>
      </div>

      {/* Image Section */}
      <section className="w-full bg-white px-18 py-12 mt-10">
  <div className="container mx-auto flex justify-between items-center">
    <div className="text-left w-1/3">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Read top articles from health experts
      </h2>
      <p className="text-gray-600 mb-4">
        Health articles that keep you informed about good health practices
        and help you achieve your goals.
      </p>
      <button className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600 mb-8">
        See all articles
      </button>
    </div>
    <div className="flex justify-center gap-6 w-2/3">
      <div className="bg-white rounded-lg shadow-md w-64 p-4">
        <img
          src={article2}
          alt="Article 1"
          className="rounded-lg mb-4"
        />
        <h3 className="font-bold text-lg text-gray-800">
          12 Coronavirus Myths
        </h3>
        <p className="text-gray-600">Dr. Diana Borgio</p>
      </div>
      <div className="bg-white rounded-lg shadow-md w-64 p-4">
        <img
          src={article1}
          alt="Article 2"
          className="rounded-lg mb-4"
        />
        <h3 className="font-bold text-lg text-gray-800">
          Eating Right for Immunity
        </h3>
        <p className="text-gray-600">Dr. Diana Borgio</p>
      </div>
    </div>
  </div>
</section> 

      {/* Workshops Section */}
      <section className="w-full mt-10  py-12 ">
  <div className="container mx-auto flex justify-between items-start gap-6">
    {/* Text Container */}
    <div className="w-1/3 text-left">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Workshops</h2>
      <p className="text-gray-600 mb-4">Our Most Popular Classes</p>
      <p className="text-gray-600 mb-4"> Workshops that keep you informed about good health practices
      and help you achieve your goals.</p>
      <button className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600">
        See All
      </button>
    </div>

    {/* Workshops Container */}
    <div className="flex flex-wrap mt-0 justify-end gap-6 w-2/3">
      {/* First Workshop */}
      <div className="bg-white rounded-lg shadow-md w-96 p-4">
        <img
          src={workshop}
          alt="Workshop 1"
          className="rounded-lg w-full h-48 object-cover mb-4"
        />
        <h3 className="font-bold text-lg text-orange-500 mt-4">Healthy Lifestyle</h3>
        <p className="text-gray-600 mb-2">
          Join us, and gain the confidence to do the work of being well, make
          healthier choices, pursue a healthier lifestyle and grow your ability
          to cope with whatever life throws at you!
        </p>
        <p className="text-gray-800 mb-4">11 Oct, at 2 pm</p>
        <div className="flex justify-between items-center">
          <span className="text-orange-500 font-bold">$17.84</span>
          <a href="#" className="text-gray-800">
            <ArrowRightCircle className="w-6 h-6 text-gray-800" />
          </a>
        </div>
      </div>

      {/* Second Workshop */}
      <div className="bg-white rounded-lg shadow-md w-96 p-4">
        <img
          src={workshop}
          alt="Workshop 2"
          className="rounded-lg w-full h-48 object-cover mb-4"
        />
        <h3 className="font-bold text-lg text-orange-500 mt-4">Healthy Lifestyle</h3>
        <p className="text-gray-600 mb-2">
          Join us, and gain the confidence to do the work of being well, make
          healthier choices, and grow your ability
          to cope with whatever life throws at you!
        </p>
        <p className="text-gray-800 mb-4">11 Oct, at 2 pm</p>
        <div className="flex justify-between items-center">
          <span className="text-orange-500 font-bold">$17.84</span>
          <a href="#" className="text-gray-800">
            <ArrowRightCircle className="w-6 h-6 text-gray-800" />
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

    </div>
  );
};

export default HomePage;
