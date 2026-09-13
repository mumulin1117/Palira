// Each row follows the locally reviewed image sequence for its language.
const paliroBoxContent = {
  ko: [
    ['펼쳐 둔 책', '책장을 넘기며 잠깐 쉬어요. 요즘 어떤 책을 읽고 있나요?', ['Reading']],
    ['게임 한 판', '컨트롤러를 꺼냈어요. 함께 즐기기 좋은 게임을 추천해 주세요.', ['Gaming', 'Technology']],
    ['빈티지 카메라', '빈티지 카메라의 매력이 좋아요. 어떤 장면을 담고 싶나요?', ['Photography']],
    ['차 한 잔', '따뜻한 차를 우려 두었어요. 잠깐 쉬면서 이야기 나눌까요?', ['Cooking']],
    ['흰 구두와 빨간 배경', '빨간 배경에 흰 구두가 눈에 띄어요. 어떤 옷과 어울릴까요?', ['Fashion', 'Art']],
    ['리듬을 고르는 손', '음악 장비 앞에서 리듬을 골라요. 오늘은 어떤 곡이 좋을까요?', ['Music']],
    ['물가의 점프', '물가에서 뛰어오르는 순간이에요. 가장 즐거웠던 여행은 언제였나요?', ['Travel', 'Nature']],
    ['둥근 빛', '둥근 통로 끝의 빛이 신기해요. 여러분에게는 무엇처럼 보이나요?', ['Photography', 'Art']],
    ['노란 골목', '노란 건물 사이 골목을 천천히 걷고 싶어요. 함께 둘러볼까요?', ['Travel', 'Photography']],
    ['잔잔한 파도', '잔잔한 파도를 보니 마음이 편안해져요. 어디에서 쉬고 싶나요?', ['Nature', 'Travel']],
    ['전자책과 휴식', '전자책과 함께 쉬는 시간이에요. 종이책과 전자책 중 무엇이 좋나요?', ['Reading', 'Technology']],
    ['파란 하늘의 구름', '파란 하늘에 구름이 길게 흘러가요. 어떤 모양처럼 보이나요?', ['Nature', 'Photography']],
    ['공연장의 불빛', '공연장을 가득 채운 불빛이 멋져요. 다시 가고 싶은 공연이 있나요?', ['Music', 'Nightlife']],
    ['창작하는 책상', '책과 연필이 있는 책상을 보니 무언가 그려 보고 싶어요.', ['Art', 'Reading']],
    ['흑백 솔방울', '흑백으로 보니 솔방울의 무늬가 더 선명해요. 이런 사진 좋아하나요?', ['Photography', 'Nature']],
    ['햇살과 산딸기', '햇살 아래 산딸기가 놓여 있어요. 어떤 디저트에 곁들이면 좋을까요?', ['Cooking', 'Nature']],
    ['손안의 카메라', '카메라를 들고 나갈 준비를 해요. 오늘은 무엇을 찍어 볼까요?', ['Photography', 'Technology']],
    ['레코드 한 곡', '레코드가 천천히 돌아가요. 지금 함께 듣고 싶은 곡이 있나요?', ['Music']],
    ['보랏빛 꽃', '보랏빛 꽃이 눈에 들어왔어요. 산책할 때 어떤 꽃을 찾게 되나요?', ['Nature', 'Photography']],
  ],
  en: [
    ['Leaves by the water', 'New leaves beside the water. What small detail caught your eye today?', ['Nature', 'Photography']],
    ['A quiet desk', 'A laptop and a quiet desk. What would you create here?', ['Technology']],
    ['Raindrop patterns', 'Tiny raindrops make their own patterns. Do you enjoy close-up photography?', ['Photography', 'Nature']],
    ['A little cactus', 'A little cactus, seen from above. Which plant would you keep on your desk?', ['Nature', 'Photography']],
    ['Colorful steps', 'A splash of color on the stairs. What shoes would you wear today?', ['Fashion', 'Photography']],
    ['City lights', 'City lights turn into soft dots of color. What song fits this evening?', ['Photography', 'Music', 'Nightlife']],
    ['Clouds over the ridge', 'White clouds above a rocky ridge. Where would you go for a view like this?', ['Nature', 'Travel']],
    ['Warm light indoors', 'Warm light falls across the room. A quiet spot for your favorite music?', ['Photography', 'Music']],
    ['Glass on a garden fence', 'Colorful glass catches the sunlight. What would you make for a garden?', ['Art', 'Nature']],
    ['A forest path', 'A path winds through green trees. Shall we take the scenic route?', ['Nature', 'Travel']],
    ['Ready to create', 'A laptop, glasses, and a clear desk. What project is on your mind?', ['Technology']],
    ['Snow under streetlights', 'Snow sparkles under the streetlights. Do you like quiet winter walks?', ['Photography', 'Nature']],
    ['A spark of celebration', 'A sparkler lights up the evening. What little moment are you celebrating?', ['Photography', 'Nightlife']],
    ['A quiet pier', 'An empty pier and a cloudy sky. Would you stop here for a quiet moment?', ['Travel', 'Nature']],
    ['Coffee against red', 'A cup of coffee against bright red. How do you like your coffee?', ['Coffee']],
    ['A typewriter in pieces', 'A typewriter laid out piece by piece. Curious how everyday things work?', ['Technology', 'Art']],
    ['A boat on blue water', 'A small boat on blue water. Where would you like to drift for an afternoon?', ['Travel', 'Nature']],
    ['Flowers by the window', 'Flowers by a bright window. A peaceful corner for reading, perhaps?', ['Nature', 'Reading']],
    ['A shelf of cameras', 'A shelf full of vintage cameras. Which detail would you photograph first?', ['Photography', 'Technology']],
    ['A sunlit street', 'Sunlight fills the street with gold. What story could begin here?', ['Photography', 'Travel', 'Movies']],
  ],
}

export function paliroGetMockBoxContent(language, userID) {
  const sequence = Number(String(userID).split('-').at(-1)) - (language === 'ko' ? 1000 : 2000)
  const row = paliroBoxContent[language]?.[sequence - 1]
  if (!row) throw new Error(`Missing Paliro Box content: ${language}/${userID}`)
  const [title, description, interests] = row
  return {
    title,
    description,
    theme: title,
    interests: [...interests],
    image: `/assets/paliro-box-${language}-${String(sequence).padStart(2, '0')}.jpg`,
  }
}
