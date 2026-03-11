import './globals.css'

export const metadata = {
  title: 'Resume Evaluation Study — AI Hiring Research',
  description: 'Help research whether AI models evaluate resumes fairly by providing your expert assessment.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
