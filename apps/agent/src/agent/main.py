from dotenv import load_dotenv

from agent.config import load_config
from agent.server.grpc_server import serve


def main() -> None:
    load_dotenv()
    serve(load_config())


if __name__ == "__main__":
    main()
