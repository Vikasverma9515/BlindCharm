import { Skeleton } from "@/components/ui/Skeleton"

export default function ChatLoading() {
    return (
        <div className="flex flex-col h-full bg-black pt-safe">
            {/* Header */}
            <div className="px-4 py-4 border-b border-white/10 flex justify-between items-center">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Active Matches / Stories */}
                <div className="flex gap-4 overflow-x-hidden mb-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex flex-col items-center space-y-2 min-w-[4rem]">
                            <Skeleton className="w-16 h-16 rounded-full border-2 border-white/10" />
                            <Skeleton className="w-12 h-3" />
                        </div>
                    ))}
                </div>

                {/* Message Rows */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex items-center gap-4 py-2">
                        <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between">
                                <Skeleton className="w-32 h-4" />
                                <Skeleton className="w-12 h-3" />
                            </div>
                            <Skeleton className="w-48 h-3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
