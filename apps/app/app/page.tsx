import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.svg"
            alt="Blaze logo"
            width={80}
            height={80}
            priority
          />
          <h1 className="text-4xl sm:text-5xl font-bold text-center">
            The Gateway to DeFi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-center text-lg">
            Blaze is the only trading platform you'll ever need.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-8 sm:px-10 sm:w-auto"
            href="/pulse"
          >
            Start Trading
          </Link>
        </div>
      </main>
    </div>
  );
}
