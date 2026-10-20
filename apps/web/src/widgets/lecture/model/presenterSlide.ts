/** 강사 발표 화면(/hansalim/presenter)에 보이는 장 하나. 값은 강의 저장소 레이아웃.json에서 옮긴다. */
export interface PresenterSlide {
  number: number;
  title: string;
  sub: string;
  /** 예정 시각. 「10:12–10:14」 또는 「참고」(부록) */
  time: string;
  minutes: number;
  part: string;
  session: string;
  script: string;
  activity: string;
  answer: string;
  success: string;
  prompt: string;
  instructorOnly: boolean;
}
