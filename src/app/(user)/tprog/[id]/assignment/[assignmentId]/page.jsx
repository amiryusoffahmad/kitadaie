import AssignmentDetails from './_components/AssignmentDetails'

// Enable dynamic parameters
export const dynamicParams = true

export default async function AssignmentPage({ params }) {
    // Convert params object to a simple value object
    const extractedParams = {
        id: await params?.id,
        assignmentId: await params?.assignmentId
    }

    console.log("[PAGE] AssignmentPage received params:", params);
    console.log("[PAGE] AssignmentPage extracted params:", extractedParams);

    // Pass the extracted params directly
    return <AssignmentDetails params={extractedParams} />
} 