import React from 'react';
import Image from 'next/image';
type Props = {};

function Header({}: Props) {
  return (
    <div className='lg:w-2/3 gap-5 flex flex-col lg:flex-row items-center justify-center'>
      <Image src="/ytlogo.svg" alt="logo" width={100} height={100} className='min-w-50' />
      <h1 className="text-5xl text-center text-gray-800 font-bold">
        Youtube Downloader
      </h1>
    </div>
  );
}

export default Header;
