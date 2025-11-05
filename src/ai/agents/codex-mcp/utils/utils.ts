export function StatusResponse(result: any, status: 'success' | 'error', message: string){
  return {
    result,
    status,
    message: status === 'success' ? getSuccessStatusResponseMessage(message) : getErrorStatusResponseMessage(message)
  };
}


export function getSuccessStatusResponseMessage(message: string){
  return `SUCCESS: ${message}`;
}


export function getErrorStatusResponseMessage(message: string){
  return `ERROR: ${message}`;
}