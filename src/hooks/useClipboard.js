import { useState, useEffect } from 'react';

export default function useClipboard() {
  const [copyMessage, setCopyMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeout;
    if (copyMessage) {
      setIsVisible(true);
      timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setCopyMessage(''), 300);
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [copyMessage]);

  const copyToClipboard = (text, message = 'Đã sao chép') => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopyMessage(message);
      })
      .catch(err => {
        console.error('Lỗi khi sao chép vào clipboard:', err);
        setCopyMessage('Không thể sao chép: ' + err.message);
      });
  };

  return {
    copyMessage,
    isVisible,
    copyToClipboard
  };
}
