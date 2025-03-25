import ClassDetails from './_components/ClassDetails'

// Enable dynamic parameters
export const dynamicParams = true

export default async function ClassPage({ params }) {
    // Convert params object to a simple value object
    const extractedParams = {
        id: await params?.id
    }

    console.log("[PAGE] ClassPage received params:", params);
    console.log("[PAGE] ClassPage extracted params:", extractedParams);

    // Pass the extracted params directly
    return <ClassDetails params={extractedParams} />
} 