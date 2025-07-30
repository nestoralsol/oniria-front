import Navbar from '../components/Navbar';

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="p-4">{children}</main>
    </>
  );
}