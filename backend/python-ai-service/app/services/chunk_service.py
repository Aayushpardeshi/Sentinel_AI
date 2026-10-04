from langchain_text_splitters import RecursiveCharacterTextSplitter


class ChunkService:
    @staticmethod
    def split_text(text: str):
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
        )
        return splitter.split_text(text)
