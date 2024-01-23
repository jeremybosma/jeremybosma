import Navbar from '../_components/navigation/Navbar/Navbar';
import Profile from '../_components/ui/Profile/Profile';
import About from '../_components/ui/About/About';
import Skillset from '../_components/ui/Skillset/Skillset';
import Projects from '../_components/ui/Projects/Projects';

export default function Home() {
  return (
    <main>
      <Navbar />
      <Profile />
      <About />
      {/* <Skillset /> */}
      <Projects />
      <br />
    </main>
  );
}
