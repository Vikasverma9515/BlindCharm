import { Skeleton } from "@/components/ui/Skeleton"

export default function ProfileLoading() {
    return (
        <div className="flex flex-col h-full bg-black p-4 space-y-6 overflow-y-auto pb-24">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>

            {/* Avatar & Basic Info */}
            <div className="items-center space-y-4">
                <div className="relative w-32 h-32 mx-auto">
                    <Skeleton className="w-full h-full rounded-full" />
                </div>
                <div className="space-y-2 flex flex-col items-center">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>

            {/* Stats/Metrics */}
            <div className="grid grid-cols-3 gap-4">
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
                <Skeleton className="h-20 rounded-xl" />
            </div>

            {/* Content Blocks */}
            <div className="space-y-4">
                <Skeleton className="h-40 w-full rounded-xl" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
            </div>
        </div>
    )
}
