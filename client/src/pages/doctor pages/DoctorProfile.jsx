import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import { useParams } from 'react-router-dom'; // For routing
import doc from '/src/assets/images/doctor images/doc.jpg';
import profile from '/src/assets/images/doctor images/profile.jpg'; // Placeholder for review profile pics
import Consultation from '/src/assets/images/doctor images/Consultation.jpg'; // Placeholder for patients image
import downloadapp from '/src/assets/images/doctor images/downloadapp.jpg'; // Placeholder for reviews image
import { FaStar } from 'react-icons/fa'; // Icons for star ratings

// Sample performance data
const performanceData = [
    { month: 'Jul', percentage: 76 },
    { month: 'Aug', percentage: 85 },
    { month: 'Sep', percentage: 88 },
    { month: 'Oct', percentage: 90 },
    { month: 'Nov', percentage: 87 },
    { month: 'Dec', percentage: 89 },
];

// Sample articles data
const articles = [
    { 
        title: 'The Power of Homeopathy in Treating Chronic Illnesses', 
        description: 'An in-depth look into how homeopathic remedies have transformed chronic care for patients.', 
        link: '#' 
    },
];

const DoctorProfile = () => {
    const { id } = useParams(); // Assuming you'll use this to fetch doctor-specific details later

    const patientReviews = [
        { name: 'Theron Trump', date: '2 days ago', rating: 4, review: 'Great service and care. Highly recommended!' },
        { name: 'John Doe', date: '5 days ago', rating: 5, review: 'Excellent attention to detail and patient care.' },
    ];

    return (
        <DoctorLayout>
            <div className="container mx-auto px-4 py-6">
                {/* Profile, Patients, and Reviews Section */}
                <div className="flex flex-col md:flex-row space-x-6 mb-6">
                    {/* Doctor Profile */}
                    <div className="flex bg-blue-100 p-4 rounded-lg w-full md:w-2/3 border-1 border-blue-100">
                        <img
                            className="rounded-full w-32 h-32"
                            src={doc}
                            alt="Doctor Jessika Linda"
                        />
                        <div className="ml-4">
                            <h2 className="text-xl font-bold text-blue-800">Dr. Jessika Linda</h2>
                            <p>LCEH, MD - Homeopathy</p>
                            <p>16 Years Experience Overall</p>
                            <p className="text-yellow-500 mt-2">⭐⭐⭐⭐⭐ 207 Reviews</p>
                        </div>
                    </div>

                    {/* Patients */}
                    <div className="bg-violet-200 p-4 rounded-lg shadow-md w-full md:w-1/6 text-center border-1 border-blue-100">
                        <img
                            src={Consultation}
                            alt="Patients"
                            className="w-18 h-20 mx-auto mb-2"
                        />
                        <p className="text-xl font-bold">3605</p>
                        <p>Patients</p>
                    </div>

                    {/* Reviews */}
                    <div className="bg-pink-100 p-4 rounded-lg shadow-md w-full md:w-1/6 text-center border-1 border-blue-100">
                        <img
                            src={downloadapp}
                            alt="Reviews"
                            className="w-18 h-20 mx-auto mb-2"
                        />
                        <p className="text-xl font-bold">2896</p>
                        <p>Reviews</p>
                    </div>
                </div>

                {/* Two-column layout for About/Reviews and Performance/Articles */}
                <div className="flex flex-col md:flex-row">
                    {/* Left Column - About and Reviews */}
                    <div className="w-full md:w-2/3 pr-0 md:pr-6 mb-6">
                        {/* About Section */}
                        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border-1 border-blue-100">
                            <h3 className="text-lg font-semibold">About</h3>
                            <p>
                                Dr. Jessika Linda is an experienced homeopathy doctor providing specialized online consultation services to patients worldwide. With over 16 years of experience in treating both chronic and acute conditions, she focuses on personalized homeopathic remedies tailored to the unique needs of each patient.
                                She has done a lot of research work and is always updating her knowledge by attending seminars and presenting her papers too. Her rapport with her patients is excellent.
                            </p>
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white p-4 rounded-lg shadow-md border-1 border-blue-100">
                            <h2 className="text-lg mb-4 text-gray-700">Patient Reviews</h2>
                            <hr className="border-gray-200 mb-4" />
                            {patientReviews.map((review, index) => (
                                <div key={index} className="flex items-start space-x-4 mb-4">
                                    <img src={profile} alt="Profile" className="w-12 h-12 rounded-full" />
                                    <div>
                                        <div className="font-medium text-gray-800">{review.name}</div>
                                        <div className="text-sm text-gray-500">{review.date}</div>
                                        <div className="flex">
                                            {[...Array(review.rating)].map((_, i) => (
                                                <FaStar key={i} className="text-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 mt-2">{review.review}</p>
                                    </div>
                                </div>
                            ))}
                            <button className="text-blue-600 hover:underline">See More Reviews</button>
                        </div>
                    </div>

                    {/* Right Column - Performance and Articles */}
                    <div className="w-full md:w-1/3">
                        {/* Articles Produced */}
                        <div className="bg-white p-4 rounded-lg shadow-md mb-6 border-1 border-blue-100">
                            <h3 className="text-lg font-semibold">Articles Produced</h3>
                            <ul className="mt-4 space-y-4">
                                {articles.map((article, index) => (
                                    <li key={index} className="border-b border-gray-200 pb-4">
                                        <h4 className="text-blue-700 font-semibold">{article.title}</h4>
                                        <p className="text-gray-600">{article.description}</p>
                                        <a href={article.link} className="text-blue-500 hover:underline">
                                            Read More
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Performance Chart */}
                        <div className="bg-white p-4 rounded-lg shadow-md border-1 border-blue-100">
                            <h3 className="text-lg font-semibold">Performance</h3>
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={performanceData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="percentage" stroke="#8884d8" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DoctorLayout>
    );
};

export default DoctorProfile;
