export const LCU_ENDPOINT = {
  GAMEFLOW_URL: '/lol-gameflow/v1/session',
  GAMEFLOW_PHASE_URL: '/lol-gameflow/v1/gameflow-phase',
  CHAMP_SELECT_URL: '/lol-champ-select/v1/session',
  CHAT_ME_URL: '/lol-chat/v1/me',
};

export const PHASE = {
  NONE: 'None',
  LOBBY: 'Lobby',
  CHAMP_SELECT: 'ChampSelect',
  IN_GAME: 'InProgress',
};

type RankDivisionType = {
  [key: string]: number;
};

export const RANK_DIVISION: RankDivisionType = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
};

type ChampionsType = {
  [key: string]: string;
};

export const CHAMPIONS: ChampionsType = {
  266: '아트록스',
  103: '아리',
  84: '아칼리',
  166: '아크샨',
  12: '알리스타',
  32: '아무무',
  34: '애니비아',
  1: '애니',
  523: '아펠리오스',
  22: '애쉬',
  136: '아우렐리온 솔',
  268: '아지르',
  432: '바드',
  200: '벨베스',
  53: '블리츠크랭크',
  63: '브랜드',
  201: '브라움',
  51: '케이틀린',
  164: '카밀',
  69: '카시오페아',
  31: '조가스',
  42: '코르키',
  122: '다리우스',
  131: '다이애나',
  119: '드레이븐',
  36: '닥터무무',
  245: '에코',
  60: '일라이스',
  28: '이블린',
  81: '이즈리얼',
  9: '피들스틱',
  114: '피오라',
  105: '피즈',
  3: '갈리오',
  41: '갱플랭크',
  86: '가렌',
  150: '나르',
  79: '그라가스',
  104: '그레이브즈',
  887: '그웬',
  120: '헤카림',
  74: '하이머딩거',
  420: '일라오이',
  39: '이렐리아',
  427: '아이번',
  40: '잔나',
  59: '자르반 4세',
  24: '잭스',
  126: '제이스',
  202: '진',
  222: '징크스',
  145: '카이사',
  429: '칼리스타',
  43: '카르마',
  30: '카서스',
  38: '카사딘',
  55: '카타리나',
  10: '케일',
  141: '케인',
  85: '케넨',
  121: '카직스',
  203: '킨드레드',
  240: '클레드',
  96: '코그모',
  897: '케이샨테',
  7: '르블랑',
  64: '리 신',
  89: '레오나',
  876: '릴리아',
  127: '리산드라',
  236: '루시안',
  117: '룰루',
  99: '럭스',
  54: '말파이트',
  90: '말자하',
  57: '마오카이',
  11: '마스터 이',
  902: '밀리오',
  21: '미스 포츈',
  62: '오공',
  82: '모데카이저',
  25: '모르가나',
  950: '나피리',
  267: '나미',
  75: '나서스',
  111: '노틸러스',
  518: '니코',
  76: '니달리',
  895: '니라',
  56: '녹턴',
  20: '누누와 윌럼프',
  2: '올라프',
  61: '오리아나',
  516: '오른',
  80: '판테온',
  78: '뽀삐',
  555: '파이크',
  246: '퀴아나',
  133: '퀸',
  497: '라칸',
  33: '람머스',
  421: '렉사이',
  526: '렐',
  888: '레나타 글라스크',
  58: '레넥톤',
  107: '렝가',
  92: '리븐',
  68: '럼블',
  13: '라이즈',
  360: '사미라',
  113: '세주아니',
  235: '세나',
  147: '세라핀',
  875: '세트',
  35: '샤코',
  98: '쉔',
  102: '시바나',
  27: '신지드',
  14: '사이온',
  15: '시비르',
  72: '스카너',
  37: '소나',
  16: '소라카',
  50: '스웨인',
  517: '사일러스',
  134: '신드라',
  223: '탐 켄치',
  163: '탈리야',
  91: '탈론',
  44: '타릭',
  17: '티모',
  412: '쓰레쉬',
  18: '트리스타나',
  48: '트런들',
  23: '트린다미어',
  4: '트위스티드 페이트',
  29: '트위치',
  77: '우디르',
  6: '우르곳',
};
