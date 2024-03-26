import './Projects.css';
import ProjectCard from '../../ui/ProjectCard';

const Projects = () => {
    const projects = [
        {
            name: 'outfits.bio',
            desc: 'Een platform om je kleding te delen en vinden.',
            icon: '/images/projects/outfitsbio.png',
            href: 'https://outfits.bio',
            backgroundColor: '#EC6D2D',
        },
        {
            name: 'vessels.pro',
            desc: 'Vessels.pro is een modern platform voor vlootbeheer.',
            icon: '/images/projects/vesselspro.png',
            href: 'https://vessels.pro',
            backgroundColor: '#121212',
        },
        {
            name: 'Mythic',
            desc: 'De beste manier om Windows-games op de Mac te spelen.',
            icon: '/images/projects/mythic.png',
            href: 'https://getmythic.app',
            backgroundColor: '#8443C6',
        },
    ];

    return (
        <>
            <h1 className='title'>Projecten</h1>
            <section className="projects">
                {projects.map((project, index) => (
                    <ProjectCard
                        key={index}
                        name={project.name}
                        desc={project.desc}
                        icon={project.icon}
                        href={project.href}
                        backgroundColor={project.backgroundColor}
                    />
                ))}
            </section>

            <details>
                <summary className='title'>School Opdrachten</summary><br />
                <section className="projects">
                    <ProjectCard name='Vier op een rij (Webgame)' backgroundColor='#A64D23' href='https://webgame.jeremybosma.nl' />
                    <ProjectCard name='Seriousapps Project' backgroundColor='#A745D3' href='https://seriousapps-project.vercel.app' />
                    <ProjectCard name='Rekenapp in PHP' backgroundColor='#A7C7E7' href='https://rekenapp.jeremybosma.nl' />
                    <ProjectCard name='Irritante Webpage' backgroundColor='#FAA0A0' href='https://irritante-webpage.jeremybosma.nl/' />
                    <ProjectCard name='Portfolio mockups in Figma' backgroundColor='#222222' href='https://www.figma.com/proto/deejQtKzKBApU6uIYjmVX4/02_did%2Fwsh-portfolio-1.0?page-id=0%3A1&type=design&node-id=1-3&viewport=557%2C445%2C0.22&t=8chiAav0CLI1frG3-1&scaling=min-zoom&starting-point-node-id=1%3A3&mode=design' />
                </section>
            </details>
        </>
    );
};

export default Projects;