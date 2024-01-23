"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FaGithub } from "react-icons/fa6";
import './Profile.css';

export default function Profile() {
    const [isImageClicked, setIsImageClicked] = useState(false);

    const handleImageClick = () => {
        setIsImageClicked(!isImageClicked);
        const pfpElement = document.querySelector('.pfp') as HTMLElement;
        if (pfpElement) {
            pfpElement.style.width = isImageClicked ? '140px' : '210px';
            pfpElement.style.height = isImageClicked ? '140px' : '210px';
            pfpElement.style.position = isImageClicked ? 'static' : 'fixed';
            pfpElement.style.top = isImageClicked ? 'auto' : '50%';
            pfpElement.style.left = isImageClicked ? 'auto' : '50%';
            pfpElement.style.transform = isImageClicked ? 'none' : 'translate(-50%, -50%)';
        }
    };

    return (
        <div className="profile">
            <Image
                src="/images/pfp.jpg"
                alt="Profile picture"
                className={`pfp ${isImageClicked ? 'expanded' : ''}`}
                width={100}
                height={100}
                onClick={handleImageClick}
            />

            <div className="cta">
                <h1 className='title'>Jeremy Bosma</h1>
                <p>16 jarige in software, design en startups.</p>
                <div className="buttonRow">
                    <button>Contact</button>
                    <button><FaGithub /></button>
                </div>
            </div>
        </div>
    );
};