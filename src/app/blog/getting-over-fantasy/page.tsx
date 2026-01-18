import Link from 'next/link';
import Image from 'next/image';

export default function GettingOverFantasy() {
    return (
        <div className="min-h-screen bg-white text-black font-sans selection:bg-[#FFA6A6]">
            {/* Simple Nav */}
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
                    Getting Over the <span className="text-[#FFA6A6]">Fantasy</span> of Dating Someone
                </h1>

                <div className="w-full h-80 relative mb-10 border-2 border-black shadow-[8px_8px_0px_0px_#000] bg-[#FFE0B2] overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-40 h-40 relative">
                            <Image src="/HeroAvatar/a6.svg" alt="Illustration" fill className="object-contain" />
                        </div>
                    </div>
                </div>

                <div className="prose prose-lg prose-black max-w-none font-medium text-gray-800">
                    <p className="mb-6">
                        There’s plenty of advice out there on how to get over a breakup, but what about those situations in which you have to let go of someone you never actually dated?
                    </p>
                    <p className="mb-6">
                        Whether it was a crush, a situationship, or just someone you matched with and built up in your head, the pain of losing the "potential" relationship can be just as real. This is what we call the fantasy of dating someone.
                    </p>
                    <h3 className="text-2xl font-black mb-4">Why is it so hard?</h3>
                    <p className="mb-6">
                        When you date someone, you see their flaws. When you fantasize about them, they are perfect. You aren't mourning a real person; you're mourning the perfect version of a partner you created in your mind.
                    </p>
                    <h3 className="text-2xl font-black mb-4">Visualizing the Reality</h3>
                    <p className="mb-6">
                        BlindCharm helps ground you in reality by focusing on voice, vibe, and conversation first. We strip away the superficial layers that often fuel these fantasies, allowing you to connect with the real human being behind the profile.
                    </p>
                    <p>
                        It's time to stop falling for potential and start falling for reality.
                    </p>
                </div>
            </main>
        </div>
    );
}
