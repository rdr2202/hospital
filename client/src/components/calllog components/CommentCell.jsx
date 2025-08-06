import React, { useState } from 'react';
import { FaPlus, FaEye, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const CommentCell = ({ patient, API_URL, onCommentAdded }) => {
  // console.log('Patient:', patient, onCommentAdded);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newComment, setNewComment] = useState('');

  const latestComment = patient.medicalDetails.comments && patient.medicalDetails.comments.length > 0 
    ? patient.medicalDetails.comments[patient.medicalDetails.comments.length - 1].text 
    : 'No comments';

    const handleAddComment = async () => {
      if (!newComment.trim()) return;
      try {
        const response = await axios.post(
          `${API_URL}/api/log/comments/${patient._id}`,
          { text: newComment }
        );
    
        if (response.data.success) {
          onCommentAdded(response.data.patient); // Pass the updated patient data to the parent component
          setNewComment(''); // Reset the comment input field
          setIsAddingComment(false); // Close the modal
        }
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    };
    

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-lg w-96 max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="truncate max-w-[150px]" title={latestComment}>
        {latestComment}
      </span>
      
      <div className="flex space-x-1">
        <button
          onClick={() => setIsAddingComment(true)}
          className="p-1 text-[#1a237e] hover:text-[#000051] transition-colors duration-300"
        >
          <FaPlus className="h-4 w-4" />
        </button>

        <button 
          onClick={() => setShowHistory(true)}
          className="p-1 text-[#1a237e] hover:text-[#000051] transition-colors duration-300"
        >
          <FaEye className="h-4 w-4" />
        </button>
      </div>

      <Modal 
        isOpen={isAddingComment} 
        onClose={() => setIsAddingComment(false)}
        title="Add Comment"
      >
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Enter your comment"
          className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-[#1a237e]"
          rows={3}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsAddingComment(false)}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleAddComment}
            className="px-4 py-2 text-white bg-[#1a237e] rounded hover:bg-[#000051] transition-colors duration-300"
          >
            Add Comment
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)}
        title="Comment History"
      >
        <div className="space-y-2">
          {patient.medicalDetails.comments && patient.medicalDetails.comments.map((comment, index) => (
            <div key={index} className="p-2 bg-gray-50 rounded">
              <p>{comment.text}</p>
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default CommentCell;