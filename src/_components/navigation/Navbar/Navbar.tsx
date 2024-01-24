import Link from 'next/link';
import './Navbar.css';

export default function Navbar() {
    return (
        <nav>
            <div className="left_nav">
                <Link href="#profile">
                    <b>Jeremy</b>
                </Link>
            </div>

            <div className="right_nav">
                <Link href="#about">
                    Over
                </Link>
                <Link href="#projects">
                    Projecten
                </Link>
                <Link href="#school">
                    School
                </Link>
                <Link href="#contact">
                    Contact
                </Link>
            </div>
        </nav>
    );
};