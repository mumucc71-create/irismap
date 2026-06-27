# 홍채 맵핑 자동화 프로토타입

구글시트 `홍채DB`의 기준 데이터를 바탕으로 `기준 홍채지도`, `우안 사진`, `좌안 사진`을 함께 관리하는 웹앱입니다.

## 실행

더블클릭 실행:

```text
홍채맵핑앱 실행.bat
```

수동 실행:

```powershell
C:\Users\KYH\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe -m http.server 8000 --bind 127.0.0.1
```

접속 주소:

```text
http://127.0.0.1:8000
```

## 사용 흐름

1. `기준지도`로 홍채 종합 지도 이미지를 올립니다.
2. `좌우 사진 2장`으로 홍채 사진 2장을 한 번에 올립니다.
3. 사용자가 알려준 촬영 특성을 반영해 기본값은 `첫 번째 사진=우안`, `두 번째 사진=좌안`입니다.
4. 실제 배정이 반대로 보이면 `좌우 배정 바꾸기`를 누릅니다.
5. 우안/좌안 카드를 선택해서 각각의 원 위치를 보정하고 마커를 찍습니다.
6. `결과 JSON`으로 양쪽 눈의 마커와 보정값을 저장합니다.

## 샘플 파일

이번에 공유한 이미지는 테스트용으로 [samples](samples) 폴더에 복사했습니다.

- `reference-chart.png`: 기준 홍채지도
- `iris-first-assigned-right.png`: 첫 번째 홍채 사진, 기본 우안 배정
- `iris-second-assigned-left.png`: 두 번째 홍채 사진, 기본 좌안 배정

## 데이터

기준 데이터는 [data/iris-map.json](data/iris-map.json)에 들어 있습니다.

- `홍채지도우안DB`
- `홍채지도좌안DB`
- `패턴DB`
- `위험도DB`

의료 진단용이 아니라, 구글시트 기준의 참고용 위치 맵핑 도구입니다.
