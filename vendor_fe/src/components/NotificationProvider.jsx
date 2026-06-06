import { Toaster } from 'sonner'

export default function NotificationProvider() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        style: {
          fontFamily: '"Instrument Sans", sans-serif',
        },
      }}
    />
  )
}
