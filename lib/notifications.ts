import { toast } from '@/hooks/use-toast'

/**
 * Show a success notification
 * @param title - The title of the notification
 * @param description - The description of the notification
 */
export function showSuccessNotification(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'default',
  })
}

/**
 * Show an error notification
 * @param title - The title of the notification
 * @param description - The description of the notification
 */
export function showErrorNotification(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'destructive',
  })
}

/**
 * Show an info notification
 * @param title - The title of the notification
 * @param description - The description of the notification
 */
export function showInfoNotification(title: string, description?: string) {
  toast({
    title,
    description,
    variant: 'default',
  })
}

/**
 * Handle API error and show appropriate notification
 * @param error - The error object
 * @param defaultMessage - The default message to show if no specific error message is available
 */
export function handleApiError(error: any, defaultMessage: string = 'An unexpected error occurred') {
  console.error('API Error:', error)
  
  let message = defaultMessage
  
  // Handle different types of errors
  if (error?.message) {
    message = error.message
  } else if (error?.error) {
    message = error.error
  } else if (typeof error === 'string') {
    message = error
  }
  
  showErrorNotification('Error', message)
}

/**
 * Handle form validation error and show appropriate notification
 * @param errors - The validation errors
 */
export function handleFormValidationError(errors: Record<string, string>) {
  const errorMessages = Object.values(errors).join(', ')
  showErrorNotification('Validation Error', errorMessages)
}

/**
 * Show a loading notification
 * @param title - The title of the notification
 * @param description - The description of the notification
 * @returns A function to dismiss the loading notification
 */
export function showLoadingNotification(title: string, description?: string) {
  const { id, dismiss } = toast({
    title,
    description,
    variant: 'default',
  })
  
  return dismiss
}