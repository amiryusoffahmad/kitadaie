'use client'

import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className='flex flex-col gap-8 justify-center items-center h-screen'>
      <div>testing</div>
      <Button onClick={() => window.location.href = '/home'}>Click Here</Button>
    </div>
  );
}
