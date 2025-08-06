import React, { useState } from 'react';

const PostPopup = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [visibility, setVisibility] = useState('Public');
  const [restrictions, setRestrictions] = useState('None');
  const [postContent, setPostContent] = useState('');
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [image, setImage] = useState(null);
  const [imagePoll, setImagePoll] = useState(null);

  const handleImageUpload = (event) => {
    setImage(event.target.files[0]);
  };

  const handleImagePollUpload = (event) => {
    setImagePoll(event.target.files[0]);
  };

  const handleSubmit = () => {
    // Handle form submission here
    console.log({
      username,
      visibility,
      restrictions,
      postContent,
      likes,
      comments,
      image,
      imagePoll
    });
    onClose(); // Close the popup after submission
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create Post</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="Public">Public</option>
            <option value="Private">Private</option>
            <option value="Restricted">Restricted</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Restrictions</label>
          <select
            value={restrictions}
            onChange={(e) => setRestrictions(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
          >
            <option value="None">None</option>
            <option value="Age Restriction">Age Restriction</option>
            <option value="Geographic Restriction">Geographic Restriction</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-">Write Anything Here</label>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            rows="4"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Likes</label>
          <input
            type="number"
            value={likes}
            onChange={(e) => setLikes(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            min="0"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Comments</label>
          <input
            type="number"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
            min="0"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Upload Image Poll</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImagePollUpload}
            className="mt-1 block w-full"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            Create Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostPopup;
