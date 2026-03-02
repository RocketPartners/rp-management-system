import React from 'react';
import { Play, Clock } from 'lucide-react';

export default function VideoPlaceholder({
    title,
    duration = '3:45',
    thumbnailText = 'Interactive Demo',
}) {
    return (
        <div className="w-full rounded-xl overflow-hidden bg-gray-900 aspect-video relative group cursor-pointer">
            {/* Thumbnail Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center">
                <div className="text-center text-white">
                    <h3 className="text-4xl font-bold mb-2">{thumbnailText}</h3>
                    <p className="text-gray-300">{title}</p>
                </div>
            </div>

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                    <Play className="w-10 h-10 text-blue-600 ml-1" fill="currentColor" />
                </div>
            </div>

            {/* Duration Badge */}
            {duration && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 px-3 py-1 rounded-lg flex items-center">
                    <Clock className="w-4 h-4 text-white mr-1" />
                    <span className="text-sm text-white font-medium">{duration}</span>
                </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all" />
        </div>
    );
}
