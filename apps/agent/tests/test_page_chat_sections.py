import unittest

from agent.skills.page_chat.models import PageChatInput, PageSection


def page_with_sections(count: int) -> PageChatInput:
    return PageChatInput(
        question="자료를 설명해줘",
        title="작업 소개",
        path="/work-sample",
        sections=tuple(PageSection(f"section-{index}", "자료", "공개 내용") for index in range(count)),
    )


class PageChatSectionBoundaryTest(unittest.TestCase):
    def test_accepts_seven_page_sections(self):
        page_with_sections(7).validate()

    def test_rejects_eight_page_sections(self):
        with self.assertRaises(ValueError):
            page_with_sections(8).validate()


if __name__ == "__main__":
    unittest.main()
