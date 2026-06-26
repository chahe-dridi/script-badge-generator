# Backend API

This is the Python-based backend for the Script Badge Generator. Currently written with FastAPI, it serves as a robust foundation for offloading heavy badge processing, data validations, and database integrations if required. 

Note: The current primary mode of the web app renders client-side, but this API is structured to handle enterprise-level batching when scaled.

## Setup

1. Make sure Python 3.9+ is installed.
2. Navigate to this directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn main:app --reload
   ```

The API will run on port `8000`. You can access the auto-generated Swagger documentation at `http://localhost:8000/docs`.