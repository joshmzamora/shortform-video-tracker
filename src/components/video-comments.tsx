"use client"

import * as React from "react"
import { MessageCircle, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Comment {
    id: string
    author: string
    avatar?: string
    content: string
    likes: number
    timestamp: string
}

interface VideoCommentsProps {
    videoId: string
}

// Mock comments generator since public APIs are rate-limited/blocked
const generateMockComments = (videoId: string): Comment[] => {
    const comments: Comment[] = [
        {
            id: "1",
            author: "Alex Chen",
            content: "This is exactly what I needed to see today! 🙌",
            likes: 124,
            timestamp: "2 hours ago"
        },
        {
            id: "2",
            author: "Sarah Jones",
            content: "Wait, does this actually work? I need to try this.",
            likes: 89,
            timestamp: "5 hours ago"
        },
        {
            id: "3",
            author: "Mike Smith",
            content: "The editing on this is insane!",
            likes: 456,
            timestamp: "1 day ago"
        },
        {
            id: "4",
            author: "Emily White",
            content: "I've been looking for this everywhere. Thank you!",
            likes: 67,
            timestamp: "2 days ago"
        },
        {
            id: "5",
            author: "David Brown",
            content: "Underrated content right here.",
            likes: 23,
            timestamp: "1 week ago"
        },
        {
            id: "6",
            author: "Jessica Taylor",
            content: "Can you do a part 2 please?",
            likes: 210,
            timestamp: "1 week ago"
        },
        {
            id: "7",
            author: "Ryan Wilson",
            content: "LMAO 😂😂😂",
            likes: 890,
            timestamp: "2 weeks ago"
        },
        {
            id: "8",
            author: "Kevin Miller",
            content: "First!",
            likes: 2,
            timestamp: "3 weeks ago"
        }
    ]

    // Shuffle comments based on videoId to make it consistent but different per video
    const seed = videoId.charCodeAt(0) + videoId.charCodeAt(videoId.length - 1);
    return comments.sort(() => Math.sin(seed++) - 0.5);
}

export function VideoComments({ videoId }: VideoCommentsProps) {
    const [comments, setComments] = React.useState<Comment[]>([])
    const [loading, setLoading] = React.useState(false)

    // Simulate network request
    React.useEffect(() => {
        setLoading(true)
        const timer = setTimeout(() => {
            setComments(generateMockComments(videoId))
            setLoading(false)
        }, 1000)
        return () => clearTimeout(timer)
    }, [videoId])

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="flex flex-col gap-1 h-auto text-white hover:bg-white/20 hover:text-white">
                    <MessageCircle className="h-8 w-8" />
                    <span className="text-xs font-semibold">1.2K</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0 bg-background text-foreground">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Comments</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-60px)] p-4">
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>{comment.author[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">{comment.author}</span>
                                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                        <div className="flex items-center gap-4 pt-1">
                                            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                                Example Like ({comment.likes})
                                            </button>
                                            <button className="text-xs text-muted-foreground hover:text-foreground">
                                                Reply
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
