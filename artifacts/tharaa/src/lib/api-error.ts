type ApiErrorLike = {
  data?: {
    error?: unknown;
  } | null;
  message?: unknown;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const apiError = error as ApiErrorLike;
    if (typeof apiError.data?.error === 'string') {
      return apiError.data.error;
    }

    if (
      typeof apiError.message === 'string' &&
      (apiError.message.includes('Failed to fetch') ||
        apiError.message.includes('NetworkError'))
    ) {
      return 'خدمة ثراء غير متاحة حالياً. يرجى المحاولة بعد قليل.';
    }
  }

  return fallback;
}