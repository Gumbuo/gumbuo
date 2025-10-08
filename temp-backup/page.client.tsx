import dynamic from "next/dynamic";

// Dynamically import the wallet UI wrapper to avoid server-side rendering issues
const ClientPageWrapper = dynamic(() => import("./ClientPageWrapper"), {
  ssr: false,
});

export default function Page() {
  return <ClientPageWrapper />;
}

