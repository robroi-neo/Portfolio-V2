import './ResumeLink.css'
import { DownloadIcon } from './icons.jsx'

/** Underlined "Download résumé (PDF)" link with a download icon. Renders nothing until a file is set. */
export default function ResumeLink({ resume }) {
  if (!resume.file) return null

  return (
    <a className="resume-link" href={resume.file} download={resume.download}>
      {resume.label}
      <DownloadIcon size={14} />
    </a>
  )
}
