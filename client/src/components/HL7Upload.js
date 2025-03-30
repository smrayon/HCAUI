import React, { useState } from 'react';

function HL7Upload({ onLoadMessages }) {
  const [originalFileName, setOriginalFileName] = useState('');
  const [deidFileName, setDeidFileName] = useState('');

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const messages = content
        .split(/(?=MSH\|)/)
        .map(m => m.trim())
        .filter(Boolean);
      onLoadMessages(messages, type);
    };
    reader.readAsText(file);

    if (type === 'original') setOriginalFileName(file.name);
    if (type === 'deid') setDeidFileName(file.name);
  };

  return (
    <div className="text-center my-4">
      <h4>Upload HL7 Files</h4>
      <div className="mb-3">
        <label className="form-label">Original HL7 File</label><br />
        <input type="file" onChange={(e) => handleFileUpload(e, 'original')} />
        {originalFileName && <p>📄 {originalFileName}</p>}
      </div>

      <div className="mb-3">
        <label className="form-label">De-Identified HL7 File</label><br />
        <input type="file" onChange={(e) => handleFileUpload(e, 'deid')} />
        {deidFileName && <p>📄 {deidFileName}</p>}
      </div>
    </div>
  );
}

export default HL7Upload;
