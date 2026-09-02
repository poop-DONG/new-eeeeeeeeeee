/* ==================== Claude API를 이용한 아이디어 생성 ==================== */

var Generator = (function() {
  var apiKey = null;
  var apiEndpoint = "https://api.anthropic.com/v1/messages";

  function setApiKey(key) {
    apiKey = key;
  }

  /**
   * 5개 재료(누가·뭘·왜·언제·어디서)를 받아서
   * Claude가 그에 맞는 해결 방법 3개를 새로 생성
   * 반환: [{ title, description }, { title, description }, { title, description }]
   */
  async function generateIdeas(targets, actions, factors, whens, wheres) {
    if (!apiKey) {
      console.error("API 키가 설정되지 않았습니다.");
      return null;
    }

    var targetStr = targets.join(", ");
    var actionStr = actions.join(", ");
    var factorStr = factors.join(", ");
    var whenStr = whens.length > 0 ? whens.join(", ") : "(시간 미정)";
    var whereStr = wheres.length > 0 ? wheres.join(", ") : "(장소 미정)";

    var prompt = `다음 5개 요소를 바탕으로, 현실적이고 혁신적인 아이디어 3개를 제시해줘:

누가(대상): ${targetStr}
뭘(행동): ${actionStr}
왜(문제): ${factorStr}
언제(시간): ${whenStr}
어디서(장소): ${whereStr}

각 아이디어는:
1. 실제로 만들 수 있어야 함 (공상이 아님)
2. 기존 서비스와는 다른 새로운 관점
3. 위 5개 요소를 모두 해결하려고 노력

JSON 배열로 정확히 3개만 반환해 (다른 텍스트는 없이):
[
  {
    "title": "아이디어 이름 (짧고 임팩트있게)",
    "description": "어떻게 작동하는지, 어떤 기능이 있는지 1-2문장"
  },
  ...
]`;

    try {
      var response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 800,
          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        var errorText = await response.text();
        console.error("API 에러:", response.status, errorText);
        return null;
      }

      var data = await response.json();
      var content = data.content[0].text;

      // JSON 배열 파싱
      var jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("JSON 배열을 찾을 수 없습니다:", content);
        return null;
      }

      var ideas = JSON.parse(jsonMatch[0]);

      // 정확히 3개만
      if (ideas.length > 3) {
        ideas = ideas.slice(0, 3);
      }

      return ideas;
    } catch (error) {
      console.error("생성 중 오류:", error);
      return null;
    }
  }

  return {
    setApiKey: setApiKey,
    generateIdeas: generateIdeas
  };
})();
