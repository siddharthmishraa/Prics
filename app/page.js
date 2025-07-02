"use client";
import dynamic from "next/dynamic";

const MainContent = dynamic(() => import("./maincontent"), {
  ssr: false, // Disable server-side rendering
});

export default function Home() {
  return <MainContent />;
}
