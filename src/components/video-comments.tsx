"use client"

import * as React from "react"
import { MessageCircle, Loader2, AlertCircle } from "lucide-react"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { getComments } from "@/app/session/actions"

interface Comment {
    id: string
    author: string
    avatar?: string
    content: string
    likes: number
    timestamp: string
}

interface VideoCommentsProps {
    videoId: string // Internal ID (may be suffixed)
    realVideoId?: string // Actual YouTube ID
    disabled?: boolean
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
        }
    ]

    // Shuffle comments based on videoId to make it consistent but different per video
    let currentSeed = videoId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return [...comments].sort(() => {
        currentSeed++;
        return Math.sin(currentSeed) - 0.5;
    });
}

export function VideoComments({ videoId, realVideoId, disabled }: VideoCommentsProps) {
    const [comments, setComments] = React.useState<Comment[]>([])
    const [loading, setLoading] = React.useState(false)
    const [usingMock, setUsingMock] = React.useState(false)

    React.useEffect(() => {
        const loadComments = async () => {
            setLoading(true);
            try {
                const result = await getComments(videoId);

                if (result.success && result.comments && result.comments.length > 0) {
                    const mappedComments = result.comments.map((c: any) => ({
                        id: c.id,
                        author: c.author,
                        avatar: c.author_thumbnail,
                        content: c.text,
                        likes: c.like_count,
                        timestamp: c._time_text || 'Recently'
                    }));
                    setComments(mappedComments);
                    setUsingMock(false);
                } else {
                    // Fallback to mock if no local comments found
                    setComments(generateMockComments(videoId));
                    setUsingMock(true);
                }
            } catch (err) {
                console.error("Failed to fetch comments", err);
                setComments(generateMockComments(videoId));
                setUsingMock(true);
            } finally {
                setLoading(false);
            }
        };

        loadComments();
    }, [videoId]);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white transition-transform duration-200 hover:scale-110 active:scale-95 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <MessageCircle className="h-6 w-6" />
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
                            {usingMock && (
                                <Alert className="mb-4 bg-muted/50">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>Simulated Comments</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        No local comments found. Showing simulated comments.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {comments.map((comment) => (
                                <div key={comment.id} className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.avatar} />
                                        <AvatarFallback>{comment.author[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold">{comment.author}</span>
                                            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                                        </div>
                                        <p className="text-sm" dangerouslySetInnerHTML={{ __html: comment.content }} />
                                        <div className="flex items-center gap-4 pt-1">
                                            <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                                                ❤️ {comment.likes}
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
