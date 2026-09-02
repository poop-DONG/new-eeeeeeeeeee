/* ==================== Claude API를 이용한 경험 분석 ==================== */

// API 설정
var Analyzer = (function() {
  var apiKey = null;
  var apiEndpoint = "https://api.anthropic.com/v1/messages";

  function setApiKey(key) {
    apiKey = key;
  }

  /**
   * 사용자의 경험 문장을 Claude로 분석
   * 반환: { targets: [], actions: [], factors: [], whens: [], wheres: [] }
   */
  async function analyze(experienceText) {
    if (!apiKey) {
      console.error("API 키가 설정되지 않았습니다.");
      return null;
    }

    var prompt = `사용자가 겪은 불편한 경험을 육하원칙 5개 요소로 분석해줘:

경험: "${experienceText}"

다음 5가지를 추출하고, 각각 JSON 배열로 반환해줘.
각 요소당 1-2개씩만 선택해 (최대 2개).
목록에 있는 정확한 단어를 사용해야 해:

1. WHO (대상): ${JSON.stringify(TARGETS.map(t => t.n).slice(0, 20))}... (총 113개)
2. WHAT (행동): ${JSON.stringify(ACTIONS.map(a => a.n).slice(0, 15))}... (총 81개)
3. WHY (걸림돌): ${JSON.stringify(FACTORS.map(f => f.n).slice(0, 15))}... (총 111개)
4. WHEN (시간): ${JSON.stringify(WHENS.map(w => w.n).slice(0, 10))}... (총 24개)
5. WHERE (장소): ${JSON.stringify(WHERES.map(p => p.n).slice(0, 15))}... (총 37개)

JSON 응답만 반환하되, 절대 목록에 없는 단어를 쓰지 마:
{
  "targets": ["대상1", "대상2"],
  "actions": ["행동1", "행동2"],
  "factors": ["걸림돌1", "걸림돌2"],
  "whens": ["시간1"],
  "wheres": ["장소1"]
}`;

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
          max_tokens: 500,
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

      // JSON 파싱
      var jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("JSON을 찾을 수 없습니다:", content);
        return null;
      }

      var result = JSON.parse(jsonMatch[0]);
      return result;
    } catch (error) {
      console.error("분석 중 오류:", error);
      return null;
    }
  }

  return {
    setApiKey: setApiKey,
    analyze: analyze
  };
})();
