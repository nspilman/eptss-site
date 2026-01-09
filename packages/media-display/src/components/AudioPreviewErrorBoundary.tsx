/**
 * AudioPreviewErrorBoundary Component
 * Error boundary to catch AudioPreview component errors without crashing the whole page
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { AlertBox, Text } from '@eptss/ui';
import { logger } from '@eptss/logger/client';

interface AudioPreviewErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI to show when error occurs (optional) */
  fallback?: ReactNode;
  /** Callback when error is caught (optional) */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface AudioPreviewErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AudioPreviewErrorBoundary extends Component<
  AudioPreviewErrorBoundaryProps,
  AudioPreviewErrorBoundaryState
> {
  constructor(props: AudioPreviewErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): AudioPreviewErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    logger.error('AudioPreview crashed', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <AlertBox variant="error" title="Audio Preview Error">
          <Text className="text-sm">
            Failed to load audio preview. {this.state.error?.message || 'Unknown error occurred.'}
          </Text>
        </AlertBox>
      );
    }

    return this.props.children;
  }
}
