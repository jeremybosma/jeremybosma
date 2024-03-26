import Link from 'next/link';
import Image from 'next/image';

interface CardProps {
    name: string;
    icon?: string;
    href: string;
}

export default function SocialMedia({ name, icon, href }: CardProps) {
    return (
        <Link href={href ?? '#'} target={href ? '_blank' : undefined}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '20px', textDecoration: 'underline'}}>
                {icon && (
                    <div className='icon'>
                        <Image
                            src={icon}
                            width={17}
                            height={17}
                            alt='Social Media Icon'
                        />
                    </div>
                )}
                <h1>{name}</h1>
            </div>
        </Link>
    );
};