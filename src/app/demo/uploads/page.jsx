'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DragDropArea, PdfList, UploadButton, PdfPreview } from '@/components/pdf-upload';

export default function UploadsDemo() {
    const [singleUpload, setSingleUpload] = useState(null);

    const handleSingleUploadComplete = (file) => {
        setSingleUpload(file);
    };

    return (
        <div className="container mx-auto py-10">
            <h1 className="mb-8 text-3xl font-bold">PDF Upload Demo</h1>

            <Tabs defaultValue="upload-methods">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload-methods">Upload Methods</TabsTrigger>
                    <TabsTrigger value="pdf-list">PDF List</TabsTrigger>
                    <TabsTrigger value="documentation">Documentation</TabsTrigger>
                </TabsList>

                <TabsContent value="upload-methods" className="space-y-6">
                    <h2 className="mt-6 text-2xl font-semibold">Upload Methods</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Button</CardTitle>
                                <CardDescription>Simple button for uploading PDF files</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center space-y-4">
                                <UploadButton
                                    onUploadComplete={handleSingleUploadComplete}
                                    metadata={{ document_type: 'demo' }}
                                />

                                {singleUpload && (
                                    <div className="mt-4 w-full">
                                        <p className="mb-2 text-sm font-medium">Uploaded File:</p>
                                        <PdfPreview file={singleUpload} showPreview={true} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Drag & Drop Area</CardTitle>
                                <CardDescription>Drag and drop interface for uploading files</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <DragDropArea
                                    onUploadComplete={handleSingleUploadComplete}
                                    metadata={{ document_type: 'demo' }}
                                    className="min-h-[200px]"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="pdf-list">
                    <h2 className="mt-6 text-2xl font-semibold">PDF List</h2>
                    <p className="mb-6 text-muted-foreground">
                        A complete interface for managing uploaded PDF files
                    </p>

                    <PdfList
                        title="Demo Documents"
                        description="Manage your demo PDF documents"
                        documentType="demo"
                    />
                </TabsContent>

                <TabsContent value="documentation">
                    <h2 className="mt-6 text-2xl font-semibold">Documentation</h2>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>How to Use</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">Simple Upload Button</h3>
                                <pre className="mt-2 rounded-md bg-muted p-4">
                                    <code>{`import { UploadButton } from '@/components/pdf-upload';

// Basic usage
<UploadButton onUploadComplete={(file) => console.log(file)} />

// With metadata
<UploadButton 
  metadata={{ 
    reference_id: 123, 
    document_type: 'invoice' 
  }} 
  onUploadComplete={handleUpload}
/>`}</code>
                                </pre>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium">PDF List Component</h3>
                                <pre className="mt-2 rounded-md bg-muted p-4">
                                    <code>{`import { PdfList } from '@/components/pdf-upload';

// Basic usage
<PdfList />

// With filtering
<PdfList
  title="Invoice Documents"
  description="All invoice PDFs"
  referenceId={123}
  documentType="invoice"
/>`}</code>
                                </pre>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium">Drag & Drop Area</h3>
                                <pre className="mt-2 rounded-md bg-muted p-4">
                                    <code>{`import { DragDropArea } from '@/components/pdf-upload';

<DragDropArea
  onUploadComplete={handleUploadComplete}
  metadata={{ document_type: 'contract' }}
  className="min-h-[300px]"
/>`}</code>
                                </pre>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
} 