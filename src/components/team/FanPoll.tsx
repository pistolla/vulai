import React, { useState, useEffect } from 'react';
import { FiBarChart2 } from 'react-icons/fi';

interface FanPollProps {
    question: string;
    options: Array<{ id: string; label: string; votes: number }>;
    onVote: (optionId: string) => void;
    userVote?: string;
    accentColor: string;
}

export const FanPoll: React.FC<FanPollProps> = ({
    question,
    options,
    onVote,
    userVote,
    accentColor
}) => {
    const [selectedOption, setSelectedOption] = useState<string | undefined>(userVote);
    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);

    const handleVote = (optionId: string) => {
        if (!selectedOption) {
            setSelectedOption(optionId);
            onVote(optionId);
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 border-2" style={{ borderColor: accentColor }}>
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600">
                    <FiBarChart2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Fan Poll</h3>
            </div>

            {/* Question */}
            <p className="text-white font-bold mb-6">{question}</p>

            {/* Options */}
            <div className="space-y-3">
                {options.map(option => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    const isSelected = selectedOption === option.id;
                    const hasVoted = !!selectedOption;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleVote(option.id)}
                            disabled={hasVoted}
                            className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-300 ${hasVoted
                                    ? 'cursor-default'
                                    : 'cursor-pointer hover:scale-[1.02] hover:border-white'
                                } ${isSelected
                                    ? 'border-white bg-white/10'
                                    : 'border-gray-700 bg-gray-800/30'
                                }`}
                        >
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-white">{option.label}</span>
                                {hasVoted && (
                                    <span className="text-sm font-black" style={{ color: accentColor }}>
                                        {percentage.toFixed(1)}%
                                    </span>
                                )}
                            </div>

                            {/* Progress Bar (shown after voting) */}
                            {hasVoted && (
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full transition-all duration-1000 ease-out"
                                        style={{
                                            width: `${percentage}%`,
                                            background: isSelected
                                                ? `linear-gradient(90deg, ${accentColor}, ${accentColor}dd)`
                                                : 'rgba(255,255,255,0.2)'
                                        }}
                                    />
                                </div>
                            )}

                            {/* Vote Count */}
                            {hasVoted && (
                                <div className="mt-2 text-xs font-bold text-gray-400">
                                    {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Total Votes */}
            {selectedOption && (
                <div className="mt-4 pt-4 border-t border-gray-800 text-center">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                        Total Votes: <span className="text-white">{totalVotes}</span>
                    </span>
                </div>
            )}
        </div>
    );
};
