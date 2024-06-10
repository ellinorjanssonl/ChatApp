import { useEffect, useRef } from 'react';

const FetchCsrfToken = ({ setCsrfToken }) => {
  const hasFetchedToken = useRef(false);

  useEffect(() => {
    if (!hasFetchedToken.current) {
      hasFetchedToken.current = true;

      fetch('https://chatify-api.up.railway.app/csrf', {
        method: 'PATCH',
      })
      .then(res => res.json())
      .then(data => {
        console.log('Fetched CSRF Token:', data.csrfToken);
        setCsrfToken(data.csrfToken);
      })
      .catch(err => console.error('Failed to fetch CSRF token', err));
    }
  }, [setCsrfToken]);

  return null;
};

export default FetchCsrfToken;
