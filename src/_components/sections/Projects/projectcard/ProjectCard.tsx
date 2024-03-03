import Link from 'next/link';
import Image from 'next/image';

interface CardProps {
    backgroundColor?: string;
    name: string;
    desc?: string;
    icon?: string;
    href?: string;
}

export default function ProjectCard({ backgroundColor, name, desc, icon, href }: CardProps) {
    return (
        <Link href={href ?? '#'} target='_blank'>
            <div className="projectcard" style={{ background: backgroundColor ?? "var(--secondary-surface)" }}>
                {icon && (
                    <div className='icon'>
                        <Image
                            src={icon}
                            width={40}
                            height={40}
                            alt='Project Icon'
                            className='projectIcon'
                        />
                    </div>
                )}
                <div className='right_side'>
                    <h1>{name}</h1>
                    {desc && (
                        <p>{desc}</p>
                    )}
                </div>
            </div>
        </Link>
    );
};