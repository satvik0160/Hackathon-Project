import PyPDF2
import re

def extract_text_and_links(pdf_path):
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
            
            # Also try to get annotations (hyperlinks)
            if '/Annots' in page:
                for annot in page['/Annots']:
                    try:
                        obj = annot.get_object()
                        if '/A' in obj and '/URI' in obj['/A']:
                            uri = obj['/A']['/URI']
                            text += f"\n[LINK_ANNOT: {uri}]\n"
                    except Exception:
                        pass
        return text

with open('yt_curriculum.txt', 'w') as f:
    f.write(extract_text_and_links('DevAstra_YouTube_Master_Curriculum.pdf'))

with open('written_curriculum.txt', 'w') as f:
    f.write(extract_text_and_links('DevAstra_Written_GFG_W3S_Final_Fixed.pdf'))

print("Extracted to txt files.")
