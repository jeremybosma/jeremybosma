"use client";

import { useState } from 'react';
import Image from 'next/image';
import { FaGithub } from "react-icons/fa6";
import { SiKofi } from "react-icons/si";
import './Profile.css';

export default function Profile() {
    const [isImageClicked, setIsImageClicked] = useState(false);

    const handleImageClick = () => {
        setIsImageClicked(!isImageClicked);
        const pfpElement = document.querySelector('.pfp') as HTMLElement;
        const blurElement = document.querySelector('.blur') as HTMLElement;
        const hiddenPfp = document.querySelector('.hide') as HTMLElement;

        if (pfpElement) {
            pfpElement.style.width = isImageClicked ? '140px' : '210px';
            pfpElement.style.height = isImageClicked ? '140px' : '210px';
            pfpElement.style.position = isImageClicked ? 'static' : 'fixed';
            pfpElement.style.top = isImageClicked ? 'auto' : '50%';
            pfpElement.style.left = isImageClicked ? 'auto' : '50%';
            pfpElement.style.transform = isImageClicked ? 'none' : 'translate(-50%, -50%)';
            pfpElement.style.transition = isImageClicked ? 'none' : '0.1s ease-in-out';
            document.body.style.overflow = isImageClicked ? 'auto' : 'hidden';
            blurElement.style.display = isImageClicked ? 'none' : 'flex';
            hiddenPfp.style.display = isImageClicked ? 'none' : 'flex';
        }
    };

    const birthdate = new Date(2007, 11, 2);
    const today = new Date();
    const age = Math.floor((today.getTime() - birthdate.getTime()) / (1000 * 60 * 60 * 24 * 365));

    return (
        <div className="profile" id='profile'>
            <div className="blur" onClick={handleImageClick} />
            <Image
                src="/images/pfp.jpg"
                alt="Profile picture"
                className={`pfp ${isImageClicked ? 'expanded' : ''}`}
                width={100}
                height={100}
                onClick={handleImageClick}
            />
            <Image
                src="/images/pfp.jpg"
                alt="Profile picture"
                className={`pfp hide ${isImageClicked ? 'expanded' : ''}`}
                width={100}
                height={100}
                onClick={handleImageClick}
            />

            <div className="cta">
                <h1 className='title'>Jeremy Bosma</h1>
                <p>{age || "16"} jarige in software, design en startups.</p>
                <div className="buttonRow">
                    <a className='button' href='#contact'>Contact</a>
                    <a className='button' href='https://github.com/jeremybosma' target='_blank'><FaGithub /></a>
                    <a className='button' href='https://ko-fi.com/jecta' target='_blank'><SiKofi /></a>
                </div>
            </div>
        </div>
    );
};