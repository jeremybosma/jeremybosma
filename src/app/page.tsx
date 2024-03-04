import Navbar from '../_components/navigation/Navbar/Navbar';
import Profile from '../_components/sections/Profile/Profile';
import About from '../_components/sections/About/About';
import Skillset from '../_components/sections/Skillset/Skillset';
import Projects from '../_components/sections/Projects/Projects';
import School from '../_components/sections/School/School';
import Socials from '../_components/sections/Socials/Socials';

export default function Home() {
  return (
    <main>
      {/* <Navbar /> */}
      <Profile />
      <About />
      {/* <Skillset /> */}
      <Projects />
      <School />
      <Socials />
    </main>
  );
}
