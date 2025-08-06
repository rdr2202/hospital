import React, { useState, useRef, useEffect } from 'react';
import { FaRecordVinyl, FaTimes, FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import axios from 'axios';
import config from '../../config';
const API_URL = config.API_URL;
const AudioPlayer = ({ audioUrl, recordingDate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleBuffering = () => {
      if (audio.buffered.length > 0) {
        setBuffered(audio.buffered.end(audio.buffered.length - 1));
      }
    };

    // Add event listeners
    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('progress', handleBuffering);
    audio.addEventListener('waiting', handleBuffering);

    return () => {
      // Cleanup event listeners
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('progress', handleBuffering);
      audio.removeEventListener('waiting', handleBuffering);
    };
  }, []);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    audioRef.current.muted = !isMuted;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const handleProgressClick = (e) => {
    const progressBar = progressBarRef.current;
    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const newTime = clickPosition * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <div className="mb-2 text-sm text-gray-600">
        {new Date(recordingDate).toLocaleString()}
      </div>
      
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="space-y-2">
        {/* Progress Bar */}
        <div 
          ref={progressBarRef}
          className="relative h-2 bg-gray-200 rounded cursor-pointer"
          onClick={handleProgressClick}
        >
          {/* Buffered Progress */}
          <div 
            className="absolute h-full bg-gray-300 rounded"
            style={{ width: `${(buffered / duration) * 100}%` }}
          />
          {/* Current Progress */}
          <div 
            className="absolute h-full bg-blue-500 rounded"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
          {/* Seek Handle */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow"
            style={{ left: `calc(${(currentTime / duration) * 100}% - 6px)` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
            </button>

            {/* Time Display */}
            <div className="text-sm font-mono">
              <span>{formatTime(currentTime)}</span>
              <span className="mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const RecordingsButton = ({ patient }) => {
  const [showModal, setShowModal] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(false);

  const viewRecordings = async () => {
    setLoading(true);
    setShowModal(true);
    try {
      const response = await axios.get(`${API_URL}/api/recordings/${patient.phone}`);
      setRecordings(response.data);
    } catch (error) {
      console.error("Error fetching recordings:", error);
    } finally {
      setLoading(false);
    }
  };

  const Modal = ({ onClose }) => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Call Recordings for {patient.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : recordings.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No recordings found for this patient.</p>
          ) : (
            <div className="space-y-4">
              {recordings.map((recording) => (
                <AudioPlayer
                  key={recording.sid}
                  audioUrl={`${recording.url}.mp3`}
                  recordingDate={recording.dateCreated}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        onClick={viewRecordings}
        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-[#1a237e] hover:bg-[#000051] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#534bae] transition-all duration-300"
      >
        <FaRecordVinyl className="mr-2 -ml-0.5 h-4 w-4" /> View Recordings
      </button>
      <Modal onClose={() => setShowModal(false)} />
    </>
  );
};

export default RecordingsButton;