export const parseHL7Message = (message) => {
    const segments = message.split(/\r?\n|\r/).filter(Boolean);
    return segments.map(segment => {
      const fields = segment.split('|');
      return fields.map(field => field.split('^')); 
    });
  };
  