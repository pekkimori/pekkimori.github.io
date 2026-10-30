import "./resume-document.css";

export const RESUME_PDF_URL = "/resume/rafael-mori-resume.pdf";

export default function ResumeDocument({ lang }: { lang: "en" | "pt" }) {
  return (
    <iframe
      className="resume-document"
      src={`${RESUME_PDF_URL}#toolbar=0&navpanes=0&view=Fit&zoom=page-fit`}
      title={
        lang === "pt" ? "Currículo original em PDF" : "Original résumé PDF"
      }
    />
  );
}
