import React from "react";
import { GoBell } from "react-icons/go";
import { BiMessageRoundedDetail } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import profile from "../assets/images/profile.jpg";

const Header = () => {
  const navigate = useNavigate();

  const handleNotify = () => {
    navigate("/notification");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const name = "Rita";

  return (
    <div className="flex justify-between items-center px-5 py-10 ml-2 mr-2 mt-2 h-16 bg-blue-200 shadow-lg rounded-md">
      <div>
        <h1 className="text-md font-bold text-gray-700">WELCOME BACK!</h1>
        <p className="text-xl font-bold text-gray-800">{name}</p>
      </div>
      <div className="flex items-center space-x-5">
        <button className="">
          <BiMessageRoundedDetail size={30} />
        </button>
        <button
          className="relative text-2xl text-blue-950"
          onClick={handleNotify}
        >
          <GoBell size={26} />
          <span className="absolute top-0 right-0 -mt-1 -mr-1 flex justify-center items-center bg-white text-gray-700 font-semibold text-sm w-4 h-4 rounded-full border-2 border-blue-900">
            4
          </span>
        </button>
        <button onClick={handleProfile}>
          <img
            className="w-8 h-8 rounded-full border-2 border-blue-900"
            src={profile}
            alt="Profile"
          />
        </button>
      </div>
    </div>
  );
};

export default Header;
