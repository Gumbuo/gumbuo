import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html>
      <Head />
      <body className="m-0 p-0 overflow-hidden bg-black">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="fixed top-0 left-0 w-full h-full object-cover z-[-1]"
        >
          <source src="/alien.mp4" type="video/mp4" />
        </video>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
