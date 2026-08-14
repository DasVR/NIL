"""Compatibility entrypoint."""

from finn_pentest.api.app import app

if __name__ == "__main__":
    import uvicorn

    from finn_pentest.core.config import API_HOST, API_PORT

    uvicorn.run(app, host=API_HOST, port=API_PORT)
