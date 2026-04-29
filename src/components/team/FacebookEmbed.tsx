import React, { useEffect, useState } from 'react';

interface FacebookEmbedProps {
    facebookUrl: string;
    accentColor: string;
}

export const FacebookEmbed: React.FC<FacebookEmbedProps> = ({ facebookUrl, accentColor }) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Load Facebook SDK
        if ((window as any).FB) {
            (window as any).FB.XFBML.parse();
        } else {
            const script = document.createElement('script');
            script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
            script.async = true;
            script.defer = true;
            script.crossOrigin = 'anonymous';
            document.body.appendChild(script);
        }
    }, [facebookUrl]);

    if (!isMounted) return null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[32px] overflow-hidden border-2" style={{ borderColor: accentColor }}>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center space-x-2">
                    <span className="text-blue-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                        </svg>
                    </span>
                    <span>Team Social Feed</span>
                </h4>
            </div>
            
            <div className="w-full flex justify-center p-4 min-h-[400px]">
                <div 
                    className="fb-page" 
                    data-href={facebookUrl} 
                    data-tabs="timeline" 
                    data-width="500" 
                    data-height="600" 
                    data-small-header="false" 
                    data-adapt-container-width="true" 
                    data-hide-cover="false" 
                    data-show-facepile="true"
                >
                    <blockquote cite={facebookUrl} className="fb-xfbml-parse-ignore">
                        <a href={facebookUrl}>Loading Facebook Feed...</a>
                    </blockquote>
                </div>
            </div>
        </div>
    );
};
