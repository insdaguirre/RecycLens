import dotenv
import os
from llama_index.core import SimpleDirectoryReader
from llama_index.readers.web import BeautifulSoupWebReader
from llama_index.readers.file import PDFReader
from IPython.display import Markdown

dotenv.load_dotenv()

loader = BeautifulSoupWebReader()
parser = PDFReader()
url_dict = {
    "albany": ["https://www.albanyny.gov/FAQ.aspx?QID=126", "https://www.albanynyrecycles.com/rescom-recycling"],
    "tompkins": ["https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Recycling-and-Composting/Curbside-Recycling",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Recycling-and-Composting/Additional-Recyclables-at-the-RSWC",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Recycling-and-Composting/Food-Scraps-Recycling",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Trash/Permits-and-Fees",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Trash/Trash-Tags",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Trash/Licensed-Haulers",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Trash/Illegal-Dumping",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Other-Programs-and-Services/Household-Hazardous-Waste-HHW",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Other-Programs-and-Services/Household-Hazardous-Waste-HHW/Non-Residential-HHW",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Other-Programs-and-Services/ReBusiness-Partners-Program",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Other-Programs-and-Services/Borrow-A-Bin",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Other-Programs-and-Services/Preventing-Food-Waste-and-Redistributing-Surplus-Edible-Food",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Other-Programs-and-Services/Buy-Green",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Other-Programs-and-Services/Reusable-Bag-Distribution",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Outreach/4Rs-in-Tompkins-County",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/About-Us/Financials",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/About-Us/Permits-Laws-and-Regulations",
    "https://www.tompkinscountyny.gov/All-Departments/Recycling-Materials-Management/Contact-Us"]
    
}


# dictionary will store the counties. rag_pdf_data will have subfolders with county names, and then the pdf inside that.
for name, url_list in url_dict.items():
    # if the county has pdf data, load it. Only counties with actual pdf files should have a directory
    if (os.path.isdir('rag_pdf_data/'+name)):
        file_extractor = {".pdf": parser}
        pdf_documents = SimpleDirectoryReader(
            "./rag_pdf_data/"+name, file_extractor=file_extractor
        ).load_data()
        pdf_readmes = [(Markdown(f"{doc.text}")) for doc in pdf_documents]
  
        for i,readme_data in enumerate(pdf_readmes):        
            output_dir = "rag/rag_docs/" + name + "pdf" + str(i) +".md"
            header = f"""---
county: {name}
state: NY
content_type: pdf
source_file: {pdf_documents[i].metadata.get('file_path')}
---\n
            """
            try:
                with open(output_dir, "w", encoding="utf-8") as f:
                    f.write(header + readme_data.data)
                
            except Exception as e:
                print(f"An error occurred: {e}")
    

    documents = loader.load_data(url_list)

    readmes = [(Markdown(f"{doc.text}")) for doc in documents]

    
  
    for i,readme_data in enumerate(readmes):
        output_dir = "rag/rag_docs/" + name + str(i)+".md"
        header = f"""---
county: {name}
state: NY
content_type: html
source_url: {documents[i].metadata.get('URL')}
---\n
            """
        try:
            with open(output_dir, "w", encoding="utf-8") as f:
                f.write(header + readme_data.data)
            
        except Exception as e:
            print(f"An error occurred: {e}")