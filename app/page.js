"use client";

import Link from "next/link";
import AuthForm from "./components/AuthForm";



export default function Home() {
  return (
    <>
<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
  <AuthForm mode="login"/>
  

</div>

 

    </>
  );
}

