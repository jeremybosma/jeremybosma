import '.././Projects/Projects.css';
import ProjectCard from '.././Projects/projectcard/ProjectCard';

export default function Socials() {
    return (
        <div className='titlediv'>
            <h1 className='title'>Contact & Socials</h1>
            <section className="projects" id='contact'>
                <ProjectCard name='Jecta2' backgroundColor='#000' icon='/images/x.png' href='https://x.com/jecta2' />
                <ProjectCard name='Jecta' backgroundColor='#333' icon='/images/github.png' href='https://github.com/jeremybosma' />
                <ProjectCard name='jeremybosma_' backgroundColor='#bc2a8d' icon='/images/instagram.png' href='https://instagram.com/jeremybosma_' />
                <ProjectCard name='Jecta' backgroundColor='#5865F2' icon='/images/discord.png' href='https://discord.com/channels/@me/709441303351394314/' />
                <ProjectCard name='Jecta' backgroundColor='#11C3FF' icon='/images/kofi.png' href='https://ko-fi.com/jecta' />
            </section>
        </div>
    );
};