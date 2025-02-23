// import Map from './components/map';

import Link from 'next/link';

export default function Home() {
  return (
    <>
      {/* <Map /> */}
      <div>
        <h1>Welcome to My Google Map Project</h1>
        <Link href="/map">Go to Map</Link>
      </div>
    </>
  );
}
