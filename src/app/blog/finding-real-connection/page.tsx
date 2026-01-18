import Link from 'next/link';
import Image from 'next/image';

export default function FindingRealConnection() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FFA6A6]">
            <nav className="border-b-2 border-black bg-white p-4 flex justify-between items-center">
                <Link href="/" className="font-black text-2xl flex items-center gap-2">
                    <div className="relative w-8 h-8">
                        <Image src="/logo2.png" alt="Logo" fill className="object-contain" />
                    </div>
                    <span>BLINDCHARM</span>
                </Link>
                <Link href="/" className="font-bold hover:underline">Back to Home</Link>
            </nav>

            <main className="max-w-3xl mx-auto py-20 px-4">
                <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                    The Puzzle of Finding <span className="text-[#FFA6A6]">Real Connection</span>
                </h1>

                <div className="w-full h-80 relative mb-10 border-2 border-black shadow-[8px_8px_0px_0px_#000] bg-[#FFCDD2] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 relative">
                            <Image src="/HeroAvatar/a12.svg" alt="Illustration" fill className="object-contain" />
                        </div>
                    </div>
                </div>

                <div className="prose prose-lg prose-black max-w-none font-medium text-gray-800">
                    <p className="mb-6">
                        Modern dating often feels like trying to fit piece into a puzzle without seeing the full picture. You have a photo here, a bio there, but no sense of the whole person.
                    </p>
                    <p className="mb-6">
                        Real connection isn't about finding someone who fits 100% of your checklist. It's about finding someone whose jagged edges fit with yours.
                    </p>
                    <h3 className="text-2xl font-black mb-4">The Missing Piece: Vibe</h3>
                    <p className="mb-6">
                        The "vibe" is that intangible quality—a mix of humor, voice, timing, and values—that algorithms struggle to quantify but humans feel instantly.
                    </p>
                    <p>
                        BlindCharm is built to prioritize this missing piece. By hearing someone's voice and seeing their personality before their filtered selfies, you solve the puzzle of connection much faster.
                    </p>
                </div>
            </main>
        </div>
    );
}
