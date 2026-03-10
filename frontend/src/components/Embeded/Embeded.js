import React, { useEffect, useState } from 'react';
import { pdfjs } from 'react-pdf';

// Configure PDF.js worker path
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function PdfEmbed({ binaryData }) {
  const [pdfUrl, setPdfUrl] = useState(null);
const binaryDataUint8Array = new Uint8Array(binaryData);

  useEffect(() => {

    // Create a Blob from the binary data
    const blob = new Blob([binaryDataUint8Array], { type: 'application/pdf' });

    // Create a data URL for the Blob
    const url = URL.createObjectURL(blob);

    // Set the data URL as the source for the <iframe>
    setPdfUrl(url);

    // Clean up the URL when the component unmounts
    return () => URL.revokeObjectURL(url);
  }, []);

  return (
    <div>
      {pdfUrl ? (
        <iframe
          title="PDF Viewer"
          src={pdfUrl}
          width="100%"
          height="500px"
        ></iframe>
      ) : (
        <div>Loading PDF...</div>
      )}
    </div>
  );
};

export default PdfEmbed;
