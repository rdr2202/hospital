import React, { useState } from 'react';
import DoctorLayout from "/src/components/doctor components/DoctorLayout.jsx";
import Nocontent from '/src/assets/images/doctor images/Nocontent.jpg';
import PostPopup from '/src/pages/doctor pages/PostPopup.jsx'; // Import the new PostPopup component

const Content = () => {
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('Videos');
  const [isPostPopupOpen, setPostPopupOpen] = useState(false); // State for managing post popup visibility

  const uploadVideo = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploading(true);
      setTimeout(() => {
        const newVideo = {
          name: file.name,
          visibility: 'Public',
          restrictions: 'None',
          date: new Date().toLocaleDateString(),
          views: 0,
          comments: 0,
          likes: 0
        };
        setVideos([...videos, newVideo]);
        setUploading(false);
      }, 2000);
    }
  };

  const openPostPopup = () => {
    setPostPopupOpen(true);
  };

  const closePostPopup = () => {
    setPostPopupOpen(false);
  };

  return (
    <DoctorLayout>
      <div className="min-h-screen flex flex-col p-7">
        <h2 className="text-2xl font-bold mb-4">Channel content</h2>

        {/* Tab Navigation */}
        <div className="flex mb-4 border-b border-gray-300">
          <button
            className={`py-2 px-4 focus:outline-none ${activeTab === 'Videos' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Videos')}
          >
            Videos
          </button>
          <button
            className={`py-2 px-4 focus:outline-none ${activeTab === 'Posts' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab('Posts')}
          >
            Posts
          </button>
        </div>

        {/* Conditionally Render Based on Active Tab */}
        {activeTab === 'Videos' ? (
          <div className="flex-grow flex flex-col">
            {/* Video List Table */}
            <div className="w-full bg-white mb-4">
              <div className="flex text-sm font-medium bg-gray-100 text-grey-700 py-2 px-4">
                <div className="w-5/12">Video</div>
                <div className="w-2/12">Visibility</div>
                <div className="w-2/12">Restrictions</div>
                <div className="w-2/12">Date</div>
                <div className="w-2/12">Views</div>
                <div className="w-2/12">Comments</div>
                <div className="w-2/12">Likes</div>
              </div>

              {videos.length > 0 ? (
                videos.map((video, index) => (
                  <div key={index} className="flex text-sm border-t py-2 px-4">
                    <div className="w-5/12">{video.name}</div>
                    <div className="w-2/12">{video.visibility}</div>
                    <div className="w-2/12">{video.restrictions}</div>
                    <div className="w-2/12">{video.date}</div>
                    <div className="w-2/12">{video.views}</div>
                    <div className="w-2/12">{video.comments}</div>
                    <div className="w-2/12">{video.likes}</div>
                  </div>
                ))
              ) : (
                <div className="flex flex-grow flex-col items-center justify-end mb-8">
                  <img
                    src={Nocontent}
                    alt="No content"
                    className="w-24 h-24 mb-4"
                  />
                  <p className="text-gray-500">No content available</p>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="border-t border-gray-50 pt-4">
              <div className="flex justify-center items-center flex-col">
                <label
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded cursor-pointer"
                  htmlFor="video-upload"
                >
                  {uploading ? 'Uploading...' : 'Upload Video'}
                </label>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={uploadVideo}
                  className="hidden"
                  disabled={uploading}
                />
                {uploading && (
                  <p className="text-blue-500 mt-2">Uploading video...</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-end mb-8">
            <img
              src={Nocontent}
              alt="No content"
              className="w-24 h-24 mb-4"
            />
            <p className="text-gray-500">No content available</p>
            <button
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
              onClick={openPostPopup}
            >
              Add Post
            </button>
          </div>
        )}

        {/* Render the PostPopup component */}
        {isPostPopupOpen && <PostPopup onClose={closePostPopup} />}
      </div>
    </DoctorLayout>
  );
};

export default Content;
