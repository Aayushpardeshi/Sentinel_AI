from pypdf import PdfReader


class PDFService:
    @staticmethod
    def extract_text(file_path: str):
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text() or ""
            text += extracted + "\n"
        return text
