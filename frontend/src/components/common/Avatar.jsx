import React, { useState } from 'react';

const Avatar = ({ profileImage, name, className, alt = "Profile" }) => {
    const [imageError, setImageError] = useState(false);

    const initial = name ? name.charAt(0).toUpperCase() : '?';

    // Apply the same className to the fallback div, but add flex classes for centering the text.
    // Assuming the className includes width/height and border-radius.
    const fallbackClassName = `${className} flex items-center justify-center bg-indigo-600 text-white font-bold uppercase shadow-inner`;

    // If profileImage is explicitly "undefined" as a string or actually falsy
    const isImageMissing = !profileImage || profileImage === 'undefined';

    if (isImageMissing || imageError) {
        return (
            <div className={fallbackClassName}>
                {initial}
            </div>
        );
    }

    return (
        <img 
            src={profileImage.startsWith('http') ? profileImage : `/${profileImage}`}
            alt={alt}
            className={className}
            onError={() => setImageError(true)}
        />
    );
};

export default Avatar;
