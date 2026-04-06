class TemplateNotFoundError(Exception):
    def __init__(self, template_id: str) -> None:
        self.template_id = template_id
        super().__init__("Template not found")


class RenderError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)
