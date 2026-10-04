from typing import List, Optional, TypedDict

from langgraph.graph import END, StateGraph

from app.services.llm_service import LLMService
from app.services.retrieval_service import RetrievalService

llm = LLMService()


class ChatState(TypedDict):
    prompt: str
    document_id: Optional[str]
    user_id: int
    user_teams: List[int]
    results: list
    response: str
    sources: list


def retrieve_node(state: ChatState) -> ChatState:
    results = RetrievalService.retrieve(
        query=state["prompt"],
        limit=3,
        document_id=state.get("document_id"),
        user_id=state.get("user_id"),
        user_teams=state.get("user_teams") or [],
    )
    return {**state, "results": results}


def generate_node(state: ChatState) -> ChatState:
    results = state.get("results") or []
    if not results:
        return {
            **state,
            "response": "I don't have enough information in the uploaded documents.",
            "sources": [],
        }

    chunks = [result["text"] for result in results if result.get("text")]
    context = "\n\n".join(chunks)
    grounded_prompt = f"""You are Sentinel AI, a secure enterprise document assistant.
Answer the user's question using ONLY the supplied document context.
Do not invent information.
If the answer cannot be determined from the context, say:
"I don't have enough information in the uploaded documents."

Retrieved context:
{context}

User question:
{state["prompt"]}"""
    answer = llm.chat(grounded_prompt, "")
    sources = [
        {
            "score": result.get("score"),
            "document_id": result.get("document_id"),
            "chunk_id": result.get("chunk_id"),
            "filename": result.get("filename"),
            "chunk_index": result.get("chunk_index"),
            "uploaded_at": result.get("uploaded_at"),
        }
        for result in results
    ]
    return {**state, "response": answer, "sources": sources}


def build_chat_graph():
    graph = StateGraph(ChatState)
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("generate", generate_node)
    graph.set_entry_point("retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", END)
    return graph.compile()


chat_graph = build_chat_graph()


def run_chat(prompt: str, document_id: Optional[str], user_id: int, user_teams: List[int]):
    result = chat_graph.invoke(
        {
            "prompt": prompt,
            "document_id": document_id,
            "user_id": user_id,
            "user_teams": user_teams or [],
            "results": [],
            "response": "",
            "sources": [],
        }
    )
    return {
        "response": result["response"],
        "sources": result["sources"],
    }
