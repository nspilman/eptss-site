/**
 * Hook for file validation
 */

import { useCallback, useMemo } from 'react';
import type { FileValidationConfig } from '../types';
import { validateFiles, getValidFiles } from '../utils/fileValidation';

export function useFileValidation(config: FileValidationConfig) {
  /**
   * Validate files and return errors
   */
  const validate = useCallback(
    (files: File[]): (string | null)[] => {
      return validateFiles(files, config);
    },
    [config]
  );

  /**
   * Filter and separate valid and invalid files
   */
  const filterValid = useCallback(
    (files: File[]) => {
      return getValidFiles(files, config);
    },
    [config]
  );

  /**
   * Check if any files are valid
   */
  const hasValid = useCallback(
    (files: File[]): boolean => {
      const errors = validateFiles(files, config);
      return errors.some((error) => error === null);
    },
    [config]
  );

  /**
   * Memoized validation configuration
   */
  const validationConfig = useMemo(() => config, [config]);

  return {
    validate,
    filterValid,
    hasValid,
    config: validationConfig,
  };
}
