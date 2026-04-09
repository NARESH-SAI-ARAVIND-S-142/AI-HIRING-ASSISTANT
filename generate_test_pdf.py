from fpdf import FPDF

pdf = FPDF()
pdf.add_page()
pdf.set_font("helvetica", size=15)
pdf.cell(200, 10, txt="Alex Developer", ln=1, align='C')
pdf.cell(200, 10, txt="alex.dev@example.com | 555-0199", ln=1, align='C')
pdf.cell(200, 10, txt="https://github.com/octocat", ln=1, align='C')
pdf.cell(200, 10, txt="", ln=1)
pdf.cell(200, 10, txt="Skills: Python, React, Node.js, JavaScript, TypeScript, AWS, SQL", ln=1, align='L')
pdf.cell(200, 10, txt="Experience:", ln=1, align='L')
pdf.cell(200, 10, txt="2020 - Present: Senior Software Engineer at TechCorp", ln=1, align='L')
pdf.cell(200, 10, txt="Projects:", ln=1, align='L')
pdf.cell(200, 10, txt="- AI Hiring Platform: Built with React, Node, and Python FastAPI", ln=1, align='L')

pdf.output("test_resume.pdf")
print("PDF successfully created as test_resume.pdf")
