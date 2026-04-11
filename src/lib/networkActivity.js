const listeners = new Set();
let pendingRequests = 0;

function notify() {
  listeners.forEach((listener) => listener(pendingRequests));
}

export function beginNetworkRequest() {
  pendingRequests += 1;
  notify();
}

export function endNetworkRequest() {
  pendingRequests = Math.max(0, pendingRequests - 1);
  notify();
}

export function subscribeNetworkActivity(listener) {
  listeners.add(listener);
  listener(pendingRequests);
  return () => listeners.delete(listener);
}

export function getPendingRequestsCount() {
  return pendingRequests;
}
