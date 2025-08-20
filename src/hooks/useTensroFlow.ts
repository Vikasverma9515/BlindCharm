// hooks/useTensorFlow.ts
'use client';

import { useState, useEffect } from 'react';

export function useTensorFlow() {
  const [isReady, setIsReady] = useState(false);
  const [backend, setBackend] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const initializeTF = async () => {
      try {
        // Dynamically import TensorFlow to avoid SSR issues
        const tf = await import('@tensorflow/tfjs');
        
        // Try WebGL first, fallback to CPU
        let selectedBackend = 'webgl';
        try {
          await tf.setBackend('webgl');
          await tf.ready();
        } catch (webglError) {
          console.warn('WebGL not available, using CPU backend');
          selectedBackend = 'cpu';
          await tf.setBackend('cpu');
          await tf.ready();
        }
        
        setBackend(selectedBackend);
        setIsReady(true);
        console.log(`TensorFlow initialized with ${selectedBackend} backend`);
        
      } catch (err) {
        console.error('TensorFlow initialization failed:', err);
        setError('Failed to initialize TensorFlow');
      }
    };

    initializeTF();
  }, []);

  return { isReady, backend, error };
}