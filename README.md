# Jatra-BCF24
Getting Started
Follow these instructions to set up the project locally.

Prerequisites
Ensure you have the following installed:

Node.js (LTS version recommended)
npm (comes with Node.js)

Installation
For client directory, Run the following commands:
npm install
npm run dev
setup env file with necessary API keys

For server directory, Run the following commands:
npm install
npm run dev
setup env file with necessary API keys

For rag directory, Run the following commands:
setup env file with necessary API keys
docker build -t rag .
docker run --env-file .env -p 8000:8000 rag 
