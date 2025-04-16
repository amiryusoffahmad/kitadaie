// Helper function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().slice(-2);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export default function AssignmentReviewDetails() {
    // ... existing code ...

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Assignment Review</h1>
                <Link href={`/tprog/${params?.id}/assignment/${params?.assignmentId}`}>
                    <Button variant="outline">Back to Assignment</Button>
                </Link>
            </div>

            {review ? (
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Review Details</CardTitle>
                            <CardDescription>
                                Reviewed on {formatDate(review.created_at)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-1">Assignment</h3>
                                    <p>{review.assignment?.title}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1">Score</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge className={gradeColorMap[getGradeCategory(review.score)]}>
                                            {review.score}/100
                                        </Badge>
                                        <span className="text-sm text-muted-foreground">
                                            ({getGradeLabel(review.score)})
                                        </span>
                                    </div>
                                </div>

                                {/* ... existing code ... */}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
} 