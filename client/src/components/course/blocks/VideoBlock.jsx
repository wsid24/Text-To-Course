import React, { useState, useEffect } from 'react';

const VideoBlock = ({ query }) => {
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        // Calls the backend endpoint to get youtube video details
        const response = await fetch(`/api/youtube?query=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch video');
        }
        
        const data = await response.json();
        
        if (data.videoId) {
          setVideoId(data.videoId);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching video for query:', query, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchVideo();
    }
  }, [query]);

  if (loading) {
    return (
      <div className="animate-pulse bg-slate-200 w-full aspect-video rounded-xl flex flex-col items-center justify-center text-slate-500 my-6 shadow-sm">
        <svg className="w-12 h-12 mb-4 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
        </svg>
        <span>Searching for relevant video...</span>
      </div>
    );
  }

  if (error || !videoId) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg my-6 flex items-center border border-red-200 shadow-sm">
        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        Failed to load video for topic: <span className="font-semibold ml-1">{query}</span>
      </div>
    );
  }

  return (
    <div className="w-full my-8 bg-black rounded-xl overflow-hidden shadow-lg border border-gray-200">
      <div className="aspect-w-16 aspect-h-9 relative" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={`YouTube video: ${query}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        ></iframe>
      </div>
    </div>
  );
};

export default VideoBlock;