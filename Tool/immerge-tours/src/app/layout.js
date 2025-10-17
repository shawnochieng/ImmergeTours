import "./globals.css";
import {ToastContainer} from "react-toastify";


export const metadata = {
  title: "Pano-Tours",
  description: "Generate realistic tours",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={'h-full w-full'}>
    <head>
        <script src="PannellumFiles/pannellum.js"></script>
        <link rel="stylesheet" href="PannellumFiles/pannellum.css"/>
    </head>
      <body
        className={'w-full h-full'}
      >
      <ToastContainer />
        {children}
      </body>
    </html>
  );
}
