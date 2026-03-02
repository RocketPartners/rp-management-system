import React from 'react';
import { Image } from 'lucide-react';

export default function ScreenshotPlaceholder({
    title,
    dimensions = '1200x800',
    aspectRatio = 'video', // 'video' (16:9), 'square', 'wide' (21:9)
}) {
    const aspectClasses = {
        video: 'aspect-video',
        square: 'aspect-square',
        wide: 'aspect-[21/9]',
    };

    return (
        <div
            className={`
                ${aspectClasses[aspectRatio] || aspectClasses.video}
                w-full rounded-xl border-2 border-dashed border-gray-300
                bg-gray-50 flex flex-col items-center justify-center
                hover:border-gray-400 hover:bg-gray-100 transition-colors
            `}
        >
            <Image className="w-16 h-16 text-gray-400 mb-4" />
            <div className="text-center px-4">
                <p className="text-sm font-medium text-gray-700">{title}</p>
                <p className="text-xs text-gray-500 mt-1">{dimensions}</p>
            </div>
        </div>
    );
}
