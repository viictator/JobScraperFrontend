import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LiquidButton } from "@/components/ui/shadcn-io/liquid-button";

const BACKGROUND_IMAGE_SRC = '/bg.png';

const Page = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">

      {/* Background image */}
      <Image
        src={BACKGROUND_IMAGE_SRC}
        alt="Background"
        fill
        className="object-cover opacity-15"
        priority
      />

      {/* Content */}
      <div className="flex flex-col items-center z-20">
        <h1 className="text-6xl font-black">JobGen</h1>
        <h2 className="text-3xl">Generate tailored job applications instantly</h2>
        <h3 className="text-lg">Input your details once — we do the rest.</h3>

        {/* Buttons */}
        <div className="flex items-center mt-4 w-64 justify-around">

          <Link href="/register" passHref>
            <LiquidButton className="text-xl py-3 px-6 border-2 rounded-full hover:scale-105 transition-transform duration-400
            ">
              Sign up
            </LiquidButton>
          </Link>

          <Link href="/login" passHref>
            <LiquidButton className="text-xl py-3 px-6 font-bold rounded-full hover:scale-105 transition-transform duration-400">
              Log in
            </LiquidButton>
          </Link>

        </div>
      </div>

    </div>
  );
};

export default Page;
