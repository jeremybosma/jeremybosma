import Image from 'next/image';
import { FaGithub } from "react-icons/fa6";
import './Profile.css';

const birthdate = new Date(2007, 11, 2);

export default function Profile() {
    const today = new Date();
    const age = Math.floor((today.getTime() - birthdate.getTime()) / (1000 * 60 * 60 * 24 * 365));

    return (
        <div className="profile" id='profile'>
            <Image
                src="/images/pfp.jpg"
                alt="Profile picture"
                className={`pfp`}
                width={100}
                height={100}
            />

            <div className="cta">
                <h1 className='title'>Jeremy Bosma</h1>
                <p>{`${age} jarige in software, design en startups.`}</p>
                <div className="buttonRow">
                    <a className='button' href='#contact'>Contact</a>
                    <a className='button' href='https://github.com/jeremybosma' target='_blank' rel="noopener noreferrer"><FaGithub /></a>
                </div>
            </div>
        </div>
    );
};