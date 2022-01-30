import React, { useRef, useState } from "react";
export default function AudioPlayer(props) {
  const audioPlayer = useRef();
  const [currentTime, setCurrentTime] = useState(0);
  const [seekValue, setSeekValue] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const play = () => {
    audioPlayer.current.play();
    setIsPlaying(true);
  };
  const pause = () => {
    audioPlayer.current.pause();
    setIsPlaying(false);
  };
  const onPlaying = () => {
    setCurrentTime(audioPlayer.current.currentTime);
    setSeekValue(
      (audioPlayer.current.currentTime / audioPlayer.current.duration) * 100
    );
  };

  const secondsToString = (seconds) => {
    if (seconds) {
      var date = new Date(0);
      date.setSeconds(seconds);
      return date.toISOString().substring(11, 19);
    }

    return "00:00:00";
  };

  return (
    <div className="w-full">
      <audio src={props.audioUrl} ref={audioPlayer} onTimeUpdate={onPlaying}>
        Your browser does not support the
        <code>audio</code> element.
      </audio>
      <input
        className="w-full h-3 bg-gray-400 appearance-none"
        type="range"
        min="0"
        max="100"
        step="1"
        value={seekValue}
        onChange={(e) => {
          const seekto = audioPlayer.current.duration * (+e.target.value / 100);
          audioPlayer.current.currentTime = seekto;
          setSeekValue(e.target.value);
        }}
      />
      <div className="flex items-center justify-between w-full pt-1">
        {!isPlaying ? (
          <button onClick={play}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-gray-700 hover:text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <button onClick={pause}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-[#B7E800] hover:text-[#87e800]"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
        <div className="text-xs">{`${secondsToString(
          currentTime
        )} / ${secondsToString(audioPlayer.current?.duration)}`}</div>
      </div>
    </div>
  );
}
