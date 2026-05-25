import './globals.css';
import AtlasShellLayout from '../components/atlas/AtlasShellLayout';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <AtlasShellLayout>{children}</AtlasShellLayout>;
}
