import Profile from '@/_components/sections/profile/Profile';
import About from '@/_components/sections/about/About';
import Projects from '@/_components/sections/projects/Projects';
import School from '@/_components/sections/school/School';
import Socials from '@/_components/sections/contact/Contact';

export default function Home() {
  return (
    <main>
      <Profile />
      <About />
      <Projects />
      <School />
      <Socials />
      <br />
    </main>
  );
}
