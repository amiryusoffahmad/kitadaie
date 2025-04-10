'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useUpcomingEvents } from '@/app/api/events-api'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious
} from '@/components/ui/carousel'

export default function EventCarousel() {
    const { data: events, isLoading, error } = useUpcomingEvents(5)
    const [mounted, setMounted] = useState(false)

    // Handle hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    if (isLoading) {
        return (
            <div className="py-2">
                <Card className="w-full shadow-sm">
                    <CardContent className="p-3 flex flex-col">
                        <Skeleton className="h-3 w-24 mb-1" />
                        <div className="flex justify-between items-start mb-2">
                            <Skeleton className="h-5 w-1/2" />
                            <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                        <Skeleton className="h-3 w-3/4 mb-4" />
                        <Skeleton className="h-3 w-2/5 mt-auto" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (error) {
        return (
            <div className="py-2">
                <Card className="shadow-sm">
                    <CardContent className="p-3">
                        <p className="text-center text-xs text-muted-foreground">
                            Unable to load upcoming events.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!events || events.length === 0) {
        return (
            <div className="py-2">
                <Card className="shadow-sm">
                    <CardContent className="p-3">
                        <p className="text-center text-xs text-muted-foreground">
                            No upcoming events scheduled.
                        </p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Format date to show only month and day
    const formatSimpleDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="py-2">
            <h2 className="text-lg font-semibold mb-2">Upcoming Events</h2>
            <Carousel
                className="w-full"
                opts={{
                    loop: true,
                    align: 'start',
                    slidesToScroll: 1
                }}
            >
                <CarouselContent className="-ml-2">
                    {events.map((event) => (
                        <CarouselItem key={event.id} className="pl-2 basis-[85%] md:basis-[80%]">
                            <Card className="border shadow-sm hover:shadow transition-shadow duration-200">
                                <CardContent className="h-full flex flex-col">
                                    <div className="text-xs text-muted-foreground mb-1">
                                        {formatSimpleDate(event.start_date)}
                                    </div>

                                    <div className="flex justify-between items-start mb-1.5">
                                        <h3 className="font-medium text-base line-clamp-1 pr-2">{event.name}</h3>
                                        <Badge variant="outline" className="ml-auto whitespace-nowrap text-xs">
                                            {event.current_registrations}/{event.max_participants || '∞'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                        <MapPin className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">{event.venue}</span>
                                    </div>

                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-auto">
                                        {event.description || "No description available"}
                                    </p>


                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="-left-3 h-6 w-6" />
                <CarouselNext className="-right-3 h-6 w-6" />
            </Carousel>
        </div>
    )
} 