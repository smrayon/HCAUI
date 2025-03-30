import React, { useState, useEffect, useRef } from 'react';
import './MessageViewer.css';
import { parseHL7Message } from '../utility/h17Utility'; 


function MessageViewer({ title, messages, containerRef, onScroll, onMRNClick }) {
    const [visibleCount, setVisibleCount] = useState(10);


    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

        if (scrollTop + clientHeight >= scrollHeight - 10) {
            setVisibleCount((prev) => Math.min(prev + 10, messages.length));
        }

        if (onScroll) onScroll(); 
    };

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
          container.addEventListener('scroll', handleScroll);
        }
        return () => {
          if (container) {
            container.removeEventListener('scroll', handleScroll);
          }
        };
      }, [messages]);


const visibleMessages = messages.slice(0, visibleCount);


  const renderHL7Message = (message) => {
    const segments = parseHL7Message(message);

    return segments.map((fields, segIdx) => {
        const segmentType = fields[0][0];
  
      return (
        <div key={segIdx} className="segment">
          <strong>{segmentType}</strong>|

          {fields.slice(1).map((field, fieldIdx) => {
            const hl7Path = `${segmentType}-${fieldIdx + 1}`;
            const components = typeof field === 'string' ? field.split('^') : field;
  
            return (
              <span key={fieldIdx} className="field">
                {components.map((component, compIdx) => {
                  const componentPath = components.length > 1
                    ? `${hl7Path}.${compIdx + 1}`
                    : hl7Path;
                const isMRN = segmentType === 'PID' && fieldIdx === 2 && compIdx === 0;
  
                  return (
                    <span
                    key={compIdx}
                    className="field-component"
                    title={componentPath}
                    style={{
                        color: isMRN ? '#007bff' : undefined,
                        textDecoration: isMRN ? 'underline' : undefined,
                        cursor: isMRN ? 'pointer' : undefined,
                      }}
                      onClick={() => {
                        if (isMRN && onMRNClick) {
                          onMRNClick(component);
                        }
                      }}
                  >
                    {component}
                    {compIdx < components.length - 1 ? '^' : ''}
                  </span>
                  
                  );
                })}
                {fieldIdx < fields.length - 2 ? '|' : ''}
              </span>
            );
          })}
        </div>
      );
    });
  };
  

  return (
    <div className="message-viewer">
        <h4 className="text-center">{title}</h4>

        <div ref={containerRef} className="message-scroll-container">
            {visibleMessages.map((msg, idx) => (
                <div key={idx} className="hl7-box mb-4">
                    <h6>Message {idx + 1}</h6>
                    <div>{renderHL7Message(msg)}</div>
                </div>
            ))}
        </div>
    </div>
);
}


export default MessageViewer;
