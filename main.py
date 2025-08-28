from dotenv import load_dotenv
load_dotenv()
from src.ui.app import App, graph


def main():
    app = App()
    app.app_loop()
    app.cleanup()


if __name__ == "__main__":
    # print(graph.get_graph().draw_mermaid())
    main()
