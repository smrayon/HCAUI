import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import MessageViewer from './components/MessageViewer';
import { useState, useEffect, useRef } from 'react';
import { parseHL7Message } from './utility/h17Utility';




function App() {
  const [originalMessages, setOriginalMessages] = useState([]);
  const [deidMessages, setDeidMessages] = useState([]);
  
  const [filterControlId, setFilterControlId] = useState('');
  const [filterMRN, setFilterMRN] = useState('');
  const [filterLastName, setFilterLastName] = useState('');

  const [tempControlId, setTempControlId] = useState('');
  const [tempMRN, setTempMRN] = useState('');
  const [tempLastName, setTempLastName] = useState('');

  
  const pairedFilteredMessages = originalMessages
  .map((originalMsg, idx) => {
    const segments = parseHL7Message(originalMsg);
    const pidSegment = segments.find(seg => seg[0][0] === 'PID');
    if (!pidSegment) return null;
    const originalLastName = pidSegment?.[5]?.[0] ?? '';
    const mrn = pidSegment?.[3]?.[0] ?? '';
    const mshSegment = segments.find(seg => seg[0][0] === 'MSH');
    const controlId = mshSegment?.[10]?.[0] ?? '';

    const lastNameMatch =
      tempLastName.trim() === '' ||
      (originalLastName?.trim().toLowerCase() === tempLastName.trim().toLowerCase());

    const mrnMatch =
      tempMRN.trim() === '' ||
      (mrn?.trim().toLowerCase() === tempMRN.trim().toLowerCase());
    

    const controlIdMatch =
      tempControlId.trim() === '' ||
      (controlId?.trim().toLowerCase() === tempControlId.trim().toLowerCase());

    const match = lastNameMatch && mrnMatch && controlIdMatch;


    console.log("Comparing MRNs:", mrn, "vs", tempMRN);
    console.log("Match?", mrn === tempMRN);


    return match
        ? {
            originalMsg,
            deidMsg: deidMessages[idx] || ''
          }
        : null;
    })
    .filter(Boolean);

  

  const originalRef = useRef(null);
  const deidRef = useRef(null);
  const isSyncingScroll = useRef(false);

  const syncScroll = (source) => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    if (source === 'original' && deidRef.current && originalRef.current) {
      deidRef.current.scrollTop = originalRef.current.scrollTop;
    } else if (source === 'deid' && originalRef.current && deidRef.current) {
      originalRef.current.scrollTop = deidRef.current.scrollTop;
    }

    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 100);
  };

  const handleMRNClick = (mrn) => {
    console.log("Clicked MRN:", mrn);
    setTempMRN(mrn);
    setTimeout(() => {
      applyFilters(tempControlId, mrn, tempLastName);
    }, 0); 
  };
  
  
  
  
  
  useEffect(() => {
    const loadMessages = async (file, setFn) => {
      const response = await fetch(`${file}`);
      const text = await response.text();
      const messages = text
        .split(/(?=MSH\|)/)
        .map(m => m.trim())
        .filter(Boolean);
      setFn(messages);
    };


    loadMessages(
      'https://raw.githubusercontent.com/hca-foundation/innovate_25/main/source_hl7_messages_v2.hl7',
      setOriginalMessages
    );

    loadMessages (
      '',
      setDeidMessages
    );
    
  }, []);
  
  const applyFilters = (controlId, mrn, lastName) => {
    setFilterControlId(controlId.trim());
    setFilterMRN(mrn.trim());
    setFilterLastName(lastName.trim());
  };
   
  

  return (
    <div className="container text-center mt-5">
      <img
        src="https://vectorseek.com/wp-content/uploads/2023/08/Hca-Healthcare-Logo-Vector.svg-1-1.png"
        alt="HCA logo"
        className="logo mb-4"
        style={{ maxWidth: '300px' }}
      />
      <h1>Patient Data</h1>

      <div className="filter-container my-4">
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Filter by Message Control ID"
          value={tempControlId}
          onChange={(e) => setTempControlId(e.target.value)}
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Filter by MRN"
          value={tempMRN}
          onChange={(e) => setTempMRN(e.target.value)}
        />
        <input
          type="text"
          className="form-control mb-2"
          placeholder="Filter by Last Name"
          value={tempLastName}
          onChange={(e) => setTempLastName(e.target.value)}
        />

        <button
          className="btn btn-primary"
          onClick={() => applyFilters(tempControlId, tempMRN, tempLastName)}
        >
          Search
        </button>

      </div>

      <div className="message-grid">
      <MessageViewer
        title="Original HL7 Messages"
        messages={pairedFilteredMessages.map(pair => pair.originalMsg)}
        containerRef={originalRef}
        onScroll={() => syncScroll('original')}
        onMRNClick={handleMRNClick}
      />
      <MessageViewer
        title="De-Identified HL7 Messages"
        messages={pairedFilteredMessages.map(pair => pair.deidMsg)}
        containerRef={deidRef}
        onScroll={() => syncScroll('deid')}
      />

      </div>
    </div>
  );

  
}

export default App;
