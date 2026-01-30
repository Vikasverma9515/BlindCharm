import { Skeleton } from "@/components/ui/Skeleton"

export default function GalaxyFeedLoading() {
    return (
        <div className="h-full w-full bg-black flex flex-col items-center relative overflow-hidden p-4">
            {/* Card Stack Skeleton */}
            <div className="relative w-full max-w-sm aspect-[3/5] mt-8">
                <Skeleton className="w-full h-full rounded-3xl border border-white/10" />

                {/* Internal Card Details */}
                <div className="absolute bottom-6 left-6 right-6 space-y-3">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-2 pt-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="flex justify-center items-center gap-6 mt-8">
                <Skeleton className="w-14 h-14 rounded-full" />
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="w-14 h-14 rounded-full" />
            </div>
        </div>
    )
}
