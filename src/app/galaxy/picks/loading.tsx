import { Skeleton } from "@/components/ui/Skeleton"

export default function PicksLoading() {
    return (
        <div className="flex flex-col h-full bg-black pt-safe">
            {/* Header */}
            <div className="px-4 py-4 flex items-center gap-3">
                <Skeleton className="h-8 w-32" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-3 p-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden relative">
                        <Skeleton className="w-full h-full" />
                        <div className="absolute bottom-3 left-3 right-3 space-y-2">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
