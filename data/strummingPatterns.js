// 8 eighth-note slots per 4/4 bar. 'D' down, 'U' up, '' rest.
export const STRUMMING_PATTERNS = {
  allDown: { id: 'allDown', label: 'Tot în jos', slots: ['D', '', 'D', '', 'D', '', 'D', ''] },
  downUp:  { id: 'downUp',  label: 'Jos-Sus',    slots: ['D', '', 'U', '', 'D', '', 'U', ''] },
  island:  { id: 'island',  label: 'D DU UDU',   slots: ['D', '', 'D', 'U', '', 'U', 'D', 'U'] },
};
