from dotenv import load_dotenv

from app.config import load_config
from app.grpc.server import serve


def main() -> None:
    load_dotenv()
    serve(load_config())


if __name__ == "__main__":
    main()
