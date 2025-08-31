from dotenv import load_dotenv
load_dotenv()
from backend.ui.app import App


def main():
    app = App()
    app.app_loop()
    app.cleanup()


if __name__ == "__main__":
    # print(graph.get_graph().draw_mermaid())
    main()
