import React, { useState } from 'react';

const MCQBlock = ({ question, options, answer, explanation }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleOptionClick = (option) => {
    if (!isSubmitted) {
      setSelectedOption(option);
    }
  };

  const checkAnswer = () => {
    if (selectedOption) {
      setIsSubmitted(true);
    }
  };

  // Prevent crashes if the AI output is slightly malformed
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="bg-white border text-left border-slate-200 shadow-sm rounded-xl p-6 my-8 transition-all hover:shadow-md">
      <div className="flex items-start gap-4 mb-5">
        <div className="bg-blue-100 text-blue-700 font-bold p-2 px-3 rounded-lg text-sm uppercase tracking-wide shrink-0">
          Question
        </div>
        <h3 className="text-xl font-semibold text-slate-800 pt-1">{question}</h3>
      </div>
      
      <div className="space-y-3 mb-6 pl-2">
        {safeOptions.map((option, index) => {
          let buttonClass = "w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ";
          
          if (!isSubmitted) {
            buttonClass += selectedOption === option 
              ? "border-blue-500 bg-blue-50/50 text-blue-800 shadow-sm" 
              : "border-slate-200 hover:border-blue-300 hover:bg-slate-50 text-slate-700";
          } else {
            if (option === answer) {
              buttonClass += "border-green-500 bg-green-50 text-green-800 font-medium z-10 shadow-sm";
            } else if (option === selectedOption && option !== answer) {
              buttonClass += "border-red-400 bg-red-50 text-red-800";
            } else {
              buttonClass += "border-slate-100 bg-slate-50 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleOptionClick(option)}
              disabled={isSubmitted}
              className={buttonClass}
            >
              <div className="flex items-center gap-4">
                <span className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors
                  ${isSubmitted && option === answer ? 'border-green-500 bg-green-500 text-white' : 
                    isSubmitted && option === selectedOption ? 'border-red-400 bg-red-400 text-white' :
                    selectedOption === option ? 'border-blue-500 text-blue-600' : 'border-slate-300 text-slate-500'}`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-base">{option}</span>
                
                {/* Result Icons */}
                {isSubmitted && option === answer && (
                  <svg className="w-6 h-6 ml-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                )}
                {isSubmitted && option === selectedOption && option !== answer && (
                  <svg className="w-6 h-6 ml-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!isSubmitted ? (
        <div className="flex justify-end mt-2">
          <button
            onClick={checkAnswer}
            disabled={!selectedOption}
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-sm ${
              selectedOption 
                ? "bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5 text-white active:translate-y-0" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            Check Answer
          </button>
        </div>
      ) : (
        <div className={`p-5 rounded-xl mt-6 border animate-in slide-in-from-bottom-2 fade-in duration-300 ${selectedOption === answer ? "bg-green-50/50 border-green-200" : "bg-orange-50/50 border-orange-200"}`}>
          <div className="flex items-center gap-2 mb-3">
            {selectedOption === answer ? (
              <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Correct</span>
            ) : (
              <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Incorrect</span>
            )}
            <h4 className="font-bold text-slate-800">Explanation</h4>
          </div>
          <p className="text-slate-700 leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
};

export default MCQBlock;