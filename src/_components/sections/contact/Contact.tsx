import '../projects/Projects.css';
import SocialMedia from '../../ui/SocialMedia';

export default function Contact() {
    const socialMediaData = [
        { name: 'mailto:prive@jeremybosma.nl', icon: '/images/icons/link.png', href: 'mailto:prive@jeremybosma.nl' },
        { name: 'github.com/jeremybosma', icon: '/images/icons/link.png', href: 'https://github.com/jeremybosma' },
        { name: 'x.com/jeremybosma_', icon: '/images/icons/link.png', href: 'https://x.com/jeremybosma_' },
        { name: 'instagram.com/jeremybosma_', icon: '/images/icons/link.png', href: 'https://instagram.com/jeremybosma_' },
        { name: 'ko-fi.com/jeremybosma', icon: '/images/icons/link.png', href: 'https://ko-fi.com/jeremybosma' }
    ];

    return (
        <div className='titlediv'>
            <h1 className='title'>Contact</h1>
            <section className="projects" id='contact'>
                {socialMediaData.map((data, index) => (
                    <SocialMedia key={index} {...data} />
                ))}
            </section>
        </div>
    );
}