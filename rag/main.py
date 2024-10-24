from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import os
from dotenv import load_dotenv
import uuid
import requests  # For making HTTP requests to Gemini API
from pinecone import Pinecone, ServerlessSpec


# Load environment variables
load_dotenv()

# API keys and environment variables
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")  # Updated for Gemini
PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV")

import base64
from anthropic import Anthropic
import voyageai

vo = voyageai.Client()

client = Anthropic(api_key=ANTHROPIC_API_KEY)
MODEL_NAME = "claude-3-opus-20240229"

import base64
import requests

def get_base64_encoded_image(image_url):
    # Download the image from the URL
    response = requests.get(image_url)
    if response.status_code == 200:
        binary_data = response.content
        # Convert the image data to base64
        base64_encoded_data = base64.b64encode(binary_data)
        base64_string = base64_encoded_data.decode('utf-8')
        return base64_string
    else:
        raise HTTPException(status_code=400, detail="Error downloading image.")



# Initialize Pinecone
pc = Pinecone(api_key=PINECONE_API_KEY)

# Create the FastAPI app
app = FastAPI()

# Define the request model
class UploadImagesRequest(BaseModel):
    images: List[str]  # List of image links
    metadata: Dict[str, str]  # Additional metadata

# Helper function to create a Pinecone index
def create_pinecone_index(tenant_id: str, dimension: int):
    existing_indexes = pc.list_indexes()
    index_name = f"i-string"
    if index_name not in pc.list_indexes().names():
        pc.create_index(
            name=index_name, 
            dimension=1024, 
            metric='euclidean',
            spec=ServerlessSpec(
                cloud='aws',
                region='us-west-1'
            )
        )
    return pc.Index(index_name)

# Helper function to generate captions using Gemini API
def generate_image_caption(image_url: str):

    message_list = [
    {
        "role": 'user',
        "content": [
            {"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": get_base64_encoded_image(image_url)}},
            {"type": "text", "text": "You have perfect vision and pay great attention to detail which makes you an expert at telling what is happening in images very clearly. Please describe the image in as much detail as possible."}
        ]
    }
]

    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=2048,
        messages=message_list
    )
    print(response.content[0].text)

    return response.content[0].text

# Helper function to generate embeddings using Gemini API
def generate_text_embedding(text):
    # Make a request to the Gemini API for text embedding generation
    result = vo.embed(text, model="voyage-2", input_type="document")

    # if response.status_code != 200:
    #     raise HTTPException(status_code=response.status_code, detail="Error generating text embedding")

    # result = response.json()
    # return result["data"]["response"]
    print(result.embeddings[0])

    return result.embeddings[0]

@app.post("/upload-images/")
async def upload_images(request: UploadImagesRequest, tenant_id: str):
    # Create Pinecone index for the tenant if it doesn't exist
    index = create_pinecone_index(tenant_id, dimension=1536)  # Assuming Gemini embeddings are 1536-dimensional

    embeddings = []

    for image_url in request.images:
        # Generate image caption using Gemini API
        caption = generate_image_caption(image_url)
        # caption = "A person standing in front of a building."

        # Generate embedding from the caption
        embedding = generate_text_embedding(caption)

        # Use the image URL as the ID
        image_id = image_url

        # Store the metadata and embedding in Pinecone
        index.upsert(vectors=[(image_id, embedding)], metadata={"caption": caption, **request.metadata})

        embeddings.append({
            "image_id": image_id,
            "caption": caption,
            "metadata": request.metadata
        })

    return {"status": "success", "uploaded_images": embeddings}

@app.post("/search-images/")
async def search_images(tenant_id: str, query: str):
    # Create Pinecone index for the tenant if it doesn't exist
    index = create_pinecone_index(tenant_id, dimension=1536)

    # Generate query embedding using Gemini API
    query_embedding = generate_text_embedding(query)

    # Search for similar images in Pinecone
    result = index.query(vector=query_embedding, top_k=5, include_metadata=True)

    # Ensure the matches are JSON serializable
    matches = [
        {
            "id": match["id"],
            "score": match["score"],
            # "metadata": match.get("metadata", {}),
            # "embedding": match.get("values", [])  # Ensure embedding is a list
        }
        for match in result.get("matches", [])
    ]

    return {"matches": matches}



# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import List, Dict
# import os
# from openai import OpenAI
# from dotenv import load_dotenv
# import uuid

# # Load environment variables
# load_dotenv()

# OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
# PINECONE_ENV = os.getenv("PINECONE_ENV")

# # Initialize OpenAI API
# client = OpenAI(api_key=OPENAI_API_KEY)

# # Initialize Pinecone
# from pinecone import Pinecone, ServerlessSpec
# pc = Pinecone(api_key=PINECONE_API_KEY)

# # Create the FastAPI app
# app = FastAPI()

# # Define the request model
# class UploadImagesRequest(BaseModel):
#     images: List[str]  # List of image links
#     metadata: Dict[str, str]  # Additional metadata


# def create_pinecone_index(tenant_id: str, dimension: int):
#     existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]
#     index_name = f"i-{tenant_id}"
#     if index_name not in existing_indexes:
#         pc.create_index(
#             name=index_name,
#             dimension=dimension,
#             metric="cosine",
#             spec=ServerlessSpec(cloud='aws', region='us-east-1')
#         )
#     return pc.Index(index_name)



# # Helper function to generate captions using OpenAI API
# def generate_image_caption(image_url: str):
#     prompt = f"Describe this image: {image_url}"

#     response = client.completions.create(model="gpt-3.5-turbo",  # or "gpt-3.5-turbo" based on availability
#     prompt=prompt)
#     return response.choices[0].text.strip()


# # Helper function to generate embeddings using OpenAI API
# def generate_text_embedding(text):
#     response = client.embeddings.create(input=text,
#     model="text-embedding-ada-002")
#     return response.data[0].embedding


# @app.post("/upload-images/")
# async def upload_images(request: UploadImagesRequest, tenant_id: str):
#     # Create Pinecone index for the tenant if it doesn't exist
#     index = create_pinecone_index(tenant_id, dimension=1536)  # OpenAI embeddings are 1536-dimensional

#     embeddings = []

#     for image_url in request.images:
#         # Generate image caption using OpenAI API
#         # caption = generate_image_caption(image_url)
#         caption = "A person standing in front of a building."

#         # Generate embedding from the caption
#         embedding = generate_text_embedding(caption)

#         # Use the image URL as the ID
#         image_id = image_url

#         # Store the metadata and embedding in Pinecone
#         index.upsert(vectors=[(image_id, embedding)], metadata={"caption": caption, **request.metadata})

#         embeddings.append({
#             "image_id": image_id,
#             "caption": caption,
#             "metadata": request.metadata
#         })

#     return {"status": "success", "uploaded_images": embeddings}


# @app.post("/search-images/")
# async def search_images(tenant_id: str, query: str):
#     # Create Pinecone index for the tenant if it doesn't exist
#     index = create_pinecone_index(tenant_id, dimension=1536)

#     # Generate query embedding using OpenAI API
#     query_embedding = generate_text_embedding(query)

#     # Search for similar images in Pinecone
#     result = index.query(query_embedding, top_k=5, include_metadata=True)

#     return {"matches": result["matches"]}
